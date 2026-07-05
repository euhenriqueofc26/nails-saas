# 🔍 Varredura de Bugs — ClubNailsBrasil
**Data:** 05/07/2026
**Status da build:** ✅ Compila sem erros
**Total de issues encontradas:** 27

---

## Como ler este documento

Cada bug está explicado em 3 partes:
- **O que é?** — Explicação simples, como se eu estivesse contando pra você
- **O que acontece hoje?** — Qual o comportamento atual do sistema
- **O que precisa ser feito?** — Resumo técnico da correção

---

# 🔴 CRÍTICOS (5 bugs)
Esses são os que podem quebrar funcionalidades ou causar erros de verdade.

---

### Bug #1 — WhatsApp não funciona para ninguém (nem pra quem paga Premium)

**O que é?**
O sistema verifica se a nail designer tem plano Premium para liberar o WhatsApp automático. Só que a forma como essa verificação foi feita está errada. O plano da pessoa é armazenado no banco de dados como um código estranho (ex: `clx123abc...`), mas o código compara com a palavra `"premium"`. É como tentar abrir uma porta com a chave do vizinho — nunca vai encaixar.

**O que acontece hoje?**
Mesmo que a Evolution API esteja configurada e a nail tenha plano Premium, o botão de conectar WhatsApp nunca aparece. O recurso está permanentemente bloqueado para todos os usuários.

**O que precisa ser feito?**
Arrumar a comparação para consultar o nome real do plano no banco, em vez de comparar com a palavra "premium" diretamente.

**Arquivos:** `src/components/WhatsAppConnect.tsx` (linha 119), `src/app/api/whatsapp/connect/route.ts` (linha 15)

---

### Bug #2 — Rota de deletar horário bloqueado existe no backend mas não tem uso

**O que é?**
O backend tem uma rota preparada para excluir horários bloqueados (DELETE), mas ela foi criada como planejamento futuro — **não existe nenhum botão, link ou funcionalidade no frontend que a utilize**. Além disso, mesmo se existisse, a rota está em uma pasta incorreta e não funcionaria.

**O que acontece hoje?**
Nada. A rota está lá no backend, mas nenhuma nail designer consegue (ou precisa) usá-la porque não há interface para isso. É código "adormecido".

**O que precisa ser feito?**
Não precisa de correção urgente. Quando a funcionalidade de excluir horários bloqueados for implementada no frontend, a rota precisará ser movida para a pasta correta.

**Arquivo:** `src/app/api/blocked-times/route.ts` (linha 73)

---

### Bug #3 — Se uma conta for deletada, ela ainda consegue acessar o sistema

**O que é?**
Quando alguém faz login, o sistema gera um token (um "crachá digital") que vale por 7 dias. Toda vez que a pessoa acessa uma página, o sistema confere se ela existe no banco e se está tudo ok. Mas esqueceu de verificar se a pessoa **ainda existe** no banco.

**O que acontece hoje?**
Se você deletar uma nail designer do banco de dados, e ela tiver o token ainda válido (até 7 dias), ela continua acessando o sistema normalmente — consegue ver clientes, agendamentos, tudo. A conta foi deletada mas o acesso continua.

**O que precisa ser feito?**
Adicionar uma verificação: "se o usuário não existe no banco, bloqueia o acesso".

**Arquivo:** `src/lib/authMiddleware.ts` (linhas 23-53)

---

### Bug #4 — Sistema trava se cliente não tem WhatsApp cadastrado

**O que é?**
Duas funcionalidades (lembretes automáticos e envio de promoções) tentam formatar o número de WhatsApp do cliente com uma função chamada `.replace()`. Se o cliente não tiver WhatsApp cadastrado, o valor é `null` (vazio), e o `.replace()` trava.

**O que acontece hoje?**
Se você tentar enviar uma promoção para uma lista de clientes e algum deles não tiver WhatsApp, a operação inteira quebra com erro 500. Nenhuma mensagem é enviada — nem pros que tem WhatsApp.

**O que precisa ser feito?**
Antes de tentar formatar o número, verificar se o WhatsApp existe. Se não existir, pular esse cliente e continuar com os próximos.

