# Manual do AutoForge atual — AutoFV1

Para editar o servidor do Wartune Legend, use `arena.cmd java focus` para localizar o método, seus chamadores e caminhos até os testes. O guia inclui o índice já gerado, o exemplo da campanha 1105 e os comandos de atualização. [Mapa de chamadas Java](java-semantic/README.md).

Atualizado em 11/11/2026 para a cópia `C:\Users\WinKGB\Desktop\AutoFV1`.

**Etapa adicional concluída: Radar Universal AST.** Além das três melhorias de campanhas, esta cópia agora oferece `arena.cmd universal`: receitas estruturais para Java, JavaScript, TypeScript, Python, Go e C#, cache por hash, relatórios SARIF e prévias de correção. O [manual completo do radar](universal/README.md) explica instalação, varredura de qualquer projeto coberto, criação de receitas e limites. Use `arena.cmd universal help` ou `npm run universal -- help`.

Este manual reúne as entradas existentes e as três novas melhorias de campanhas. O AutoForge é um conjunto de ferramentas de investigação, extração, comparação e organização de evidências para o Arena. Cada camada tem uma entrada própria. Encontrar uma regra no código, compilar um teste e observar o jogo são verificações diferentes.

## 1. Preparação no Windows

Abra PowerShell e execute:

```powershell
Set-Location 'C:\Users\WinKGB\Desktop\AutoFV1'
node --version
npm --version
$client = 'D:\C\WartuneUltra\client-qa-java-v1'
$backend = 'D:\C\WartuneUltra\java-source\java-v1'
$v097 = 'D:\C\WartuneUltra\V097'
$env:AUTOFORGE_CLIENT_ROOT = $client
$env:AUTOFORGE_BACKEND_ROOT = $backend
$saida = Join-Path $PWD ('entregas\manual-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
.\arena.cmd help
```

Use Node 22 ou superior. Extração com compilação e testes Java exige JDK 21 e `javac` acessível; as novas ferramentas de campanhas usam somente Node, sem instalação de pacotes npm. O backend acima é um exemplo local de **fonte**, não uma afirmação de que esse checkout corresponde ao servidor ativo. Confira qual checkout faz parte da tarefa.

O diretório em `--out` normalmente deve ser novo. Reutilize `$saida` como pasta-pai e escolha subpastas diferentes para cada operação. Em outra execução, recalcule `$saida`. Coloque aspas em caminhos com espaços. Nos exemplos abaixo, arquivos com nomes como `CONTRATO.json` e `OBSERVACAO.json` precisam ser produzidos/revisados para o caso; não são arquivos criados automaticamente só por aparecerem no comando.

### Qual entrada usar?

| Entrada | O que abre |
| --- | --- |
| `.\arena.cmd` / `npm run arena --` | Consultas ao cliente/Java, saúde e as três melhorias de campanhas |
| `.\autoforge.cmd` | Core: equivale a `node run.mjs`, não ao Studio |
| `npm run studio --` | `studio/autoforge.mjs`: fluxo, captura, diagnóstico e contratos |
| `npm run omega --` | Investigação estática orientada a uma ação |
| `npm run next --` | Drift, lacunas, calibração, estatística e pacotes |
| `npm run items --` | Itens, cenários, coleta de logs e incidentes |
| `npm run gameplay --` | Quests, mapas, batalhas, projeções e lojas |
| `npm run learning --` | Registro de capacidades e cápsula de conhecimento |
| `npm run inspect/seek/impact/opmap/memory -- ...` | Use **um nome por vez**, conforme as seções abaixo |

Prefira `help` nos módulos Studio, Items, Gameplay e Learning: nem todos aceitam `--help` isolado. O apêndice reproduz a ajuda das entradas atuais.

## 2. Fluxo recomendado para o Arena

1. Identifique a ação e a versão das fontes. Se o problema for conexão, execute `arena.cmd saude`.
2. Gere uma missão por opcode ou uma investigação OMEGA. Localize o primeiro ponto divergente entre pedido, decoder, regra, persistência, resposta e interface.
3. Consulte tabelas e fontes de referência. Para progressão, use as três melhorias descritas nas seções 4–6.
4. Reproduza o defeito em teste isolado antes da mudança. Preserve os fluxos existentes e as restrições independentes, como nível, energia e inventário.
5. Depois da correção, compile/teste no projeto Java usando sua configuração real. Registre revisão, ambiente e artefatos. Compare a regressão e só então siga o procedimento de implantação do projeto.
6. Para afirmar funcionamento no jogo, observe resposta, interface, estado persistido e relogin na versão implantada. Guarde o resultado com hashes e identidade do teste.

## 3. Arena: funções que já existiam

```powershell
.\arena.cmd saude
.\arena.cmd acao --opcode C_STAR_COMPOSE
.\arena.cmd mensagem --mensagem StarComposeReqMsg
.\arena.cmd tabela --tabela t_s_campaign --campo CampaignId --valor 1105
.\arena.cmd missao --opcode C_STAR_COMPOSE --backend $backend --v097 $v097 --out "$saida\missao"
Get-Content "$saida\missao\ARENA.md"
```

`saude` não recebe parâmetros: consulta HTTP local na porta 19090, TCP MySQL na 3306 e listeners. `UP` significa a condição de saúde observada, não homologação de gameplay. `acao` mostra declaração e pontos de uso; nomes ou números podem ter mais de um candidato. `mensagem` extrai os campos Protobuf reconhecidos. `missao` cruza ação, contrato, Java, referências e testes candidatos; escreve `ARENA.md` e `evidencia.json`.

Em `tabela`, `--arquivo` é o **nome lógico do catálogo**, como `t_s_pack`, e `--tabela` é a tabela interna. Essa consulta antiga continua com seu formato suportado de array, inclui contagem total e limita a amostra a 20 correspondências. Nos **novos comandos de campanhas**, `--arquivo` significa **caminho completo de um JSON** e aceita também mapas de registros. Essa diferença é intencional para manter a interface antiga.

