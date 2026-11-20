# AutoForge Alfa Final · entrega para o Arena

13 de novembro de 2026 · Windows · investigação local de títulos do WartuneUltra.

**Achado principal.** O Java permite construir uma mensagem de exército com título equipado e poder de combate ausente. Nesse caminho o encoder omite o título e seis campos de aparência. O decoder distribuído no cliente lê título 0. O mesmo comportamento foi reproduzido com classes compiladas do checkout e com o módulo de protocolo extraído do JAR indicado na linha de comando do processo Java.

## Onde está a correção proposta

No checkout Java, abra `modules/protocol-legacy/src/main/java/com/wartuneultra/protocol/msg/ArmyMessages.java`. Em `ArmyMsg.encode()`, o bloco iniciado por `if (fightingCapacity != null)` envolve a emissão do campo 13, as seis propriedades de aparência e o campo 33. O diff move a chave de fechamento para logo depois de `writer.putInt32(13, fightingCapacity)`. Cada campo opcional passa a obedecer à sua própria condição.

O teste enviou ao encoder os mesmos dados com poder ausente e com poder 123. Com título 7 e poder ausente, o cliente leu 0 na versão original, 7 na proposta e 0 após restaurar. Com poder 123, leu 7 nas três execuções. A consulta da lista, equipar, desequipar, a leitura do herói aninhado e os seis campos de aparência também foram conferidos. O arquivo restaurado reproduziu o SHA-256 inicial.

| Condição executada em processo separado | Verificações aprovadas |
|---|---:|
| Fontes Java do checkout | 8/11 |
| Módulo extraído do JAR indicado pelo processo | 8/11 |
| Fontes com a proposta na cópia experimental | 11/11 |
| Fontes originais restauradas e recompiladas | 8/11 |

A proposta está em **Laboratório → Título e aparência quando o poder de combate está ausente**. Seu estado é **aguardando revisão**. O manifesto autoriza apenas a cópia de `ArmyMessages.java` em `alfa/lab`. A condição foi comprovada para o encoder. Sua ocorrência na partida de um jogador depende do valor de poder que o caminho real entregou ao encoder. O congelamento do personagem de nível 56 segue em aberto.

- [Diff de uma chave de fechamento](alfa/state/protocol/java/d10a8b2a-3f03-4067-816f-4cb3b68c34d7/campo-33.diff)
- [Resultados, bytes, fontes, JAR e reversão](alfa/state/protocol/java/d10a8b2a-3f03-4067-816f-4cb3b68c34d7/resultado.json)
- [Manifesto da proposta e escopo de aplicação](alfa/evidence/proposta-titulos.json)

## Contrato que deve ser preservado

| Recurso no cliente | Resultado verificado |
|---|---|
| `army.SimpleHeroInfoMsg` | Campo 53 é `wing`, string com wire 2. A mensagem desta release não declara um campo de título. |
| `army.ArmyMsg` | Campo 33 é `appellid`, int32 com wire 0. Para o valor 7, o encoder real produziu os bytes decimais `136 2 7`. A grafia com I maiúsculo omitiu o campo. |
| `army.HeroEquUpdatedMsg` | Campo 9 é `appellId`, int32 com wire 0. |
| `C_APPELL_EXCHANGE` 8597 | Abrir a lista envia ID 0 e `look=true`. Equipar envia o ID escolhido e `look=false`. Desequipar envia ID 0 e `look=false`. A JVM decodificou os três pedidos produzidos pelo cliente. |
| 149 e 59 | Em `ey.onOtherHeroInfoChange`, registrado para 149, a guarda de sala retorna antes de ler a mensagem. Há outro receptor de 149, `nq.__otherHeroInfoChange`. Encontramos a declaração `Mn.U_C_HERO_UPDATE_EQUIPMENT=59`. A análise dos registros literais recuperou zero receptores para 59. Essa contagem deixa em aberto qualquer ligação dinâmica. |
| 150 e 113 | Em 150, a presença de `simpleHeroInfo` permite que `Dp.readHeroInfo` receba `ArmyMsg` como terceiro argumento e escreva `i.appellid` em `thane.appellId`. Em 113, o chamador omite o terceiro argumento. O ensaio preservou o título anterior nesse caminho. |
| Evento da janela | O setter marca `jB.APPELL_CHANGE`. O `commit()` despacha `ba.APPELL_CHANGE`. A janela associa `qEt.onAppellChange` ao evento e o callback chama `refreshView`. A mesma janela também registra o callback para `THANE_INFO_UPDATE`. |
| 10020 | O cliente declara `Bn.B_SET_ATUO_ATTACK`, com essa grafia. A busca numérica funciona nos comandos `protocolo` e `acao`. |

