# 🚀 Guia de Deploy - Nails SaaS

## Variáveis de Ambiente (OBRIGATÓRIAS)

Configure estas variáveis no painel do Vercel (Settings > Environment Variables):

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgres://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Chave secreta (mín 32 chars) | `xyz123...` (gere com: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | URL do projeto | `https://seu-dominio.vercel.app` |

---

## Deploy no Vercel (Passo a Passo)

### 1. Preparar Repositório Git
```bash
# Criar repositório no GitHub
# Subir código:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/nails-saas.git
git push -u origin main
```

### 2. Configurar Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New..." > "Project"
3. Importe o repositório GitHub
4. Em "Environment Variables", adicione:
   - `DATABASE_URL` = sua URL do PostgreSQL
   - `JWT_SECRET` = chave gerada
   - `NEXT_PUBLIC_APP_URL` = URL que o Vercel criar (ex: `https://nails-saas.vercel.app`)
5. Clique em "Deploy"

### 3. Configurar Banco (Primeira Vez)
Após o deploy, execute no terminal local (apontando para o banco de produção):

```bash
# Atualize o .env local com a URL do banco de produção
npx prisma db push
npm run db:seed
```

---

## Banco de Dados Recomendado

### Supabase (Gratuito)
1. Acesse [supabase.com](https://supabase.com)
2. Crie projeto novo
3. Settings > Database > Connection String
4. Copie a URL e use no `DATABASE_URL`

### Railway
1. Acesse [railway.app](https://railway.app)
2. New > Project > PostgreSQL
3. Clique no banco > Connect > Copy URL

---

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run db:setup` | Gera client + push + seed |
| `npm run db:push` | Atualiza schema do banco |
| `npm run db:seed` | Cria planos padrão |
| `vercel --prod` | Deploy de produção |

---

## Problemas Comuns

### "Prisma connection refused"
- Verifique se o PostgreSQL está rodando
- Confirme que a URL está correta

### "Database does not exist"
- Crie o banco no PostgreSQL primeiro
- Ou use o banco fornecido pelo Supabase/Railway

### "Build failed"
- Execute `npm run build` localmente para testar
- Verifique as variáveis de ambiente

---

## Domínio Personalizado

1. Vercel > Settings > Domains
2. Adicione seu domínio (ex: `nails.com.br`)
3. Configure o DNS conforme instrução do Vercel
4. Atualize `NEXT_PUBLIC_APP_URL` para seu domínio

---

## Próximos Passos

- [ ] Criar conta no GitHub
- [ ] Criar conta no Vercel
- [ ] Criar banco PostgreSQL (Supabase ou Railway)
- [ ] Configurar variáveis de ambiente
- [ ] Fazer primeiro deploy
- [ ] Configurar banco com seed
- [ ] Testar aplicação
- [ ] (Opcional) Adicionar domínio próprio