Referência: [guia Arena backend](docs/ARENA_BACKEND.md).

## 4. Nova melhoria 1: auditoria integral de campanhas

Resolve a leitura acidental de uma raiz JSON como se ela fosse uma única campanha e organiza a revisão dos vínculos.

```powershell
.\arena.cmd campanhas-auditar --client $client --esperadas 145 --out "$saida\auditoria"
Get-Content "$saida\auditoria\ARENA.md"
```

Para auditar um export separado:

```powershell
.\arena.cmd campanhas-auditar --arquivo 'C:\CAMINHO\campanhas-exportadas.json' --esperadas 145 --out "$saida\export-audit"
```

Aceita array direto, `{ "t_s_campaign": [...] }`, objeto de registros por chave, mapa dentro de `t_s_campaign`, wrappers únicos `rows/data/records` e registro único com `CampaignId`. Confere todos os registros, sem descartar silenciosamente linhas inválidas. Os três campos `CampaignId`, `PreCampaignId` e `NextCampaignId` são obrigatórios; IDs são inteiros seguros, com zero reservado a ausência de pré/próximo. O campo original, a chave de origem e o hash do arquivo são preservados.

`--esperadas` é opcional. Use uma contagem conhecida de uma fonte independente; 145 corresponde ao catálogo local observado nesta entrega, não é um número universal fixado no programa. Um catálogo legítimo com outra quantidade deve ser avaliado com sua própria contagem. O limite desta ferramenta é 2000 campanhas e 32 MiB por arquivo; exceder o limite recusa a análise.

| Resultado | Interpretação |
| --- | --- |
| `NO_STRUCTURAL_FINDINGS` | Nenhum achado nas verificações estruturais implementadas |
| `REVIEW_REQUIRED` | Vínculos não recíprocos ou ciclos; investigar a semântica antes de mudar dados |
| `INVALID_DATA` | Contagem divergente, campos inválidos, IDs duplicados ou referência inexistente |

O JSON contém `coverage.rawRows`, `validRows`, `uniqueIds`, `expectedRows`, `shape`, `counts` e todos os `findings`. A cobertura descreve a leitura; os achados descrevem o grafo. Pré/próximo não recíprocos podem representar ramificações opcionais. A ferramenta não reescreve `t_s_campaign`.

Na verificação de 11/11/2026: **145 registros, 145 IDs únicos, 38 achados para revisão, zero erros de estrutura/referência**. Reexecute para obter o estado atual.

## 5. Nova melhoria 2: comparação de regras de desbloqueio

Mostra exatamente o estado que diferencia duas regras, em vez de tratar diferenças de campos como bugs confirmados.

```powershell
.\arena.cmd campanhas-comparar --client $client --esperadas 145 --regra pre --campanha 1105 --concluidas 1103 --out "$saida\caso-1105"
```

Nesse cenário, `1104` não está concluída. O modelo `pre` recusa 1105; a referência do comparador permite por `NextCampaignId` de 1103. O resultado esperado é `MODEL_DIFFERENCE`, com `reference.reason = NEXT_FROM_COMPLETED` e `candidate.reason = PREDECESSOR_REQUIRED`.

Para comparar o modelo com a alternativa implementada:

```powershell
.\arena.cmd campanhas-comparar --client $client --regra pre-ou-next --campanha 1105 --concluidas 1103 --out "$saida\caso-1105-modelo"
```

Para percorrer os cenários gerados de todas as campanhas e anexar fontes para revisão:

```powershell
$javaCampaign = Join-Path $backend 'apps\game-server\src\main\java\com\wartuneultra\server\gameplay\CampaignRunService.java'
.\arena.cmd campanhas-comparar --client $client --regra pre --referencia "$v097\campaign-state.js" --java $javaCampaign --out "$saida\paridade"
```

Sem `--campanha`, o comparador usa os cenários da suíte inteira. Com `--campanha`, `--concluidas 1103,1104` informa o conjunto completo de campanhas concluídas nesse caso; `--concluidas nenhuma` representa o conjunto vazio. `--liberadas 1105` representa o estado `unlocked` explícito. `--concluidas` e `--liberadas` exigem uma campanha alvo. Estado com IDs inexistentes é recusado; alvo inexistente é um caso de recusa esperado.

As regras são:

| Regra | Condição para passar no bloqueio de progressão |
| --- | --- |
| `pre` | Sem predecessor, ou predecessor concluído |
| `pre-ou-next` | Sem predecessor, predecessor concluído, alvo explicitamente liberado, ou alguma campanha concluída aponta ao alvo por `NextCampaignId` |

O modelo de referência é `pre-ou-next`. A opção `--regra` escolhe o **modelo candidato declarado**, não detecta automaticamente o comportamento do backend. `--referencia` e `--java` anexam caminhos, hashes, linhas e trechos relevantes. Comentários com nomes de campos não viram prova de execução. `NO_MODEL_DIFFERENCE` significa que os modelos não diferiram nos casos testados; continua `runtime: UNVERIFIED`.

O recorte é exclusivamente o bloqueio por progressão. Nível mínimo, energia, tentativas, regras especiais de mapas, recompensa e relogin continuam exigindo testes próprios. Na fonte Java lida nesta entrega já havia um helper verificando `NextCampaignId`; isso não identifica qual JAR está em execução.

## 6. Nova melhoria 3: suíte de regressão e conferência antes/depois

### Gerar a suíte

```powershell
.\arena.cmd campanhas-regressao --client $client --esperadas 145 --out "$saida\regressao"
```

Produz:

- `suite.json`: catálogo/hash, recorte e casos com resultado esperado;
- `run-cases.mjs`: executor de um adapter escolhido explicitamente pelo operador;
- `ARENA.md`: resumo da suíte.

Para cada campanha, gera estado vazio, predecessor concluído, cada origem por `NextCampaignId`, própria campanha concluída, liberação explícita e conclusão alheia quando disponível. Acrescenta alvo inexistente. Estados idênticos são deduplicados. No catálogo local desta entrega foram gerados **649 casos**. Isso cobre cenários do bloqueio de progressão; não enumera todas as combinações de estado de um jogador.

