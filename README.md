# Nails SaaS - Sistema de Gestão para Nail Designers

Plataforma SaaS multi-tenant completa para profissionais de unhas, com agendamento online, CRM de clientes, controle financeiro e página pública personalizada.

## 🚀 Funcionalidades

### Módulo de Autenticação
- Cadastro seguro com nome, email, senha e WhatsApp
- Login com JWT
- Recuperação de senha
- Separação de dados por usuário (multi-tenant)

### CRM de Clientes
- Cadastro completo de clientes
- Histórico de serviços
- Observações e anotações
- Upload de fotos das unhas
- Busca e filtros

### Sistema de Agendamento
- Calendário mensal e semanal
- Criação de agendamentos com:
  - Cliente
  - Serviço
  - Data e horário
  - Valor
  - Status (confirmado, pendente, cancelado, concluído)
- Bloqueio de horários
- Prevenção de conflitos de horário
- Filtros por data

### Controle Financeiro
- Registro automático de receitas (ao concluir atendimento)
- Cadastro manual de despesas
- Relatórios mensais e anuais
- Dashboard com:
  - Total faturado
  - Total de despesas
  - Lucro líquido
  - Ticket médio

### Módulo de Serviços
- Criação de serviços
- Definição de nome, preço e duração
- Ativar/desativar serviços

### Página Pública
- URL personalizada (ex: sistema.com/nome-do-studio)
- Lista de serviços disponíveis
- Seleção de horário
- Formulário de agendamento
- Confirmação automática

### Dashboard
- Agendamentos do dia
- Faturamento do mês
- Clientes ativos
- Próximos horários

### Estrutura de Planos
- **Gratuito**: Até 10 clientes, 50 agendamentos/mês, 5 serviços
- **Pro (R$ 29,90/mês)**: Até 100 clientes, 200 agendamentos/mês, 20 serviços, financeiro completo
- **Premium (R$ 59,90/mês)**: Tudo ilimitado + suporte prioritário

## 🛠 Tecnologias

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Autenticação**: JWT
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd nails-saas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o Prisma e seed do banco:
```bash
npx prisma db push
npm run db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
├── prisma/
│   └── schema.prisma       # Schema do banco de dados
├── src/
│   ├── app/
│   │   ├── api/           # Rotas da API
│   │   │   ├── auth/      # Autenticação
│   │   │   ├── clients/   # Clientes
│   │   │   ├── appointments/ # Agendamentos
│   │   │   ├── financial/ # Financeiro
│   │   │   ├── services/  # Serviços
│   │   │   └── public/    # Página pública
│   │   ├── dashboard/     # Área administrativa
│   │   ├── [slug]/        # Página pública de agendamento
│   │   └── page.tsx       # Página inicial (login)
│   ├── context/           # Contextos React
│   └── lib/              # Utilitários e configurações
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/[auth]` - Registro
- `POST /api/auth/forgot` - Recuperação de senha
- `GET /api/auth/[auth]` - Dados do usuário

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/[id]` - Detalhes do cliente
- `PUT /api/clients/[id]` - Atualizar cliente
- `DELETE /api/clients/[id]` - Deletar cliente

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/[id]` - Atualizar agendamento
- `DELETE /api/appointments/[id]` - Cancelar agendamento

### Financeiro
- `GET /api/financial` - Movimentações
- `POST /api/financial` - Criar registro
- `GET /api/financial/reports` - Relatórios

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço
- `PUT /api/services/[id]` - Atualizar serviço
- `DELETE /api/services/[id]` - Deletar serviço

### Página Pública
- `GET /api/public/[slug]` - Dados do studio
- `GET /api/public/[slug]/slots` - Horários disponíveis
- `POST /api/public/[slug]/book` - Agendamento público

## 🎨 Design

- Cores: Nude, Rosa, Dourado
- Interface responsiva (mobile-first)
- Componentes modernos e intuitivos
- Ícones minimalistas

## 📝 Licença

MIT License