**Arquivos:** `src/app/api/reminders/route.ts` (linha 50), `src/app/api/promotions/[id]/send/route.ts` (linha 33)

---

### Bug #5 — Webhooks do WhatsApp sem segurança (qualquer um pode enviar dados falsos)

**O que é?**
Webhooks são "campainhas digitais" — a Evolution API toca uma campainha no nosso sistema quando recebe uma mensagem ou quando a conexão muda de status. O problema é que essa campainha não tem senha. Qualquer pessoa que descobrir o endereço da URL pode tocar ela e enviar dados falsos.

**O que acontece hoje?**
Como a Evolution API ainda não está instalada na VPS, esse bug não aparece. Mas quando ela for instalada, qualquer um pode enviar mensagens falsas para o banco de dados.

**O que precisa ser feito?**
Adicionar uma verificação: antes de aceitar os dados, confirmar que eles realmente vieram da Evolution API (via uma chave secreta).

**Arquivos:** `src/app/api/webhooks/evolution/incoming/route.ts`, `src/app/api/webhooks/evolution/connection-update/route.ts`

---

# 🟠 ALTOS (8 bugs)
Erros que podem causar comportamento incorreto ou perda de funcionalidade.

---

### Bug #6 — Lembretes automáticos nunca são enviados (quando cliente agenda online)

**O que é?**
Quando uma cliente agenda pelo site, o sistema envia uma confirmação para a nail. Mas na hora de salvar, ele marca uma flag chamada `reminderSent` (lembrete enviado) como `verdadeiro`. O problema é que essa flag é a mesma usada para controlar os lembretes automáticos (1 dia antes e no dia). Como já foi marcada como "enviado", o cron que roda todo dia pensa que já enviou e não envia nada.

**O que acontece hoje?**
Toda cliente que agenda online: recebe a confirmação, mas **nunca** recebe o lembrete no dia anterior nem no dia do agendamento. A nail também não recebe lembrete.

**O que precisa ser feito?**
Criar uma flag separada. Uma para "confirmação enviada" e outra para "lembrete enviado". A confirmação não deve impedir o lembrete.

**Arquivo:** `src/app/api/public/[slug]/book/route.ts` (linhas 159-162)

---

### Bug #7 — Lembretes automáticos nunca são enviados (quando nail confirma agendamento)

**O que é?**
Mesmo bug do #6, mas acontecendo quando a nail confirma um agendamento manualmente pelo dashboard.

**O que acontece hoje?**
A nail confirma o agendamento, o sistema envia a confirmação para a cliente, mas marca `reminderSent = true`. O cron de lembretes nunca mais vai tocar nesse agendamento. Cliente não recebe lembrete.

**O que precisa ser feito?**
Mesma correção do #6 — separar confirmação de lembrete.

**Arquivo:** `src/app/api/appointments/[id]/route.ts` (linhas 116-118)

---

### Bug #8 — Rota antiga de lembretes conflita com a nova

**O que é?**
Existem dois arquivos de lembretes: um novo (`/api/cron/reminders`) que usa a Evolution API de verdade, e um velho (`/api/reminders`) que só gera links do WhatsApp. O velho ainda está ativo e pode causar confusão.

**O que acontece hoje?**
Os dois existem, mas só o novo é chamado pelo cron do Vercel. O velho pode ser acessado manualmente e tentar enviar lembretes do jeito antigo (gerando links wa.me).

**O que precisa ser feito?**
Desativar ou unificar as duas rotas para não ter duplicidade.

**Arquivo:** `src/app/api/reminders/route.ts`

---

### Bug #9 — Rota de parceiros sem proteção contra erro

**O que é?**
A rota que lista os parceiros não tem um "plano B" se algo der errado. Ela simplesmente executa a consulta no banco e, se falhar, o sistema inteiro pode cair.

**O que acontece hoje?**
Se o banco de dados estiver lento ou der erro, a rota retorna um erro 500 feio e não registra nada nos logs. Fica difícil descobrir o que aconteceu.

