# AUTOFORGE ALFA FINAL

Entrega local de 13 de novembro de 2026. Abra **ABRIR AUTOFORGE.cmd** nesta pasta. O painel usa uma porta livre em 127.0.0.1 e guarda casos, propostas, revisões, experimentos e provas em `alfa/state`.

O trabalho começou pela cópia integral de AutoFV1 2.7.0-omega. Os 624 arquivos e 139.838.210 bytes da origem e do backup foram conferidos por SHA-256. No Alfa, os quatro arquivos herdados que receberam alterações são package.json, studio/tests/cli.test.mjs, arena/autoforge.mjs e arena/client.mjs. O backup inicial está em `C:/Users/WinKGB/Desktop/AutoFV1-backups/alfa-final-pre-20261113-021038`. O backup anterior ao feedback tem 1.836 arquivos verificados. [Conferência de integridade](alfa/evidence/integridade-apos-feedback.json).

**Para o Arena.** A revisão de protocolo encontrou e reproduziu uma falha no encoder Java do título. A proposta, as provas no cliente e no JAR e as instruções para revisão estão no [relatório de protocolo e validação](ARENA%20-%20Protocolo%20e%20validacao.md).

**Como começar**

1. Abra o painel e entre em **Laboratório** para consultar os resultados já executados.
2. Clique em **Ver causa do erro de estoque**. O caso mostra três execuções com valores persistidos 9, 5 e 9, ligadas à alteração de uma condição da bancada.
3. Abra **Wartune · expedição de C_BUILDING_INIT** para consultar o código e o log histórico da JVM. Há sete emissões do servidor correlacionadas ao pedido e à sessão. A hipótese de congelamento continua inconclusiva.
4. Abra **Laboratório · abrir catálogo UTF-8 com BOM**. A receita AST gerou uma proposta pontual. Um processo independente reproduziu SyntaxError, sucesso e SyntaxError nas três capturas. A versão proposta aceitou os dois formatos válidos e continuou rejeitando JSON inválido.
5. Em **Evidências e revisão**, baixe o pacote do caso para o Arena. A resposta importada deve citar os identificadores de hipótese e evidência do pacote vigente.
6. Abra **Wartune · contrato de títulos e repintura**. Consulte **Protocolo do cliente** para ver as variações do pedido, o campo no pacote e a condição de atualização da janela. Em **Laboratório**, procure **Título e aparência quando o poder de combate está ausente** para inspecionar a proposta Java e o diff.

**O que está implementado**

| Etapa solicitada | Capacidade entregue | Limite da prova |
|---|---|---|
| Auditoria | Leitura de código, reprodução de defeitos do próprio analisador e revisão independente | Os achados e as correções estão em alfa/evidence/AUDITORIA.md |
| Investigação causal | Oito etapas, evidências com hashes, hipóteses rivais, argumentos favoráveis e contrários, confiança e próximo experimento | Etapas sem observação ficam em aberto. Presença de uma resposta exige medidas adicionais para confirmar conteúdo e efeito |
| Revisão cruzada | Pacotes versionados, contestação, assinatura Ed25519 opcional para comentários, assinatura obrigatória para aplicar correção | A revisão independente realizada nesta entrega foi entre agentes Codex. A interface com Arena usa exportação e importação manual |
| Correções | Propostas AST, comparação de alternativas, pré-imagem exata, backup, revisão por outro autor, testes antes/depois e rollback | Aplicação confinada a alfa/lab. Cada domínio exige um validador confiável |
| Memória | Casos resolvidos ligados ao journal e hashes do código, validador e condições | Uma mudança de contexto torna a solução inaplicável até nova validação |
| Benchmark | Comparação com módulos reais da versão anterior, entradas compartilhadas, processos isolados, Java, regressões e recuperação | Bancadas construídas nesta tarefa. A generalização para incidentes inéditos permanece sem medição |

A configuração escolhida limita cada caso a seis tentativas, uma comparação a três capturas e cada busca de correções a oito propostas de até 512 KiB por arquivo. Os workers têm limite de memória, tempo e saída. Trabalhos e locks persistem em disco. A recuperação confere o encerramento do controlador e do worker.

**Resultados comparativos**

A bancada de diagnóstico tem 14 casos, incluindo oito defeitos observáveis, quatro controles e duas capturas insuficientes. Ambas as versões localizaram 8/8 fronteiras, confirmaram 7/8 mecanismos após a mesma intervenção e produziram 0/4 falsos positivos nos controles. Ambas suspenderam a conclusão nos dois casos parciais. Um caso de dependência externa continuou sem solução. Os módulos antigos receberam os mesmos valores esperados e observados. As intervenções são predefinidas. O relatório vigente está em `alfa/state/benchmarks/latest.json`, com o caminho da execução e seu COMPARACAO.md.

Na bancada Java, ambas corrigiram 2/3 defeitos, detectaram regressão em uma proposta e restauraram 3/3 versões anteriores, com recompilação e repetição dos oito checks em cada etapa. Foram usados fonte Java e motor safe-apply da base anterior, conferidos por hash. O resultado está em `alfa/state/benchmarks/java-latest.json`.

As taxas de acerto coincidiram nesta amostra. A evolução demonstrada está na integração das evidências, nas revisões, no controle de correção, na comparação de três tentativas e na consulta dessas operações pelo painel. Os tempos medidos correspondem a rodadas locais únicas. As bancadas tiveram zero chamadas a modelos externos e zero intervenções humanas durante a execução. O estudo Java exigiu três revisões prévias. Custo financeiro e custo de criação das bancadas permanecem sem medição.

