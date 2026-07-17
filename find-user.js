const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, slug: true, email: true, role: true } });
    console.log('All users:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  }
  await prisma.$disconnect();
})();
