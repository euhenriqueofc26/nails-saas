# ClubNailsBrasil Mobile — MVP (Minimum Viable Product)

## Escopo do MVP

Apenas o essencial para a nail designer usar o app no dia a dia. O resto (financeiro completo, marketing, admin, relatórios) fica para versões futuras.

**Foco:** agendamento, clientes, serviços, página pública.

---

## Stack

| Tecnologia | Versão |
|-----------|--------|
| React Native (Expo) | SDK 52+ |
| TypeScript | 5.x |
| Expo Router | 4.x (file-based routing) |
| TanStack Query | 5.x |
| Zustand | 5.x |
| react-native-reanimated | 3.x |
| expo-secure-store | ~ |
| expo-notifications | ~ |
| expo-linking | ~ |
| date-fns | ~ |
| react-native-toast-message | ~ |
| NativeWind (opcional) | ~ (TailwindCSS no RN) |

---

## APIs que o MVP Consome

```
POST   /api/auth/login           → { email, password } → { token, user }
POST   /api/register             → { name, email, password, whatsapp, studioName }
POST   /api/auth/forgot          → reset de senha

GET    /api/dashboard            → stats: agendamentos hoje, faturamento mês, clientes, pendentes

GET    /api/appointments         → lista de agendamentos com filtros
PUT    /api/appointments/[id]    → { status } → confirmar, concluir, cancelar

GET    /api/clients              → lista de clientes
POST   /api/clients              → criar cliente
GET    /api/clients/[id]         → perfil do cliente
GET    /api/clients/[id]/appointments → histórico
GET    /api/clients/[id]/photos  → fotos do cliente
POST   /api/clients/[id]/photos  → upload de foto

GET    /api/services             → lista de serviços
POST   /api/services             → criar serviço
PUT    /api/services/[id]        → atualizar
DELETE /api/services/[id]        → deletar

GET    /api/public/[slug]        → dados do estúdio (página pública)
GET    /api/public/[slug]/slots  → horários disponíveis
POST   /api/public/[slug]/book   → criar agendamento (cliente)

GET    /api/user/onboarding      → obter step do onboarding
POST   /api/user/onboarding      → avançar step
POST   /api/user/onboarding-complete → finalizar

GET    /api/profile              → dados do perfil
PUT    /api/profile              → atualizar perfil
POST   /api/user/avatar          → upload avatar
```

**Total: ~20 endpoints.** Metade do total.

---

## Estrutura de Telas (Expo Router)

```
app/
├── _layout.tsx                 → AuthProvider + QueryClientProvider
│
├── index.tsx                   → Redirect (login se não autenticado, dashboard se sim)
│
├── (auth)/
│   ├── _layout.tsx             → Stack sem header
│   ├── login.tsx               → Email + senha
│   └── register.tsx            → Cadastro completo
│
├── (dashboard)/
│   ├── _layout.tsx             → Bottom Tab Navigator (4 tabs)
│   ├── index.tsx               → Home (stats + agendamentos do dia)
│   ├── appointments/
│   │   ├── _layout.tsx
│   │   └── index.tsx           → Lista de agendamentos + CRUD
│   ├── clients/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           → Lista + busca
│   │   └── [id].tsx            → Perfil (histórico + fotos)
│   ├── services/
│   │   ├── _layout.tsx
│   │   └── index.tsx           → Lista + CRUD
│   └── more/
│       ├── _layout.tsx
│       ├── index.tsx           → Tela "Mais" (acesso ao restante)
│       ├── public.tsx          → Configurar página pública
│       ├── profile.tsx         → Editar perfil
│       └── plans.tsx           → Planos / upgrade
│
└── (public)/
    ├── _layout.tsx
    └── [slug].tsx              → Página pública da nail designer
```

### Por que 4 tabs + tela "Mais"?

- **Home**: dashboard com stats + agendamentos do dia
- **Agendamentos**: lista completa com filtros e ações
- **Clientes**: lista + perfil com histórico e fotos
- **Serviços**: CRUD de serviços
- **"Mais"**: agrupa configuração da página pública, perfil, planos — funcionalidades secundárias que não precisam de tab própria

---

## Funcionalidades MVP

### 1. Autenticação (Login + Cadastro)

**Login:** email, senha, botão "Entrar", link "Esqueci senha"
**Cadastro:** nome, email, senha, WhatsApp, nome do estúdio
- Salvar JWT no SecureStore
- Redirecionar para onboarding (se novo) ou dashboard (se existente)