**Demonstrações executadas**

- O navegador de teste aplicou uma proposta assinada pela interface, executou o mesmo validador sobre as versões anterior e posterior e restaurou exatamente os bytes originais. Quatro verificações passaram após a mudança. Prova em `alfa/evidence/ui/correcao-real.json`.
- O Chromium executou o componente de apresentação distribuído no cliente Wartune. Shift+H ocultou e restaurou o HUD, com igualdade dos pixels medidos na restauração. A faixa conferida foi 960 × 80. Capturas e condições em `alfa/state/visual/6c797764-851d-40c5-a5e1-37ee2071f74f`.
- A análise estática e o log da cidade estão reunidos no caso `2dc39a83-2d9a-4318-b594-ed0ab3ef47d5`. A identidade entre as fontes atuais e a build que gerou o log histórico ainda precisa de comprovação.
- A demonstração do catálogo tem capturas do gravador, execução independente do candidato e evidência dos erros preservados em `alfa/state/catalogo/dc0f9fe7-34a0-4f20-b150-92951c9c254c/resultado.json`.

**Validação da base entregue**

A suíte herdada terminou com 396 testes aprovados, zero falhas e três testes condicionais de symlink ignorados no Windows. A suíte Alfa terminou com 53 aprovados e zero falhas. O painel passou em 34 verificações gerais, incluindo medidas em 1920 × 1080, 1280 × 800 e 390 × 844, e em outras 21 verificações de protocolo e publicação. Os cenários simulados da interface estão identificados no relatório do Playwright. A aplicação, validação e reversão reais possuem prova própria.

Rode `npm.cmd test`, `npm.cmd run test:alfa`, `node alfa/cli.mjs benchmark` e `node alfa/cli.mjs java-benchmark` nesta pasta para repetir. O ambiente verificado foi Windows, Node 26.13.0 e JDK 21. O validador restrito exige suporte às permissões de filesystem e rede do Node. O teste visual usa Python com Playwright e Chromium instalados nesta máquina.

**Três capturas de uma falha nova**

O painel oferece os modelos JSON em **Preparar as três tentativas** e **Comparar arquivos do gravador**. Para conferir arquivos reais, informe buildFile, stage, condition e directory/session/request para control, intervention e reversal. Cada gravação deve conter um checkpoint experimental com action, buildSha256, observer, context e conditions. A etapa medida precisa registrar expected e actual. A importação confere SHA-256, identidade do pedido, sessão, integridade do arquivo e build em disco.

As condições são declarações do observador. A comparação preserva essa origem e registra associação reversível quando o defeito desaparece e retorna. A comprovação de que o processo carregou a build informada exige atestação de runtime adicional. O exemplo executável está em `alfa/experiments/catalogo.mjs`.

**Orientação para o Arena**

Comece por este documento e pelos pacotes de `alfa/state/arena`. A revisão da cidade em rev-1 foi contestada por outro agente. A reanálise em rev-3 preservou a contestação como histórico e manteve em aberto o efeito no cliente. Use o pacote mais recente do caso.

As correções ficam em `alfa/lab`. Baixe a proposta completa no painel e revise seus conteúdos, riscos, hashes e autorização. O revisor externo conserva sua chave privada e assina o payload produzido por `reviewPayload` de `alfa/patches.mjs`. O operador registra a chave pública por `node alfa/cli.mjs patch-key REVISOR publica.pem OPERADOR`. O JSON de aprovação contém reviewerId, decision, planDigest e signature. O autor da alteração, o revisor e o validador devem ter identidades distintas, conferidas pelo operador local.

Registre o validador revisado em `alfa/validators` usando `node alfa/cli.mjs validator ID CAMINHO_ABSOLUTO SHA256 OPERADOR`. Seu programa recebe JSON em stdin com os arquivos de cada snapshot e devolve schema autoforge.validator.v1, status e checks. O mesmo código e os mesmos nomes de checks são executados antes e depois. Um teste sempre verde é inconclusivo. A confiança nas chaves depende do cadastramento do operador.

Para comentários assinados sobre hipóteses, use `arena-key` e o payload específico de `alfa/cases.mjs`. Comentários por si só registram a revisão da hipótese. A aplicação de arquivos exige o recibo específico da proposta.

**Limitações remanescentes**

O congelamento do personagem de nível 56 exige reprodução correlacionada no cliente real. O teste visual cobre somente o componente distribuído de HUD. A prova de persistência do benchmark usa arquivos JSON. Uma transação de jogo e sua confirmação após novo login exigem um adaptador de banco e uma sessão controlada.

O mapa semântico Java ainda fornece contexto parcial ao fluxo. Receitas AST reconhecem padrões conhecidos. Hipóteses por fronteira e intervenções finitas têm cobertura limitada. Recursos dependentes de outros serviços podem terminar inconclusivos. Novas regras de domínio exigem observador, contrato e oráculo independentes.

O ensaio de protocolo executou a biblioteca de release e os corpos dos métodos selecionados do cliente em processo isolado. A validação Java recompilou uma cópia e testou o módulo do JAR indicado pelo processo local. O uso de um personagem autenticado e a publicação no servidor real continuam pendentes. [Relatório para o Arena](ARENA%20-%20Protocolo%20e%20validacao.md).

A rodada preliminar em `alfa/evidence/comparacao-d7cKQw` foi conservada. A revisão automática de aprovação recusou sua exclusão recursiva. Os apontadores latest.json e java-latest.json identificam as execuções usadas nesta entrega.