O ensaio de 15 verificações executou encoders, decoders e corpos de métodos distribuídos no cliente. A bancada forneceu os colaboradores da sala, o encaminhamento controlado do evento e o observador de `refreshView`. Uma captura autenticada da janela “Guerreiro Supremo” continua pendente. O feedback do Arena relata a troca para “Desequipar” e cita `wt/shot9.jpg`. Esse arquivo não foi recuperado na conferência desta entrega. [Execução com a release](alfa/state/protocol/probes/4872338b-e747-4798-8a4b-fa3666d4cd0e/resultado.json) · [Consulta específica do 59](alfa/evidence/consulta-opcode-59.json) · [Consulta do 10020](alfa/evidence/consulta-arena.json).

## Log da JVM e identificação do executável

O log `partida-20261113-103100092.log` registra o pedido 8597 na linha 729 e as emissões 4491, 4484, 59 e 150 nas linhas 732–735 com os mesmos identificadores de pedido e sessão. Na linha 730, o handler registrou `look=false write=true ok=true equippedId=1`. Essa linha está na mesma thread e janela temporal, sem identificador próprio de pedido. O trecho registra a emissão do pacote. O conteúdo do 150 e os pixels do botão naquela sessão continuam sem captura correlacionada. [Linhas, hashes e correlação](alfa/evidence/titulos-log-real.json).

O processo identificado pelo arquivo de PID às 15h17 usava o caminho `runtime-java/game-server-trial2-20261112.jar`. O teste abriu o arquivo por esse caminho e conferiu seu SHA-256 antes de extrair a biblioteca. O processo do ensaio histórico da manhã tinha outro PID. A correspondência entre os bytes carregados naquela sessão, o estado do banco e os arquivos atuais permanece sem atestação. [Observação do processo](alfa/evidence/artefato-jvm-observado.json) · [Plano de publicação do launcher correspondente](alfa/state/deployments/plans/7c15736b-8332-44fb-9862-fe51ceb2a207.json).

## Como usar e repetir

1. Execute **ABRIR AUTOFORGE.cmd**. Abra **Wartune · contrato de títulos e repintura**, desça até **Protocolo do cliente** e consulte `título`, `150` ou uma mensagem. O JSON completo inclui hashes, arquivos e deslocamentos em bytes. O pacote de revisão apresenta campos, guardas, escritas e assinantes. [Pacote da revisão 9](alfa/state/arena/d8d961bb-bec1-496f-b804-4e31cf1e4569/rev-9.json).
2. Pelo terminal na pasta do Alfa, execute `arena.cmd protocolo --recurso titulo --sala fora` ou `arena.cmd protocolo --recurso 10020 --mensagem army.ArmyMsg --campo 33`. A busca também cobre `frame/avatar`, `destiny/fate`, `benefício/sevensign`, `mount/vehicle` e seus termos em português. O índice segue a lista de release do `gameindex.js`. Nesta cópia foram 1.545 mensagens, 7.853 campos e 381 mensagens com extração parcial. Uma ausência em mensagem parcial fica inconclusiva. A sessão de um usuário que usa a variante beta exige leitura dos arquivos dessa variante.
3. Abra **Laboratório → Testar publicação e reversão**. O adaptador de progressão confere uma proposta assinada e validada, verifica a sintaxe, inicia um serviço HTTP local, confere a saúde, cruza log e resposta com a tela do Chromium e restaura o backup. O ensaio de nível 56 mostrou **1104 → 1105 → 1104** na mesma porta em três processos distintos. Cada fase contém sua captura, PID, pedido e hash. O acesso pela proposta no painel e o comando `deploy-lab` também aceitam propostas de `progression.json` no escopo do adaptador. O Wartune tem um plano de publicação próprio. O deploy real requer autorização específica. [Publicação e capturas](alfa/state/deployments/1b40abe8-73e9-42b3-a27e-0c29742c5be5.json).
4. Para reproduzir as comparações, use os comandos abaixo na pasta do projeto. O ensaio Java escreve somente em `alfa/state`. Os hashes vinculam o plano, a biblioteca, a proposta e a cópia restaurada.