### 2. Onboarding (3 passos)

Aparece apenas na primeira vez:
1. **Home**: "Adicione sua foto de perfil" → highlight no avatar
2. **Serviços**: "Crie seu primeiro serviço" → highlight no botão novo
3. **"Mais" > Página Pública**: "Configure sua página pública" → highlight no título

Tooltip com fundo semi-transparente, indicador 1/3, botão "Pular".

### 3. Home (Dashboard)

- **Header**: nome do estúdio + avatar (se tiver)
- **4 cards de stats**: Agendamentos hoje, Faturamento mês, Clientes ativos, Pendentes
  - Auto-refresh a cada 5 segundos
- **Lista de agendamentos do dia**: cards com hora, cliente, serviço, status
  - Clicar → abre modal de ações (confirmar, concluir, cancelar)
- **Seção "Próximos agendamentos"**: próximos 5 agendamentos futuros
- **FAB**: "Novo Agendamento" → modal com cliente, serviço, data, horário

### 4. Agendamentos

- **Filtros rápidos** no topo: Todos | Pendentes | Confirmados | Concluídos
- **FlatList** com cards:
  - Nome do cliente, serviço, data formatada, horário, valor, status (com cor)
  - Ações diretas no card (ícone):
    - Pendente → Confirmar (abre WhatsApp) + Cancelar
    - Confirmado → Concluir + Cancelar
    - Concluído → sem ações
    - Cancelado → sem ações
- **Pull-to-refresh**
- **Confirmação WhatsApp** (SEMPRE com prefixo 55):
  ```typescript
  let whatsapp = client.whatsapp.replace(/\D/g, '')
  if (!whatsapp.startsWith('55')) whatsapp = '55' + whatsapp
  Linking.openURL(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`)
  ```
- **Modal "Novo Agendamento"**: seletor de cliente (busca), seletor de serviço, date picker, horário

### 5. Clientes

- **FlatList** com nome, WhatsApp, data da última visita
- **SearchBar** no topo (busca por nome ou WhatsApp)
- **Pull-to-refresh**
- **FAB** → modal "Novo Cliente": nome, WhatsApp, observações
- **Ao clicar** no cliente → navega para `clientes/[id].tsx`:

**Perfil do Cliente:**
- Informações: nome, WhatsApp (link direto), observações
- **Aba 1 — Histórico**: FlatList de atendimentos (data, serviço, valor, status)
- **Aba 2 — Fotos**: galeria grid com botão de upload (câmera ou galeria)
  - Ao adicionar foto → POST `/api/clients/[id]/photos` com FormData
  - Long press para deletar

### 6. Serviços

- **FlatList** com nome, preço, duração, miniatura da imagem (se houver)
- **FAB** → modal "Novo Serviço": nome, preço (R$), duração (min), descrição, imagem (URL)
- **Swipe to edit** (abre modal preenchido) / **Swipe to delete** (confirmação)

### 7. "Mais" — Página Pública

- **Preview**: mostrar como está a página (simplificado)
- **Campos editáveis**: imagem de capa (URL), bio, endereço, horários, Instagram, Facebook
- **Toggle** ativar/desativar
- **Botão "Ver página"** → abre Linking para `clubnailsbrasil.com.br/[slug]`

### 8. "Mais" — Perfil

- Nome, email (read-only), WhatsApp, nome do estúdio
- Foto de perfil (com preview, clicar para trocar)
- Botão "Sair" (limpa token e volta ao login)

### 9. "Mais" — Planos

- Cards: Gratuito (R$ 0), Pro (R$ 29,90), Premium (R$ 59,90)
- Destaque no plano atual
- Tabela comparativa: clientes, agendamentos, serviços, financeiro
- Botão "Assinar" → checkout simulado

### 10. Página Pública (Cliente) — `(public)/[slug].tsx`

- **Hero** com imagem de capa + nome do estúdio
- **Sobre**: bio, endereço, horários
- **Serviços**: FlatList horizontal com nome, preço, botão "Agendar"
- **Footer** com WhatsApp, Instagram, Facebook
- **BookingModal** (mesmo fluxo do web):
  1. Selecionar data (14 dias) + horário
  2. Nome + WhatsApp + observações
  3. Confirmar → POST `/api/public/[slug]/book` → abre WhatsApp do estúdio

---

## Regras de Negócio (IMPLEMENTAR SEMPRE)

| Regra | Detalhe |
|-------|---------|
| WhatsApp com `55` | TODO link wa.me deve ter prefixo `55`. Se já tiver, não duplicar. |
| Timezone UTC | Datas vêm em UTC do backend. Exibir em horário local (date-fns). |
| Limite Free | 10 clientes, 50 agendamentos/mês, 5 serviços — avisar ao atingir |
| Trial 15 dias | Se expirou, mostrar tela de upgrade (o backend já bloqueia) |
| Onboarding | Só mostrar se `onboardingStep < 3` ou `onboardingCompleted = false` |
| Token | Salvar no SecureStore. Se 401, redirecionar para login. |
| Auto-refresh | Dashboard: recarregar stats a cada 5 segundos |

---

## Design System (resumido)

```
Cores:
  nude-50:  #FDF8F5   (fundo)
  nude-100: #F9EDE6   (superfície)
  nude-500: #C08B6E   (texto secundário)
  nude-900: #5C3A28   (texto principal)
  rose-500: #F43F5E   (primary)
  rose-600: #E11D48   (primary escuro)
  green-500: #22C55E  (sucesso)
  amber-500: #F59E0B  (pendente)
  blue-500: #3B82F6   (concluído)
  gray-400: #9CA3AF   (cancelado)