**O que precisa ser feito?**
Envolver a consulta em um "try/catch" (tenta fazer, se der erro, captura e retorna uma resposta amigável).

**Arquivo:** `src/app/api/partners/route.ts` (linhas 10-13)

---

### Bug #10 — Área do cliente no site público não protege os dados

**O que é?**
A página pública tem uma área onde a cliente pode ver seus agendamentos. Para isso, ela faz um login simples. O sistema gera um token de acesso, mas... esquece de salvá-lo no banco.

**O que acontece hoje?**
Qualquer cliente consegue ver os agendamentos de qualquer outra cliente se souber o ID dela. O token é gerado mas nunca armazenado nem verificado — é como criar uma senha, anotar num papel e jogar o papel fora.

**O que precisa ser feito?**
Salvar o token no banco de dados e verificar ele em cada requisição.

**Arquivo:** `src/app/api/public/[slug]/client-login/route.ts` (linhas 39-48)

---

### Bug #11 — Cron de lembretes busca mais dados do que precisa

**O que é?**
O cron que roda todo dia para enviar lembretes busca **todos** os agendamentos do dia, incluindo aqueles que já receberam lembrete. Depois ele filtra manualmente, mas isso gasta mais memória e processamento do que necessário.

**O que acontece hoje?**
Funciona, mas com muitos agendamentos pode ficar lento e gastar mais recursos do Vercel.

**O que precisa ser feito?**
Adicionar um filtro na consulta para buscar apenas agendamentos que ainda não receberam lembrete.

**Arquivo:** `src/app/api/cron/reminders/route.ts` (linhas 129-144)

---

### Bug #12 — Datas e horários sem validação (podem quebrar cálculos)

**O que é?**
Quando uma cliente agenda online, o sistema recebe a data e o horário digitados e tenta calcular coisas como "quando termina o serviço". Mas não verifica se a data é válida antes de usar.

**O que acontece hoje?**
Se alguém enviar dados maliciosos ou corrompidos (ex: data "batata" ou horário "99:99"), o sistema pode travar, calcular valores errados (NaN = "Não é um Número"), ou produzir resultados sem sentido.

**O que precisa ser feito?**
Antes de processar a data e horário, verificar se eles têm o formato correto (ex: data precisa ter dia/mês/ano, horário precisa ser "HH:MM").

**Arquivos:** `src/app/api/public/[slug]/slots/route.ts`, `src/app/api/public/[slug]/book/route.ts`

---

### Bug #13 — Se a Evolution API não estiver configurada, o erro só aparece na hora

**O que é?**
As configurações da Evolution API (URL e chave) vêm de variáveis de ambiente. Se elas não forem preenchidas, o sistema tenta chamar um endereço vazio.

**O que acontece hoje?**
O sistema não avisa que a Evolution API está desconfigurada. Só quando a nail tentar conectar o WhatsApp é que vai dar erro — e a mensagem de erro pode ser confusa.

**O que precisa ser feito?**
Verificar no início se as variáveis estão preenchidas e, se não estiverem, mostrar um aviso claro.

**Arquivo:** `src/lib/evolution-api.ts` (linha 1)

---

# 🟡 MÉDIOS (9 bugs)
Problemas de segurança, performance ou boas práticas.

---

### Bug #14 — Email do CEO escrito diretamente no código

**O que é?**
Para dar acesso vitalício ao dono da plataforma, o sistema verifica se o email logado é `euhenriqueofc26@gmail.com`. Esse email está escrito no meio do código-fonte.

**O que acontece hoje?**
Funciona, mas se você precisar mudar de email ou criar um novo administrador vitalício, precisa alterar o código e fazer deploy novamente. Também é uma informação que qualquer pessoa que olhar o código vai descobrir.

**O que precisa ser feito?**
Mover o email para uma variável de ambiente (`.env`), com o valor atual como fallback.

**Arquivo:** `src/lib/authMiddleware.ts` (linha 28)

---

### Bug #15 — Relatório financeiro anual pode ficar lento