```bat
node alfa/experiments/compare-protocol.mjs D:/C/WartuneUltra/client-qa-java-v1
node alfa/experiments/protocol-probe.mjs D:/C/WartuneUltra/client-qa-java-v1
node alfa/cli.mjs deploy-plan D:/C/WartuneUltra active-start-trial2.ps1
python alfa/experiments/java-client-wire.py alfa/state/protocol/probes/4872338b-e747-4798-8a4b-fa3666d4cd0e/resultado.json alfa/state/deployments/plans/7c15736b-8332-44fb-9862-fe51ceb2a207.json
```

## Ganho medido e limites

A comparação de protocolo fez as mesmas oito perguntas ao Alfa anterior ao feedback e ao atualizado, com os mesmos arquivos de cliente. A versão anterior devolveu uma resposta estruturada completa. A atual devolveu as oito. A versão anterior já recuperava os três campos com os nomes totalmente qualificados e também apresentava trechos para leitura manual. A execução local levou 792 ms antes e 2.175 ms depois. A nova consulta percorre mais código. Esta amostra deriva do incidente de títulos. [Resultados pergunta por pergunta](alfa/state/benchmarks/protocolo-692f119e-0297-406b-85c3-18cd5eb1a5c9/comparacao.json).

No benchmark geral de 14 casos, as duas versões localizaram as mesmas oito fronteiras observáveis, confirmaram 7/8 mecanismos por intervenção e registraram zero falsos positivos nos quatro controles. Na bancada Java de três propostas, ambas alcançaram 2/3 correções, detectaram uma regressão e restauraram as três versões. A taxa geral de diagnóstico empatou nesta amostra. [Benchmark geral](alfa/state/benchmarks/comparacao-WpOCyj/COMPARACAO.md) · [Benchmark Java](alfa/state/benchmarks/java-cddaa365-0870-4841-81d2-7ba471f56963/comparacao-java.json).

As suítes terminaram com **396 aprovações herdadas e 53 do Alfa**. Três testes condicionais de symlinks foram pulados no Windows. O Chromium passou nas 34 verificações gerais e nas 21 do fluxo de protocolo e publicação. A integração com Arena usa pacotes de revisão com importação e exportação. A identidade dos revisores depende das chaves cadastradas pelo operador. [Suíte herdada](alfa/evidence/legacy-apos-feedback-tests.log) · [Suíte Alfa](alfa/evidence/alfa-apos-feedback-tests.log) · [Interface geral](alfa/evidence/ui/qa.json) · [Fluxo de ponta a ponta](alfa/evidence/ui/protocolo-publicacao.json).

## Arquivos de manutenção

A integração de protocolo fica em `alfa/protocol/`, `alfa/history.mjs`, `alfa/cases.mjs`, `arena/autoforge.mjs` e `arena/client.mjs`. A publicação de bancada e o plano Java ficam em `alfa/deployment.mjs` e `alfa/deployment-plan.mjs`. O motor de revisão e aplicação fica em `alfa/patches.mjs` e `alfa/repair-workflow.mjs`. A interface usa `alfa/ui/`, o servidor local e o worker. Para decidir sobre a proposta de títulos, preserve a pré-imagem, o contrato protobuf, o controle com poder 123 e os resultados de reversão.

A verificação final conferiu os 624 arquivos da origem e do backup inicial e os 1.836 do backup anterior ao feedback. O manifesto lista os quatro arquivos herdados que receberam alterações na cópia Alfa. [Conferência de integridade](alfa/evidence/integridade-apos-feedback.json).