### Experimentar o fluxo sem conectar ao servidor

O adapter incluído em `examples/campaigns/model-adapter.mjs` executa somente modelos. Este exemplo demonstra a ferramenta e **não serve como evidência de correção do Java**:

```powershell
$catalogo = (Get-ChildItem -LiteralPath "$client\res\release\config" -Filter 't_s_campaign-*.json').FullName
# O catálogo deve ter um único candidato. Se houver vários, selecione o caminho exato.
$env:CAMPAIGN_CATALOG = $catalogo
$env:CAMPAIGN_MODEL = 'pre'
node "$saida\regressao\run-cases.mjs" '.\examples\campaigns\model-adapter.mjs' "$saida\regressao\antes.json" 'modelo-pre' 'demonstracao-offline'
$env:CAMPAIGN_MODEL = 'pre-ou-next'
node "$saida\regressao\run-cases.mjs" '.\examples\campaigns\model-adapter.mjs' "$saida\regressao\depois.json" 'modelo-pre-ou-next' 'demonstracao-offline'
.\arena.cmd campanhas-regressao --client $client --suite "$saida\regressao\suite.json" --antes "$saida\regressao\antes.json" --depois "$saida\regressao\depois.json" --out "$saida\resultado-regressao"
```

O resultado esperado é `RED_GREEN_RECORDED`, sempre acompanhado do limite de evidência. Não é preciso deploy para rodar essa demonstração.

### Conectar um teste real

Implemente seu próprio módulo `.mjs` exportando:

```javascript
export async function enterCampaign({ campaignId, completed, unlocked }) {
  // 1. Restaurar uma fixture/conta de teste isolada para ESTE caso.
  // 2. Definir exatamente completed/unlocked; não acumular estado entre casos.
  // 3. Chamar o teste/adapter real do serviço e aguardar a resposta.
  // 4. Retornar true/false, ou { allowed: true/false }, para a regra de progressão.
  // Erros de infraestrutura devem lançar exceção, nunca virar false.
  throw new Error('Conecte aqui seu teste real; este esqueleto não executa o Java.');
}
```

O runner passa uma cópia independente do input e não entrega o resultado esperado ao adapter. Executa sequencialmente e registra exceções como erros. Configure timeouts no adapter para chamadas externas. O runner não prepara banco, não compila Java e não inicia serviços; esses passos pertencem ao ambiente de teste existente. Para testar a entrada completa, prepare nível, energia e demais pré-condições para não confundir outra recusa com o bloqueio investigado. Não implemente o adapter copiando a fórmula esperada se a intenção for testar o backend.

Execute o mesmo conjunto contra as revisões antes e depois:

```powershell
node "$saida\regressao\run-cases.mjs" 'C:\TESTES\adapter-real.mjs' "$saida\regressao\antes-real.json" 'REVISAO_ANTES' 'bench-isolado'
# Aplicar e compilar a correção no ambiente de teste real, seguindo o projeto Java.
node "$saida\regressao\run-cases.mjs" 'C:\TESTES\adapter-real.mjs' "$saida\regressao\depois-real.json" 'REVISAO_DEPOIS' 'bench-isolado'
.\arena.cmd campanhas-regressao --client $client --suite "$saida\regressao\suite.json" --antes "$saida\regressao\antes-real.json" --depois "$saida\regressao\depois-real.json" --out "$saida\veredito-real"
```

`REVISAO_ANTES/DEPOIS` devem identificar o código realmente testado. O ambiente e `testId` devem coincidir. O adapter de demonstração usa rótulos de modelo por ser apenas uma fixture. O hash registrado cobre o arquivo de entrada do adapter, não todas as dependências importadas nem o serviço remoto; guarde também commit, hash do JAR, logs de build/teste e identidade de implantação nos recursos existentes de evidência.

### O que a conferência exige

- Catálogo e suíte atuais, incluindo hash e conteúdo esperado; não altere o gabarito para fazer o teste passar.
- Todos os casos, exatamente uma vez, com `allowed` booleano; erros, duplicações e casos faltantes são recusados.
- Antes: pelo menos um caso que deveria liberar por `NextCampaignId` foi recusado. Falha somente em `unlocked` explícito não reproduz esse incidente.
- Depois: todos os casos passam, incluindo recusas esperadas; um sucesso indiscriminado também falha.
- Revisões diferentes e ambiente/identificador de teste compatíveis.

| Resultado | Significado |
| --- | --- |
| `RED_GREEN_RECORDED` | Registros completos reproduzem a falha por Next antes e passam depois |
| `RED_NOT_REPRODUCED` | O conjunto anterior não demonstra a falha investigada |
| `GREEN_FAILED` | Ainda existem divergências depois |
| Erro no comando | Evidência inválida, incompleta, incompatível ou fonte alterada |

O validador verifica os registros fornecidos; não autentica quem os produziu nem confirma compilação/deploy. O runner recusa sobrescrever um arquivo de resultados. Use outro nome para uma nova rodada. Mudar o catálogo exige gerar nova suíte e novas observações.

### Códigos de saída dos três comandos novos

`0`: sem achado bloqueante no recorte, suíte gerada ou vermelho/verde registrado. `2`: dados inválidos, achado para revisão, diferença de modelos ou regressão não confirmada. `1`: erro de uso/leitura/evidência. Consulte `$LASTEXITCODE` imediatamente após o comando. Um `2` da auditoria com relatório gerado é uma indicação de revisão, não uma falha de leitura.

## 7. OMEGA: investigação por ação e comparação estática

```powershell
node omega.mjs focus --client $client --backend $backend --action C_STAR_COMPOSE --out "$saida\omega"
node omega.mjs verify --client $client --backend $backend --action C_STAR_COMPOSE --out "$saida\omega"
node omega.mjs radar --client $client --backend $backend --out "$saida\radar"
```

