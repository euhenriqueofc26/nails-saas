#!/bin/bash

# Deploy Script para Nails SaaS
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy..."

# Verificar variáveis de ambiente
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não definida"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERRO: JWT_SECRET não definida"
    exit 1
fi

echo "✅ Variáveis de ambiente OK"

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Criar/atualizar banco
echo "🗄️ Atualizando banco de dados..."
npx prisma db push

# Seed do banco (apenas na primeira vez)
echo "🌱 Verificando seed..."
node -e "
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const plans = await prisma.plan.findMany()
  if (plans.length === 0) {
    console.log('Executando seed...')
    process.exit(1)
  } else {
    console.log('Seed já existe, pulando...')
    process.exit(0)
  }
}
main().finally(() => prisma.\$disconnect())
" && npm run db:seed || echo "Seed já executado anteriormente"

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "📝 Lembre-se de:"
echo "   - Configurar as variáveis de ambiente no Vercel"
echo "   - Fazer o build: npm run build"
echo "   - Deploy no Vercel"