**O que é?**
Para gerar o relatório anual, o sistema carrega TODOS os agendamentos e despesas do ano na memória do computador e depois filtra mês a mês manualmente.

**O que acontece hoje?**
Com poucos dados, funciona rápido. Conforme a nail designer tiver centenas ou milhares de agendamentos, a página pode ficar cada vez mais lenta ou até estourar o limite de memória do Vercel.

**O que precisa ser feito?**
Fazer a soma diretamente no banco de dados, mês a mês, em vez de carregar tudo na memória.

**Arquivo:** `src/app/api/financial/reports/route.ts` (linhas 102-138)

---

### Bug #16 — Erro ao desconectar WhatsApp não é registrado

**O que é?**
Quando a nail desconecta o WhatsApp, o sistema tenta limpar a sessão na Evolution API. Se essa limpeza falhar, o erro é ignorado completamente.

**O que acontece hoje?**
Se algo der errado ao desconectar, ninguém fica sabendo. A sessão pode ficar "fantasma" na Evolution API.

**O que precisa ser feito?**
Pelo menos registrar o erro no log para poder diagnosticar se algo der errado.

**Arquivo:** `src/app/api/whatsapp/disconnect/route.ts` (linhas 23-30)

---

### Bug #17 — Campos de IA criados mas nunca usados

**O que é?**
O banco de dados tem dois campos preparados para uma funcionalidade de Inteligência Artificial: `aiHandled` em Appointment e `aiProcessed` em WhatsAppMessage. Mas eles nunca são lidos nem alterados por nenhuma funcionalidade.

**O que acontece hoje?**
Nada. Eles existem, ocupam espaço no banco, mas não fazem diferença. Só atrapalham se alguém olhar o banco e pensar que a funcionalidade existe.

**O que precisa ser feito?**
Ou implementar a IA de verdade, ou remover os campos para não poluir.

**Arquivos:** `prisma/schema.prisma` (linha 163), várias referências espalhadas

---

### Bug #18 — Arquivo de segurança (middleware) não faz nada

**O que é?**
O Next.js tem um arquivo chamado `middleware.ts` que executa em TODAS as requisições antes delas chegarem nas páginas. O nosso middleware existe, mas não faz nada — só libera a requisição e pronto.

**O que acontece hoje?**
O sistema funciona, mas não tem uma camada global de segurança. Não adiciona cabeçalhos de proteção, não bloqueia ataques comuns, não valida nada antes de chegar nas rotas.

**O que precisa ser feito?**
Adicionar pelo menos cabeçalhos de segurança (CSP, proteção contra clickjacking, etc).

**Arquivo:** `src/middleware.ts`

---

### Bug #19 — Token de login guardado em localStorage (menos seguro)

**O que é?**
Quando você faz login, o token fica salvo no `localStorage` do navegador (um "armário" que qualquer código JavaScript na página pode acessar).

**O que acontece hoje?**
Funciona perfeitamente. Mas se um dia alguém conseguir injetar um código malicioso no site (via um anúncio, um plugin, etc.), esse código pode roubar o token e acessar a conta.

**O que precisa ser feito?**
Trocar o armazenamento para "cookies HttpOnly" — um tipo de armazenamento que o JavaScript não consegue ler, só o servidor.

**Arquivo:** `src/context/AuthContext.tsx` (linhas 36-37)

---

### Bug #20 — Se o Redis cair, a proteção contra ataques para de funcionar

**O que é?**
O Redis é um sistema que controla quantas requisições cada pessoa pode fazer (rate limiting). Se ele falhar, o código "abre a porteira" e deixa tudo passar.

**O que acontece hoje?**
Se o Redis estiver fora do ar, um atacante pode enviar milhares de requisições por segundo sem ser bloqueado.

**O que precisa ser feito?**
Decidir se queremos "fail-open" (deixa passar quando tá quebrado — prioriza não atrapalhar usuário) ou "fail-closed" (bloqueia tudo quando tá quebrado — prioriza segurança). Atualmente é fail-open.

**Arquivo:** `src/lib/rate-limit.ts` (linhas 24-25)

---