Cria execuções em `runs/` e atualiza `LATEST_MISSION.md/json` no workspace escolhido. Diferentemente das saídas que exigem pasta nova, o workspace OMEGA aceita sucessivas execuções. `verify` refaz verificações estáticas e compara snapshots compatíveis; não é teste de gameplay. Use `--opcode ID` quando precisar fixar o opcode investigado. Leia [OMEGA_README.md](OMEGA_README.md).

## 8. Inspect, Seek, Impact, OpMap e Memory

```powershell
node seek/autoforge.mjs search $backend 'campaign predecessor completed' --top 5
node inspect/autoforge.mjs inspect $javaCampaign --symbol predecessorDone --project $backend --counterpart $v097 --out "$saida\inspecao"
node impact/autoforge.mjs impact $javaCampaign --project $backend --symbol predecessorDone --depth 2 --json
node opmap/autoforge.mjs map --server $backend --client $client --json
node memory/autoforge.mjs add 'Campanhas: distinguir PreCampaignId, NextCampaignId e estado unlocked; conferir fontes atuais.' --kind licao --tags campaign,progressao --store "$saida\memoria.jsonl"
node memory/autoforge.mjs query 'progressao' --store "$saida\memoria.jsonl"
node memory/autoforge.mjs export "$saida\memoria.md" --store "$saida\memoria.jsonl"
```

Seek localiza candidatos; Inspect detalha arquivo/símbolo, chamadas e contrapartes; Impact mostra dependências candidatas; OpMap cruza números em contexto de protocolo. Memory armazena notas locais: uma nota não se torna teste aprovado. `--all` no OpMap inclui números sem contexto de protocolo e aumenta ruído. Guias locais: [Inspect](inspect/README.md), [Seek](seek/README.md), [Impact](impact/README.md), [OpMap](opmap/README.md), [Memory](memory/README.md).

## 9. Studio: fluxo completo, observação e diagnóstico

```powershell
node studio/autoforge.mjs extract-flow --client $client --backend $backend --action C_STAR_COMPOSE --out "$saida\fluxo"
npm run flow-console -- --package "$saida\fluxo"
```

O console abre um servidor local de leitura do pacote e imprime a URL; finalize com Ctrl+C. Consulte [ACTION_FLOW_ARENA.md](docs/ACTION_FLOW_ARENA.md) para o conteúdo do pacote e as limitações de AST/fluxo.

Para observar um navegador que já tenha CDP local habilitado, use sua URL real:

```powershell
node studio/autoforge.mjs record --cdp http://127.0.0.1:9222 --page-url http://127.0.0.1:5173/index.html --seconds 30 --out "$saida\captura"
node studio/autoforge.mjs diagnose --capture "$saida\captura" --out "$saida\diagnostico"
node studio/autoforge.mjs replay --capture "$saida\captura" --out "$saida\plano-replay"
```

`record` conecta ao navegador existente. `diagnose` pode receber `--context causal-context.json` e `--server-log ARQUIVO`. `replay` cria um plano; não joga automaticamente. `--capture-actions` é opt-in para capturar ações. Use identidade real com `--commit` e `--environment` quando disponível.

Outras operações: `generate --contract` gera a implementação de um contrato revisado; `compare --reference --candidate` compara registros; `audit --action` confere invariantes; `incident-replay --cases` organiza a primeira divergência; `bridge/import` transportam evidências pelos logs; `bundle` combina operações. A sintaxe completa está no apêndice. Formatos e exemplos: [Studio](docs/STUDIO.md), [contratos](docs/contracts.md), [equivalência](docs/equivalence.md), [captura](docs/flight-recorder.md), [incident replay](docs/INCIDENT_REPLAY.md).

## 10. Itens, logs e incidentes

```powershell
node studio/items/autoforge.mjs index --client $client --out "$saida\itens"
node studio/items/autoforge.mjs search --index "$saida\itens\item-index.json" --query gema --out "$saida\busca-itens"
node studio/items/autoforge.mjs explain --index "$saida\itens\item-index.json" --id ID_REAL --client $client --out "$saida\item-detalhe"
node studio/items/autoforge.mjs scenarios --index "$saida\itens\item-index.json" --out "$saida\cenarios-itens"
node studio/items/autoforge.mjs logs --file 'C:\CAMINHO\SERVER.log' --seconds 30 --from end --out "$saida\logs"
node studio/items/autoforge.mjs incidents --capture "$saida\logs" --index "$saida\itens\item-index.json" --out "$saida\incidentes"
```

Substitua `ID_REAL` por um ID retornado na busca. `scenarios` aceita contratos e fontes revisadas; sem contrato suficiente, não deduz o efeito completo do item. O coletor lê somente o arquivo informado e acompanha alterações durante o tempo escolhido. `log-bundle` e `recover-logs` empacotam/recuperam registros via logs do GitHub. Consulte [ITEMS_LOGS_START.md](docs/ITEMS_LOGS_START.md), [ITEM_CATALOGS.md](docs/ITEM_CATALOGS.md), [ITEM_SCENARIOS.md](docs/ITEM_SCENARIOS.md) e [SERVER_LOG_CAPTURE.md](docs/SERVER_LOG_CAPTURE.md).

## 11. Gameplay: quests, mapas, batalhas e lojas

```powershell
node studio/gameplay/autoforge.mjs all --client $client --backend $backend --out "$saida\gameplay"
node studio/gameplay/autoforge.mjs map-audit --atlas "$saida\gameplay\world-atlas.json" --client $client --out "$saida\map-audit"
```

Use `quests`, `maps` ou `shops` no lugar de `all` para uma família. Os atlas registram catálogos, referências e cobertura. Os validadores consomem observações e contratos explícitos:

