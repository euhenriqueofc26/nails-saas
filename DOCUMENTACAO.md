# ClubNailsBrasil - Manual da Plataforma

## Introdução

O ClubNailsBrasil é uma plataforma SaaS completa para gerenciamento de salões de unhas e nails designers. A plataforma permite que profissionais da beleza gerenciem seus clientes, agendamentos, serviços e finanças de forma eficiente, além de oferecer uma página pública para agendamento online por parte das clientes.

---

## Funcionalidades

### 1. Sistema de Autenticação

#### Registro
- **URL**: `https://www.clubnailsbrasil.com.br`
- O novo usuário deve preencher: nome, email, senha, WhatsApp e nome do studio
- Cada usuário recebe um slug único baseado no nome do studio
- **Trial**: Toda nova conta recebe 7 dias gratuitos de acesso total

#### Login
- Acesso com email e senha
- Token JWT com validade de 7 dias

---

### 2. Dashboard

O dashboard é a página inicial após o login e apresenta:

- **Agendamentos hoje**: Quantidade de agendamentos agendados para o dia
- **Faturamento do mês**: Total calculado automaticamente a partir de agendamentos concluídos
- **Clientes ativos**: Total de clientes cadastrados
- **Pendentes**: Número de agendamentos com status "pendente"
- **Lista de agendamentos do dia**: Visualização rápida dos horários
- **Próximos agendamentos**: Próximos 5 agendamentos futuros
- **Atalhos**: Links rápidos para Clientes, Financeiro e Serviços

---

### 3. Clientes

#### Gerenciamento de Clientes
- Cadastro de clientes com: nome, WhatsApp e observações
- Listagem de todos os clientes
- Busca por nome
- Contador de clientes (limitado por plano)
- Fotografias do trabalho realizado (galeria por cliente)

#### Campos do Cliente
- Nome completo
- WhatsApp (com formatação)
- Observações (campo livre)
- Data do último serviço
- Fotos (até 4 por cliente)

---

### 4. Agendamentos

#### Criar Agendamento
- Seleção do cliente (busca automática)
- Seleção do serviço
- Data e horário
- Preço (preenchido automaticamente basedo no serviço)
- Status: pendente, confirmado, concluído, cancelado
- Observações

#### Calendário de Agendamentos
- Visualização em formato de lista/calendário
- Filtragem por status
- Edição e cancelamento
- Marcação como "concluído" (afeta faturamento)

#### Status dos Agendamentos
- **Pendente**: Aguardando confirmação
- **Confirmado**: Confirmado pela nail
- **Concluído**: Finalizado (inclui no faturamento do mês)
- **Cancelado**: Cancelado (não conta no faturamento)

---

### 5. Serviços

#### Cadastro de Serviços
Cada serviço inclui:
- Nome
- Preço (R$)
- Duração (minutos)
- Descrição (opcional)
- **Imagem** (opcional - URL)

#### Limites por Plano
- **Gratuito**: até 5 serviços
- **Pro**: até 20 serviços
- **Premium**: ilimitado

#### Exibição na Página Pública
- As imagens cadastradas aparecem na página pública
- Se não houver imagem, exibe imagem genérica baseada no nome

---

### 6. Controle Financeiro

#### Receita
- Calculada automaticamente a partir de agendamentos concluídos
- Faturamento do dia e do mês
- Histórico de agendamentos finalizados

#### Despesas
- Cadastro de despesas
- Categorias: material, loja, funcionário, outros
- Data e descrição

#### Relatórios
- Receita por período
- Despesas por período
- Lucro (receita - despesas)
- Disponível apenas nos planos Pro e Premium

---

### 7. Página Pública

#### Configurações
Cada nail pode configurar:

- **Imagem de Capa (Hero)**: URL de imagem que aparece no topo da página
- **Bio/Descrição**: Texto sobre o trabalho
- **Endereço**: Localização do salão
- **Horário de Funcionamento**: Dias e horários de atendimento
- **Instagram**: Link do perfil
- **Facebook**: Link da página
- **Status**: Ativar/desativar página pública

#### URL da Página Pública
- Formato: `https://www.clubnailsbrasil.com.br/[slug-do-studio]`
- Exemplo: `https://www.clubnailsbrasil.com.br/meu-salao`

#### Agendamento Online
As clientes podem:
1. Visualizar serviços disponíveis
2. Selecionar serviço desejado
3. Escolher data e horário disponível
4. Preencher nome e WhatsApp
5. Confirmar agendamento

#### Mensagens WhatsApp Automáticas