### Bug #21 — Botão "Enviar Promoção" na verdade só gera link (não envia)

**O que é?**
A funcionalidade de promoções tem um botão "Enviar". Quando a nail clica, o sistema gera um link do WhatsApp para cada cliente, mas não envia mensagem nenhuma de verdade.

**O que acontece hoje?**
A nail clica em "Enviar", o sistema marca como "enviado", mas a cliente não recebe nada. A nail acha que enviou, mas não enviou. Teriam que clicar manualmente em cada link gerado.

**O que precisa ser feito?**
Ou renomear o botão para "Gerar Links" (honesto), ou integrar com a Evolution API para enviar de verdade.

**Arquivo:** `src/app/api/promotions/[id]/send/route.ts` (linha 51)

---

### Bug #22 — Upload de imagem não valida o arquivo

**O que é?**
O sistema aceita qualquer texto como se fosse imagem. Não verifica se é realmente uma foto, se tem o tamanho correto, se o formato é válido.

**O que acontece hoje?**
Se alguém enviar um arquivo que não é imagem (ou muito grande), o erro só aparece no Cloudinary e a mensagem pode ser confusa para o usuário.

**O que precisa ser feito?**
Validar antes de enviar: verificar formato, tamanho máximo, e se é realmente uma imagem.

**Arquivo:** `src/app/api/upload/route.ts` (linha 5)

---

# 🟢 BAIXOS (5 bugs)
Problemas estéticos ou de organização do código. Não afetam o funcionamento.

---

### Bug #23 — Linhas de teste esquecidas no código

**O que é?**
Tem `console.log` (comandos que imprimem informações no terminal) esquecidos em arquivos de produção. Eles mostram dados dos usuários nos logs do servidor.

**O que acontece hoje?**
Funciona normal. Só polui os logs com informações desnecessárias.

**O que precisa ser feito?**
Remover os `console.log` dos arquivos de produção.

**Arquivo:** `src/app/api/user/avatar/route.ts` (linhas 13 e 20)

---

### Bug #24 — Uso de "as any" em várias partes do código

**O que é?**
O código usa `(prisma as any)` em vários lugares para "desligar" a verificação de tipos do TypeScript. Isso acontece porque alguns modelos do banco não têm os tipos gerados corretamente.

**O que acontece hoje?**
Funciona, mas perde a segurança que o TypeScript dá. Se alguém mudar o nome de um campo no banco, o erro não aparece até rodar o sistema.

**O que precisa ser feito?**
Ajustar a geração dos tipos do Prisma para eliminar a necessidade desses "atalhos".

**Arquivos:** Vários (register, admin/referrals, partners, referrals/me, blocked-times)

---

### Bug #25 — Validação de URL de imagem muito restrita

**O que é?**
O sistema só aceita URLs de imagem que começam com `http://` ou `https://`. Não aceita outros formatos.

**O que acontece hoje?**
Se a nail tentar colocar uma URL de imagem em outro formato, ela é rejeitada sem explicação. Não quebra, mas a imagem não aparece.

**O que precisa ser feito?**
Aceitar mais formatos de URL ou mostrar uma mensagem clara sobre o formato aceito.

**Arquivos:** `src/app/api/services/route.ts` (linha 62), `src/app/api/services/[id]/route.ts` (linha 56)

---

### Bug #26 — Laço de repetição que pode rodar pra sempre (em teoria)

**O que é?**
O código que descobre em quais dias da semana o salão funciona tem um laço `while (true)` (enquanto verdadeiro, rode infinito). Ele tem uma condição de parada, mas o formato é frágil.

**O que acontece hoje?**
Funciona porque a condição de parada sempre é atingida. Mas o formato é arriscado — qualquer erro de digitação pode fazer o laço rodar infinitamente e travar o servidor.

**O que precisa ser feito?**
Trocar o `while (true)` por um `for` que rode no máximo 7 vezes (já que a semana só tem 7 dias).

**Arquivo:** `src/lib/utils.ts` (linhas 187-194)

---

### Bug #27 — Uso de "!" em variáveis que podem não existir