| Comando | Entradas principais |
| --- | --- |
| `quest-check` | `--atlas quest-atlas.json --quest-id ID --evidence RECORD.json --bindings ARRAY.json` |
| `map-check` | `--atlas world-atlas.json --journey RECORD.json`, bindings quando necessários |
| `map-projection` | `--atlas world-atlas.json --projection RECORD.json` |
| `map-audit` | Atlas; manifesto/evidências opcionais para observar etapas do fluxo |
| `battle-check` | Atlas, contrato, descritor de observação, raiz de evidências, cliente e commit esperado |
| `shop-check` | `--atlas shop-atlas.json --purchase RECORD.json` |

Todos exigem `--out` novo. Para usar um snapshot de backend na validação, forneça `--backend` e `--backend-report`; uma fonte alterada invalida planos antigos. Os novos comandos de campanhas complementam os atlas, sem substituí-los. Guias: [GAMEPLAY_START.md](docs/GAMEPLAY_START.md), [quests](docs/GAMEPLAY_QUESTS.md), [mapas](docs/GAMEPLAY_WORLD.md), [lojas](docs/GAMEPLAY_SHOPS.md), [auditoria de mapas](docs/MAP_AUDIT_MEMORY.md).

## 12. Learning: capacidades revisadas e transferência de conhecimento

```powershell
node studio/learning/autoforge.mjs record --registry 'C:\REGISTRO\capacidades' --event 'C:\EVIDENCIAS\EVENT.json' --expected-version 0 --evidence-root 'C:\EVIDENCIAS'
node studio/learning/autoforge.mjs inspect --registry 'C:\REGISTRO\capacidades' --out "$saida\registro"
node studio/learning/autoforge.mjs capsule --registry 'C:\REGISTRO\capacidades' --context 'C:\EVIDENCIAS\CONTEXT.json' --evidence-root 'C:\EVIDENCIAS' --out "$saida\capsula"
```

O evento deve seguir o schema documentado em [MAP_AUDIT_MEMORY.md](docs/MAP_AUDIT_MEMORY.md). `--expected-version 0` só serve para registro inicial vazio: use a versão atual nas próximas alterações. O fluxo é propor, avaliar, revisar, aprovar e promover; uma revisão invalida aprovação anterior. Esse registro é diferente das notas livres de `memory/autoforge.mjs`.

## 13. Studio Next: drift e pacotes portáteis

```powershell
node studio/next/autoforge.mjs drift snapshot --client $client --out "$saida\cliente-atual.json"
node studio/next/autoforge.mjs drift diff --old 'C:\EVIDENCIAS\cliente-anterior.json' --new "$saida\cliente-atual.json" --out "$saida\drift"
node studio/next/autoforge.mjs gaps --discovery 'C:\EVIDENCIAS\discovery.json' --backend $backend --out "$saida\lacunas"
node studio/next/autoforge.mjs pack --root "$saida\auditoria" --files ARENA.md,evidencia.json --out "$saida\campanhas.afpack"
node studio/next/autoforge.mjs pack-verify --file "$saida\campanhas.afpack"
node studio/next/autoforge.mjs pack-unpack --file "$saida\campanhas.afpack" --out "$saida\pacote-recuperado"
```

`calibrate` usa amostras de headers e discovery; `stats` usa um cenário estatístico JSON. `pack-text/pack-recover` transportam o pacote por texto. Um pacote íntegro comprova integridade dos bytes, não sucesso do gameplay. Detalhes: [STUDIO_NEXT.md](docs/STUDIO_NEXT.md).

## 14. Core: extração de regras, geração e preparação

```powershell
node run.mjs --client $client --backend $backend --discover-only --out "$saida\descoberta"
node run.mjs --client $client --backend $backend --out "$saida\core"
node verify.mjs --from "$saida\core" --client $client
node prepare.mjs --from "$saida\core" --backend $backend --client $client
node integrate.mjs --from "$saida\core" --backend $backend
```

Os dois `run` são alternativas/execuções distintas: o primeiro investiga sem gerar/compilar Java; o segundo usa JDK 21 e os extratores suportados. O pacote contém discovery, classes, manifest, hashes, contexto causal, snapshot do backend e instruções de integração quando aplicáveis. `verify` confere integridade e fontes. `prepare` planeja a entrega no checkout escolhido. O último comando mostra prévia; acrescentar `--apply` instala as classes geradas no backend e é uma operação de escrita.

Integração não conecta sozinha todos os handlers, transações, protocolo e persistência. Não reutilize um snapshot após mudanças nas fontes. `--assessment` incorpora uma avaliação com procedência; `--editor-root NOME=CAMINHO` adiciona leitura opt-in de outra fonte. Os schemas e limites detalhados continuam em [README.md](README.md) e [PROMPT_ARENA.md](PROMPT_ARENA.md).

## 15. Plus, checagem de runtime e scripts locais

```powershell
node plus/plus.mjs scan --backend $backend --client $client --out "$saida\plus-scan"
node plus/plus.mjs gate --port 19090 --health-url http://127.0.0.1:19090/api/health --out "$saida\plus-gate"
powershell -NoProfile -File .\arena\verificar-jar.ps1 -Jar 'C:\CAMINHO\game-server.jar'
```

`scan` examina protocolo, wiring e SQL/migrations; uma consulta a esquema ativo é opt-in (`--live` ou `--live-schema`). Credenciais MySQL vêm de variáveis `PLUS_MYSQL_*`, não devem ir no comando ou no relatório. `gate` examina condições de runtime; pode conferir PID, arquivo JAR/hash e logs explicitamente informados. O verificador PowerShell de JAR confere layout Spring Boot, dependências e hash, sem iniciar o jogo.

As operações antigas de escrita continuam disponíveis: `plus apply --from ... --backend ... [--dry-run]` e `plus rollback --backend ... [--id ...]`. Leia a ajuda e confira o pacote/destino antes de aplicá-las. `--verify "COMANDO"` no apply executa o comando de verificação escolhido.

