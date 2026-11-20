import { readFileSync, readdirSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const posix = path => path.replaceAll('\\', '/');
const PROTO_PREFIX_RE = /^(?:C|S|U|CH|L|G|C2S|S2C)_/;
const MAX_CATALOG_BYTES = 32 * 1024 * 1024;
const domains = {
  capacity: ['calculateAttrFightCapacity', 'calculatePlayerFightCapacity', 'calculateGuardFightCapacity', 'calculateRareWeaponFightCapacity', 'FightingCapacity'],
  attributes: ['calculateAttributes', 'physicalDefenseBase', 'magicDefenseBase', 'StrengthenValue', 'baseFightingCapacity'],
  forge: ['getIntensifuGold', 'getSuccessRate', 'checkCanIntensify', 'sendItemIntensify', 'getSellGold'],
  consume: ['ItemUseMsg', 'sendUseItem', 'Property1', 'stamina', 'consume'],
  quest: ['CondictionType', 'Para1', 'PreQuestId', 'QuestUpdated', 'QuestCondition'],
};

/** Static discovery only: presence of a table/symbol never proves a server feature. */
export function discover(clientRoot) {
  const root = realpathSync(resolve(clientRoot));
  const sources = [], warnings = [];
  function inside(path) {
    const rel = relative(root, realpathSync(path));
    if (rel === '..' || rel.startsWith('..\\') || rel.startsWith('../') || isAbsolute(rel)) throw Error('Source escapes client root');
  }
  function list(directory, pattern) {
    const path = join(root, directory);
    let entries;
    try { inside(path); if (lstatSync(path).isSymbolicLink()) return []; entries = readdirSync(path, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') { warnings.push(`Missing directory: ${directory}`); return []; } throw error; }
    return entries.filter(e => e.isFile() && !e.isSymbolicLink() && pattern.test(e.name)).map(e => posix(join(directory, e.name))).sort();
  }
  function load(path, kind) {
    const absolute = join(root, path);
    if (lstatSync(absolute).isSymbolicLink()) throw Error('Symlink source refused');
    inside(absolute);
    const bytes = readFileSync(absolute), sha256 = hash(bytes);
    sources.push({ path, sha256, bytes: bytes.length, kind });
    return { text: bytes.toString('utf8'), sha256, path };
  }
  function evidence(source, start, end) {
    return { path: source.path, sourceSha256: source.sha256,
      start: Buffer.byteLength(source.text.slice(0, start)), end: Buffer.byteLength(source.text.slice(0, end)),
      sha256: hash(Buffer.from(source.text.slice(start, end))) };
  }
  const bundles = list('js', /^bundle_release[^/.]*\.js$/);
  if (bundles.length !== 1) throw Error(`Expected exactly one main bundle_release*.js, found ${bundles.length}: ${bundles.join(', ')}`);
  const bundle = load(bundles[0], 'client-bundle');
  const candidates = {}, truncated = {};
  for (const [domain, terms] of Object.entries(domains)) {
    const hits = [];
    let count = 0;
    for (const term of terms) {
      let start = -1;
      while ((start = bundle.text.indexOf(term, start + 1)) !== -1) {
        count++;
        if (hits.length < 12) hits.push({ symbol: term, ...evidence(bundle, start, start + term.length),
          snippet: bundle.text.slice(Math.max(0, start - 80), Math.min(bundle.text.length, start + term.length + 240)),
          status: 'CANDIDATE_REQUIRES_REVIEW' });
      }
    }
    candidates[domain] = hits;
    truncated[domain] = Math.max(0, count - hits.length);
  }
  const rawOpcodes = [], seenOpcodes = new Set();
  const enumPattern = /\b[\w$]+\[\s*[\w$]+\.([A-Z][A-Z_0-9]*)\s*=\s*(\d+)\s*\]\s*=\s*["']\1["']/g;
  for (const match of bundle.text.matchAll(enumPattern)) {
    const key = `${match[1]}:${match[2]}`;
    if (seenOpcodes.has(key)) continue;
    seenOpcodes.add(key);
    rawOpcodes.push({ name: match[1], opcode: Number(match[2]),
      ...evidence(bundle, match.index, match.index + match[0].length), status: 'STATIC_ENUM_DIRECTION_UNCONFIRMED' });
  }
  const protoEnumCount = rawOpcodes.filter(o => PROTO_PREFIX_RE.test(o.name)).length;
  const opcodes = (protoEnumCount >= 20 ? rawOpcodes.filter(o => PROTO_PREFIX_RE.test(o.name)) : rawOpcodes).slice(0, 6000);
  const catalogs = [], master = new Map(), son = new Map(), combined = new Map(), effects = new Map();
  const bump = (map, key) => map.set(String(key), (map.get(String(key)) ?? 0) + 1);
  let itemRows = 0;
  for (const path of list('res/release/config', /^t_s_.*\.json$/)) {
    const abs = join(root, path);
    if (lstatSync(abs).size > MAX_CATALOG_BYTES) {
      warnings.push(`Skipped large catalog (>32 MiB): ${path}`);
      continue;
    }
    const source = load(path, 'catalog');
    let json;
    try { json = JSON.parse(source.text.replace(/^\uFEFF/, '')); } catch { warnings.push(`Invalid JSON: ${path}`); continue; }
    const tables = [];
    for (const [table, rows] of Object.entries(json)) {
      if (!Array.isArray(rows)) continue;
      const fields = new Set();
      for (const row of rows) if (row && typeof row === 'object' && !Array.isArray(row)) {
        for (const name of Object.keys(row)) fields.add(name);
        if (/^t_s_itemtemplate$/i.test(table)) {
          itemRows++; bump(master, row.MasterType ?? 'MISSING'); bump(son, row.SonType ?? 'MISSING');
          bump(combined, `${row.MasterType ?? 'MISSING'}/${row.SonType ?? 'MISSING'}`);
          if ('Property1' in row) bump(effects, row.Property1);
        }
      }
      tables.push({ table, rows: rows.length, fields: [...fields].sort() });
    }
    catalogs.push({ path, sha256: source.sha256, tables, status: 'DISCOVERED_NOT_IMPLEMENTED' });
  }
  const protoCandidates = [
    ...list('libs', /^protobuf-bundles[^/]*\.js$/),
    ...list('libs/min/release', /^protobuf-bundles[^/]*\.js$/),
  ];
  const uniqueProtoPaths = [...new Set(protoCandidates)].sort();
  const messages = [];
  for (const path of uniqueProtoPaths) {
    const source = load(path, 'protobuf-generated');
    for (const match of source.text.matchAll(/\b([A-Za-z_$][\w$]*)\.encode\s*=\s*function(?:\s+encode)?\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)\s*\{/g)) {
      const msgName = match[1], msgVar = match[2], writerVar = match[3];
      if (!/Item|Bag|Hero|Fashion|Pawn|Army|Store|Quest|Player|Consortia|Skill|Campaign|Equip|Gem|Battle/.test(msgName)) continue;
      const openBrace = source.text.indexOf('{', match.index);
      if (openBrace < 0) continue;
      let depth = 0, end = -1, inStr = null;
      const lim = Math.min(source.text.length, openBrace + 100000);
      for (let i = openBrace; i < lim; i++) {
        const ch = source.text[i];
        if (inStr) { if (ch === '\\') { i++; } else if (ch === inStr) { inStr = null; } continue; }
        if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end < 0) continue;
      const body = source.text.slice(match.index, end), fields = [];
      const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fRe = new RegExp(`${esc(writerVar)}\\.uint32\\((?:\\/\\*[^*]*\\*\\/)?(\\d+)\\)\\.(\\w+)\\(${esc(msgVar)}\\.(\\w+)`, 'g');
      for (const f of body.matchAll(fRe)) {
        const tag = Number(f[1]), type = f[2], name = f[3];
        const id = tag >>> 3, wireType = tag & 7;
        if (id > 0) fields.push({ id, wireType, type, name });
      }
      if (messages.length < 250 && fields.length > 0) messages.push({ name: msgName, fields,
        ...evidence(source, match.index, end), status: 'STATIC_SCHEMA_PARTIAL_NO_RUNTIME_CAPTURE' });
    }
  }
  const sortedCounts = map => Object.fromEntries([...map].sort(([a], [b]) => a.localeCompare(b, 'en')));
  return { schemaVersion: 'autoforge.discovery.v2.1', mode: 'static-read-only', spanConvention: 'UTF-8 byte offsets, end exclusive',
    sources: sources.sort((a, b) => a.path.localeCompare(b.path, 'en')), catalogs, candidates, opcodes, messages,
    itemCoverage: { status: 'DISCOVERED_NOT_IMPLEMENTED', rows: itemRows, byMasterType: sortedCounts(master),
      bySonType: sortedCounts(son), byMasterAndSonType: sortedCounts(combined), byProperty1: sortedCounts(effects),
      classification: 'Raw client discriminators only. Property1 semantics depend on item type and handler; no effect is assumed implemented.' },
    truncation: { candidates: truncated, opcodeLimit: 6000, messageLimit: 250 }, warnings,
    gaps: ['Candidate snippets are search hints, not a full call graph or AST.', 'Opcode direction and message pairing require sender/listener evidence.',
      'Protobuf fields are a partial static view; nested/repeated fields may require manual analysis.', 'Catalog presence does not establish backend behavior, persistence or deployment.'] };
}