**Botão flutuante**:
> "Olá [Nome do Studio], gostaria de fazer um agendamento personalizado."

**Após confirmar agendamento**:
```
Novo agendamento:

Cliente: [Nome da Cliente]
WhatsApp: [WhatsApp]
Serviço: [Nome do Serviço]
Valor: [R$ Preço]
Data: [DD de MMMM]
Horário: [HH:MM]
```

---

### 8. Planos e Assinatura

#### Planos Disponíveis

| Recurso | Gratuito | Pro | Premium |
|---------|----------|-----|---------|
| Clientes | 10 | 100 | Ilimitado |
| Agendamentos/mês | 50 | 200 | Ilimitado |
| Serviços | 5 | 20 | Ilimitado |
| Página pública | ✓ | ✓ | ✓ |
| Controle financeiro | ✗ | ✓ | ✓ |
| Análises | ✗ | ✓ | ✓ |
| Preço | Grátis | R$ 49,90/mês | R$ 99,90/mês |

#### Sistema de Trial
- 7 dias gratuitos ao criar conta
- Após expirar, acesso é bloqueado
- Usuário pode fazer upgrade para continuar

#### Pagamento (Simulado)
- Página de checkout com:
  - Cartão de crédito
  - PIX
  - Boleto
- Sistema simulado para demonstração

---

### 9. Área de Administração (Admin)

#### Acesso
- Disponível apenas para usuários com role "admin"
- URL: `/dashboard/admin`

#### Funcionalidades
- **Lista de usuários**: Visualizar todas as nails cadastradas
- **Busca**: Por nome, email ou studio
- **Filtros**: Por plano e status (ativo, bloqueado, em trial)
- **Alterar plano**: Upgrade ou downgrade manual
- **Bloquear/Desbloquear**: Acesso ao sistema
- **Visualizar dados**: Clientes, agendamentos, email, WhatsApp

---

## Aspectos Técnicos

### Tecnologias Utilizadas
- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Neon)
- **Autenticação**: JWT
- **ORM**: Prisma

### Estrutura de Pastas
```
src/
├── app/
│   ├── api/              # APIs Routes
│   │   ├── admin/        # Rotas de administração
│   │   ├── appointments/
│   │   ├── clients/
│   │   ├── dashboard/
│   │   ├── financial/
│   │   ├── public/      # API pública
│   │   ├── services/
│   │   └── auth/
│   ├── dashboard/       # Páginas do dashboard
│   └── [slug]/          # Página pública
├── components/         # Componentes React
├── context/            # Contextos (Auth)
└── lib/                # Utilitários
```

### Variáveis de Ambiente
```
DATABASE_URL=          # URL do PostgreSQL (Neon)
JWT_SECRET=            # Chave secreta para JWT
NEXT_PUBLIC_BASE_URL=  # URL base do app
```

---

## Backup e Segurança

### Backups Automáticos
- O Neon faz backups automáticos contínuos
- Retention de 7 dias no plano gratuito

### Point in Time Recovery
- Disponíveis restore points manuais
- Criar branch de backup no GitHub

---

## Como Usar a Plataforma

### Para a Nail (Profissional)

1. **Cadastre-se**: Acesse o site e crie sua conta
2. **Configure**: Adicione seus serviços, clientes e configure a página pública
3. **Gerencie**: Use o dashboard para acompanhar agendamentos
4. **Configure imagem**: Adicione URL da imagem de capa na página pública
5. **Adicione fotos de serviços**: Cada serviço pode ter uma imagem

### Para a Cliente

1. **Acesse**: Entre na página pública da nail (via link compartilhado)
2. **Escolha**: Selecione o serviço desejado
3. **Agende**: Escolha data, horário e preencha seus dados
4. **Confirme**: Receba a confirmação via WhatsApp

---

## Perguntas Frequentes

**Posso cancelar a qualquer momento?**
Sim, mas o acesso permanece até o fim do período pago.

**O que acontece com meus dados se eu cancelar?**
Seus dados permanecem por 30 dias. Após isso, podem ser removidos.

**Como funciona o agendamento?**
A cliente agenda online e você recebe a notificação via WhatsApp para confirmar.

**Posso ter mais de um usuário na mesma conta?**
Ainda não, cada conta é para um profissional.

**As clientes podem cancelar agendamento?**
Ainda não, apenas a nail pode gerenciar status.

---

## Suporte

Em caso de dúvidas ou problemas:
- WhatsApp: [Incluir contato]
- Email: [Incluir email]

---

*Documento criado em Fevereiro de 2026*
*ClubNailsBrasil - Plataforma para Nails Designers*