Também permanecem os scripts `arena/conferir-banco.ps1`, `arena/preparar-runtime.ps1` e `arena/iniciar-java.ps1`. Eles são utilitários locais ligados a caminhos/configuração específicos. `preparar-runtime.ps1 -Aplicar` altera o launcher para uma release com hash fixo; sem o switch faz conferência/prévia. `iniciar-java.ps1` inicia o launcher e grava logs. Não são um instalador universal nem parte das três melhorias; confira suas constantes antes de usá-los em outra máquina ou release.

### 15.1 Bancada Java existente: bench

O diretório `bench/` contém o runner local que já existia nesta cópia. Depende de MariaDB na porta 3307, Java de bancada na 19091, configuração DPAPI e JDK/caminhos fixos declarados nos scripts. Leia essas constantes antes de executar em outro ambiente. Exemplos:

```powershell
powershell -NoProfile -File .\bench\bench.ps1 status
powershell -NoProfile -File .\bench\bench.ps1 test CampaignJourneyBenchIT
powershell -NoProfile -File .\bench\bench.ps1 result ID_DO_JOB
powershell -NoProfile -File .\bench\bench.ps1 run CampaignJourneyBenchIT
```

`test` dispara o Maven em processo separado e informa um job em `entregas/bench-runs`; consulte `result` até existir `done.txt` e confira `maven.log`. `run` aguarda cerca de 22 segundos e retorna o resultado ou o ID para acompanhamento. `suite` executa a suíte do game-server; sem Docker exclui testes `*MariaDb*` e o resultado é parcial.

O comando antigo `redgreen` recebe um argumento no formato `'ClasseTeste;ArquivoJavaAtual;ArquivoJavaAntes'`. Ele troca temporariamente o arquivo Java, executa as duas fases e tenta restaurar o conteúdo atual com conferência de hash. Use em checkout de teste sem edição concorrente. Sua classificação antiga usa códigos de saída Maven: leia os logs para diferenciar erro de compilação/infraestrutura da asserção do defeito. A nova conferência de campanhas exige resultados booleanos por caso e não considera uma exceção de infraestrutura como reprodução válida.

`restart` encerra o PID da bancada e reconstrói/inicia o servidor de bancada. `active` e `progresso` são diagnósticos locais com PID/caminhos de logs fixos; confira sua atualidade antes de confiar no texto. `build-candidate.ps1` gera um JAR candidato com testes pulados e o copia para um caminho fixo; isso não comprova aprovação de testes. Os scripts `bench-child-*` são auxiliares chamados pelo runner, não precisam ser invocados diretamente.

Nenhum desses comandos de bancada foi executado nesta entrega das melhorias; a validação nova foi feita na ferramenta e em modelos offline.

## 16. Evidências, testes e solução de problemas

```powershell
npm test
node --test tests/campaigns.test.mjs
```

A suíte npm inclui os novos testes pelo padrão já existente `tests/*.test.mjs`. Teste de ferramenta aprovado não substitui teste de servidor. Casos ignorados devem ser reportados como ignorados, não aprovados.

O transporte Core `node ci-evidence.mjs recover RUN.log NOVA_PASTA` recupera evidências publicadas em logs com SHA-256. Flight Recorder, Items e Next têm seus próprios comandos de transporte. Use a ferramenta correspondente ao formato produzido.

Para converter um relatório JUnit já produzido em evidência identificada da ferramenta, existe `node record-validation.mjs --junit ARQUIVO.xml --out RELATORIO.json --commit SHA_COMPLETO --environment local`. Ele valida o JUnit e registra hash/contagens, não executa testes. O commit deve identificar o produtor real; não invente um SHA para uma pasta sem Git.

| Sintoma | Ação |
| --- | --- |
| `Use a new output directory` | Escolha outro `--out`; não apague a evidência anterior para esconder uma falha |
| Mais de um catálogo candidato | Selecione `--arquivo` exato nos comandos novos e confira a release |
| `COUNT_MISMATCH` | Confira a raiz/formato e a contagem independente antes de interpretar o grafo |
| `INVALID_ROW` / referência ausente | Consulte `rowKey`, campo e ID no JSON; resolva a origem antes de gerar suíte |
| `MODEL_DIFFERENCE` | Leia o cenário e confira a regra real nas fontes e em teste |
| `Fonte mudou` / suíte alterada | Gere novas evidências a partir das fontes atuais |
| Erro de adapter | Corrija infraestrutura/contrato; não converta erro em recusa esperada |
| `UNVERIFIED` | Falta prova para aquele escopo; consulte os campos de cobertura e limites |
| `javac` ausente | Configure JDK 21 para operações Java ou use investigação sem geração |
| Saúde boa, jogo falhando | Investigue fluxo/protocolo/estado; saúde não valida uma ação de gameplay |

## 17. Preservação nesta entrega

Nenhum comando existente foi substituído. As três novas entradas são adicionadas ao CLI Arena; o README recebeu apenas um acesso a este manual. Fontes do cliente, V097, backend, JAR e banco não são modificadas pelos comandos novos. O runner só executa código quando o operador fornece um adapter, que deve ser revisado conforme o ambiente de teste.

Uma cópia dos arquivos anteriores e seus hashes está em `_snapshots/campaign-improvements-20261111-201737`. O resumo de validação e os relatórios da entrega ficam em `entregas/campanhas-20261111-final`. O relatório de preservação distingue arquivos antigos alterados, ausentes e novos.

Pedido sugerido para o Arena:

> Leia MANUAL_AUTOFORGE_ATUAL.md. Use campanhas-auditar para conferir cobertura e vínculos; campanhas-comparar para localizar os estados que diferenciam as regras; campanhas-regressao para gerar a suíte e conferir resultados antes/depois. Valide as fontes atuais, trate o exemplo offline como demonstração e conecte o teste real por adapter isolado. Preserve todas as funcionalidades existentes e as restrições independentes de entrada. Registre o que foi observado em código, teste e runtime separadamente.

## Apêndice: ajuda das entradas atuais

Abaixo está a sintaxe obtida dos próprios CLIs nesta entrega. Os nomes de arquivos e IDs em maiúsculas são parâmetros a substituir. As entradas Core sem help completo foram documentadas na seção 14.