Componentes:
  Button, Card, Input, Modal (slide up), StatusBadge,
  EmptyState (ilustração + texto), LoadingOverlay, Toast
```

---

## Estrutura de Pastas

```
clubnails-mobile/
├── app/                        # Expo Router pages
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   ├── (dashboard)/
│   └── (public)/
├── src/
│   ├── api/
│   │   ├── client.ts           # fetch wrapper com token (auto 401 redirect)
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   ├── appointments.ts
│   │   ├── clients.ts
│   │   ├── services.ts
│   │   └── public.ts
│   ├── components/
│   │   ├── ui/                 # Button, Input, Card, Modal, StatusBadge
│   │   └── ...                 # Componentes de negócio
│   ├── hooks/                  # useAuth, useAppointments, etc.
│   ├── stores/                 # authStore, onboardingStore
│   ├── utils/                  # formatCurrency, formatDate, whatsapp helpers
│   ├── types/                  # User, Appointment, Client, Service, etc.
│   └── constants/
│       ├── colors.ts
│       └── plans.ts
├── assets/
├── app.json
└── eas.json
```

---

## Comandos Iniciais

```bash
npx create-expo-app@latest clubnails-mobile --template blank-typescript
cd clubnails-mobile

# Router
npx expo install expo-router expo-linking expo-constants

# Estado e cache
npx expo install @tanstack/react-query zustand

# Storage seguro
npx expo install expo-secure-store

# Notificações
npx expo install expo-notifications expo-device

# UI
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install react-native-toast-message
npx expo install date-fns

# Câmera / galeria
npx expo install expo-image-picker

# Estilização (opcional)
npx expo install nativewind tailwindcss-react-native
```

---

## Critérios de Sucesso do MVP

- [x] Nail designer consegue logar, ver dashboard e agendamentos do dia
- [x] Nail designer consegue confirmar agendamento e abre WhatsApp da cliente
- [x] Nail designer consegue gerenciar clientes (CRUD + histórico + fotos)
- [x] Nail designer consegue gerenciar serviços (CRUD)
- [x] Nail designer consegue configurar a página pública
- [x] Cliente consegue acessar página pública e agendar online
- [x] Novo usuário passa pelo onboarding em 3 passos
- [x] App funciona offline com último dado em cache

**O que fica para depois do MVP:**
- Financeiro completo (despesas, relatórios, gráficos)
- Marketing (promoções, disparo em massa)
- Admin (painel de administração)
- Indicações (programa de referral)
- Fornecedores
- Widget iOS
- Modo escuro
- Internacionalização

---

## Observações

- A URL base da API em produção é `https://www.clubnailsbrasil.com.br`
- Para desenvolvimento local, usar `http://localhost:3000`
- Configurar scheme no `app.json` para deep links: `"scheme": "clubnails"`
- Usar EAS Build para gerar APK/IPA e EAS Submit para publicar nas lojas
- Configurar `expo-updates` para OTA updates (correções sem passar pela loja)