**O que é?**
O código usa o operador `!` (confirmação forçada de que o valor existe) em situações onde o valor pode ser `null` ou `undefined`.

**O que acontece hoje?**
Funciona porque o fluxo normal sempre preenche esses valores. Mas se algo inesperado acontecer, o sistema pode travar.

**O que precisa ser feito?**
Trocar as confirmações forçadas por verificações reais de existência.

**Arquivos:** `src/app/api/appointments/[id]/route.ts`, `src/app/api/financial/route.ts` (linha 110)

---

# 🗺️ Plano de Correção — Ordem Recomendada

| Prioridade | Bug | Esforço | Risco | Por que essa ordem? |
|-----------|-----|---------|-------|-------------------|
| 1º | #1 — WhatsApp bloqueado | ⭐ Fácil | 🟢 Zero | Evolutioon API ainda nem está no ar, podemos arrumar sem pressa |
| 2º | #2 — DELETE blocked-times | ⭐ Fácil | 🟢 Zero | Tá quebrado, só consertar |
| 3º | #3 — Usuário deletado acessa | ⭐ Fácil | 🟢 Zero | Segurança básica, 3 linhas de código |
| 4º | #4 — Cliente sem WhatsApp crasha | ⭐ Fácil | 🟢 Zero | 2 linhas de código, só adicionar "se não tem, pula" |
| 5º | #6 e #7 — Lembretes nunca enviados | ⭐⭐ Médio | 🟢 Zero | Trocar nome de uma flag, afeta apenas criação de agendamentos novos |
| 6º | #10 — Token de cliente não salvo | ⭐⭐ Médio | 🟢 Zero | Funcionalidade praticamente nova, sem usuários usando |
| 7º | #14 — Email hardcoded | ⭐ Fácil | 🟢 Zero | Só mudar de lugar, mesma lógica |
| 8º | #9 + #11 + #13 + #16 | ⭐⭐ Médio | 🟢 Zero | Melhorias de segurança e robustez |
| 9º | #5 — Webhook sem auth | ⭐ Fácil | 🟢 Zero | Evolution API nem instalada ainda |
| 10º | #8 — Rota antiga de lembretes | ⭐ Fácil | 🟢 Zero | Remover arquivo morto |
| 11º | #12 — Validação de data | ⭐⭐ Médio | 🟢 Zero | Só adicionar if antes de processar |
| 12º | #15 — Relatório lento | ⭐⭐⭐ Difícil | 🟡 Baixo | Mudança de performance, mesmos resultados |
| 13º | #17 — Campos não usados | ⭐⭐ Médio | 🟢 Zero | Remove ou implementa |
| 14º | #18 — Middleware no-op | ⭐⭐⭐ Difícil | 🟡 Baixo | Pode pular se não quiser |
| 15º | #19 — localStorage → cookie | ⭐⭐⭐⭐ Complexo | 🟡 Médio | Exige teste completo de login/logout |
| 16º | #20 — Rate limit bypass | ⭐ Fácil | 🟡 Baixo | Decisão de design |
| 17º | #21 — Send só gera link | ⭐⭐ Médio | 🟢 Zero | Renomear ou implementar |
| 18º | #22 a #27 | ⭐⭐ Vários | 🟢 Zero | Melhorias cosméticas/de código |

---

### ⚠️ Observações importantes

**Risco real de quebrar algo existente: ZERO em 25 dos 27 bugs.**
Os únicos que exigem cuidado:

- **Bug #19 (localStorage → cookie)**: É uma mudança no sistema de login. Se for feita, precisa testar bem. **Pode ser ignorada** sem prejuízo imediato.
- **Bug #14 (email hardcoded)**: Se fizermos errado, o CEO perde acesso. Mas o plano é: criar env var com fallback pro mesmo valor → zero risco.

**Todos os outros bugs** ou consertam algo já quebrado, ou adicionam segurança onde não tinha nada, ou melhoram performance sem mudar resultado final. Nenhum deles mexe em fluxo que já funciona.

---

*Fim do relatório — 27 issues catalogadas em 05/07/2026*