### run.mjs

~~~text
node run.mjs [--client CLIENT_ROOT] [--out OUTPUT] [--backend JAVA_V1] [--assessment REVIEW.json] [--editor-root NAME=PATH] [--discover-only]
Defaults: repository client; output beside repository. Node20+ and JDK21 for generation.
~~~

### plus/plus.mjs

~~~text
AutoForge Plus
  scan     --backend DIR [--client DIR] [--out DIR] [--base origin/main] [--live|--live-schema FILE]
           [--baseline FILE] [--required-s2c 150,301] [--critical-c2s 1,2] [--generated-rel autoforge/v2] [--strict]
  gate     [--config plus.runtime.json] [--host H] [--port N] [--admin-port N] [--health-url URL] [--pid N|--pid-file F]
           [--jar F --jar-sha256 H] [--log-file F] [--baseline FILE] [--out DIR]
  apply    --from DELIVERY --backend DIR [--verify "cmd"] [--dry-run] [--state DIR]
  rollback --backend DIR [--id ID] [--state DIR]
MySQL credentials only through env: PLUS_MYSQL_HOST/PORT/USER/PASSWORD/DATABASE.
~~~

### studio/autoforge.mjs

~~~text
AutoForge Studio — evidence-led tools (Node22 / Java21 for generated-code tests)
  extract-flow --client CLIENT_DIR --action ACTION_NAME [--backend JAVA_DIR] [--opcode ID] --out NEW_DIR
  record     --cdp http://127.0.0.1:9222 --page-url http://127.0.0.1:5173/index.html --out NEW_DIR
             [--seconds 30] [--capture-actions] [--commit SHA] [--environment windows-dev]
  diagnose   --capture DIR [--context causal-context.json] [--server-log FILE] --out NEW_DIR
  generate   --contract FILE [--backend JAVA_DIR] --out NEW_DIR
  compare    --reference ACTION.json --candidate ACTION.json --out NEW_DIR
  incident-replay --cases CASES.json [--evidence DIR] [--backend JAVA_DIR] --out NEW_DIR
  audit      --action ACTION.json [--rules RULES.json] --out NEW_DIR
  replay     --capture DIR [--required-s2c 113,115] --out NEW_DIR
  bridge     --root REPORT_DIR --files events.jsonl,capture-manifest.json [--out NEW_DIR]
  import     --log GITHUB_LOG --out NEW_DIR [--expected-sha256 HASH]
  bundle     --capture DIR [--context FILE] [--reference FILE --candidate FILE] [--contract FILE --backend DIR] --out NEW_DIR
The recorder attaches only to an existing browser with local CDP already enabled.
No command starts/stops the game, migrates SQL or deploys. Replay CLI creates a plan;
executing real actions uses the reviewed runReplay adapter API with explicit authorization.
~~~

### studio/next/autoforge.mjs

~~~text
AutoForge Studio Next (Node 22+)

Existing Studio commands: record, diagnose, generate, compare, audit, replay, bridge, import, bundle
New, read-only/safe output commands:
  drift snapshot --client CLIENT_DIR --out NEW_SNAPSHOT.json
  drift diff --old OLD.json --new NEW.json [--contracts-dir DIR] [--evidence FILE] --out NEW_DIR
  gaps --discovery discovery.json --backend JAVA_DIR [--capture STUDIO_CAPTURE_DIR] [--match REGEX] --out NEW_DIR
  calibrate --headers SAMPLES.json --discovery discovery.json --out NEW_DIR
  stats --input statistical-scenario.json --out NEW_DIR
  pack --root REVIEWED_DIR --files a.json,b.md --out NEW_FILE.afpack
  pack-verify --file FILE.afpack
  pack-unpack --file FILE.afpack --out NEW_DIR
  pack-text --file FILE.afpack --out NEW_FILE.txt
  pack-recover --file TEXT_LOG.txt --out NEW_FILE.afpack

No action executes SQL, deploys, restarts services or patches the client.
All output paths must be new; ambiguous/unsupported evidence stays UNVERIFIED.
~~~

### studio/items/autoforge.mjs

~~~text
AutoForge Items & Logs (feature branch, Node22+)
  index     --client CLIENT_DIR --out NEW_DIR
  search    --index item-index.json [--query NAME] [--id ID] [--offset N] [--limit N] --out NEW_DIR
  explain   --index item-index.json --id ID [--client CLIENT_DIR] --out NEW_DIR
  scenarios --index item-index.json [--contracts REVIEWED_ARRAY.json] [--sources SOURCES_ARRAY.json] --out NEW_DIR
  logs      --file SERVER.log --out NEW_DIR [--seconds 30] [--poll-ms 500] [--from end|start]
            [--commit BACKEND_SHA] [--environment windows-runner] [--test-id ID] [--jar-sha256 HASH]
  incidents --capture LOG_CAPTURE_DIR [--index item-index.json] [--context causal-context.json]
            [--response-contracts ARRAY.json] --out NEW_DIR
  log-bundle --capture LOG_CAPTURE_DIR [--index item-index.json] [--context FILE] --out NEW_DIR
  recover-logs --file GITHUB_RUN_LOG.txt --out NEW_DIR
All server access is opt-in read-only file observation. No service/process control, SQL,
browser interaction, migration, privilege elevation or deploy. Missing evidence stays UNVERIFIED.
~~~

### studio/gameplay/autoforge.mjs

~~~text
AutoForge Gameplay — three modules, read-only toward the game
  quests | maps | shops | all --client CLIENT_DIR [--backend JAVA_DIR] --out NEW_DIR
  quest-check --atlas quest-atlas.json --quest-id ID --evidence RECORD.json --bindings ARRAY.json [--client DIR] --out NEW_DIR
  map-check --atlas world-atlas.json --journey RECORD.json [--bindings ARRAY.json] [--client DIR] --out NEW_DIR
  map-projection --atlas world-atlas.json --projection RECORD.json --out NEW_DIR
  map-audit --atlas world-atlas.json [--manifest AUDIT.json --evidence-root DIR] [--client DIR] [--backend DIR --backend-report FILE] --out NEW_DIR
  battle-check --atlas world-atlas.json --contract RULES.json --observation ARTIFACT_DESCRIPTOR.json --evidence-root DIR --client DIR --expected-commit SHA --out NEW_DIR
  shop-check --atlas shop-atlas.json --purchase RECORD.json [--client DIR] --out NEW_DIR
  Checks optionally accept --backend DIR --backend-report backend-analysis.json to reject stale plans.
No SQL, grants, quest completion, browser actions, process control or deployment are performed.
~~~

### studio/learning/autoforge.mjs

~~~text
AutoForge learning — explicit review; no server changes
  record --registry NEW_OR_EXISTING_LEDGER --event EVENT.json --expected-version N [--evidence-root DIR]
  inspect --registry DIR --out NEW_DIR
  capsule --registry DIR --context CONTEXT.json --evidence-root DIR --out NEW_DIR
Actions: propose -> evaluate -> review -> approve -> promote. revise invalidates prior approval.
No automatic promotion, generated scripts, server access, SQL or deployment.
{"status":"HELP"}
~~~

### omega.mjs

~~~text
AutoForge OMEGA — single-command static investigation (Node >=22)
  node omega.mjs focus  --client CLIENT_DIR --backend JAVA_DIR --action ACTION [--opcode ID] [--out WORKSPACE]
  node omega.mjs verify --client CLIENT_DIR --backend JAVA_DIR --action ACTION [--opcode ID] [--out WORKSPACE]
  node omega.mjs radar  --client CLIENT_DIR --backend JAVA_DIR [--capture CAPTURE_DIR] [--match REGEX] [--out WORKSPACE]

Workspace: by default, a sibling of JAVA_DIR named autoforge-omega-workspace.
Outputs: runs/<unique-id>/OMEGA_MISSION.{md,json} and LATEST_MISSION.{md,json}.
These commands NEVER apply code, deploy, mutate the database, run gameplay, or certify runtime equivalence.
The 'verify' command reruns STATIC checks only; browser/JVM/DB/UI verification remains separate.
~~~

### inspect/autoforge.mjs

~~~text
AutoForge Deep Inspect 1.0

Uso:
  node inspect/autoforge.mjs inspect <FICHEIRO> [opções]
  node inspect/autoforge.mjs chain   <FICHEIRO> [opções]  (alias)

Opções:
  --symbol NOME         função/método alvo (a missão centra-se nele: corpo + callees + callers)
  --project DIR          indexa o projecto (callees resolvidos, callers, testes, tabelas sem CREATE)
  --counterpart DIR       (repetível) árvores para procurar contrapartes (cliente, referência, outro backend)
  --out DIR              pasta da missão (omissão: ./autoforge-inspect-workspace/<nome>-mission)
  --json                 imprime o inspection.json completo no stdout (sem escrever pasta)

Exemplos:
  node inspect/autoforge.mjs inspect src/StarService.java --symbol pick --project .
  node inspect/autoforge.mjs chain server/handler.js --symbol handleStarPick --project . --counterpart ../client --counterpart ../reference
~~~

### seek/autoforge.mjs

~~~text
AutoForge Seek 1.0

Uso: node seek/autoforge.mjs search <DIR> <consulta...> [--top N] [--json]
Ex.: node seek/autoforge.mjs search . "star pick sell gold" --top 5
~~~

### impact/autoforge.mjs

~~~text
AutoForge Impact 1.0

Uso: node impact/autoforge.mjs impact <FICHEIRO> --project <DIR> [--symbol NOME] [--depth N] [--json]
~~~

### opmap/autoforge.mjs

~~~text
AutoForge OpMap 1.0

Uso: node opmap/autoforge.mjs map --server <DIR> --client <DIR> [--all] [--json]
  --all inclui numeros sem contexto de protocolo (por omissao so contexto + constantes)
~~~

### memory/autoforge.mjs

~~~text
AutoForge Memory 1.0

Uso:
  node memory/autoforge.mjs add "texto" [--kind licao] [--tags a,b]
  node memory/autoforge.mjs query "consulta" [--top N]
  node memory/autoforge.mjs list | stats | export
  --store FICHEIRO (omissao: ./autoforge-memory/memory.jsonl)
~~~

### arena/autoforge.mjs

~~~text
AutoForge | consultas para o backend Java
arena.cmd campanhas-auditar [--arquivo JSON] [--esperadas N] [--out NOVA_PASTA]
arena.cmd campanhas-comparar [--regra pre|pre-ou-next] [--campanha ID --concluidas 1103] [--liberadas ID] [--referencia JS --java JAVA] [--out NOVA_PASTA]
arena.cmd campanhas-regressao --out NOVA_PASTA (gera suíte e runner de adapter)
arena.cmd campanhas-regressao --suite suite.json --antes antes.json --depois depois.json [--out NOVA_PASTA]
Campanhas: --client DIR ou --arquivo JSON; --esperadas N confere cobertura. Manual: MANUAL_AUTOFORGE_ATUAL.md.
arena.cmd saude   (Java e banco locais, relatório sanitizado)
arena.cmd acao --opcode NOME_OU_NUMERO
arena.cmd mensagem --mensagem NOME
arena.cmd tabela --tabela NOME [--arquivo CATALOGO] [--campo CAMPO --valor VALOR]
arena.cmd missao --opcode NOME_OU_NUMERO --backend DIR [--v097 DIR] [--mensagem NOME] [--tabela NOME ...] [--out NOVA_PASTA]
Todos aceitam --client DIR. O atalho Windows usa o cliente QA local como padrão.
Para reutilizar um checkout Java, defina AUTOFORGE_BACKEND_ROOT.
Saída JSON no terminal. Em missao, --out grava ARENA.md e evidencia.json.
~~~
