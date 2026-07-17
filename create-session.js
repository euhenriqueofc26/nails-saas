const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    // Remove existing session if any
    await prisma.whatsAppSession.deleteMany({ where: { userId: 'cmlzot8e30001gb9o1xyrro9x' } });

    const session = await prisma.whatsAppSession.create({
      data: {
        userId: 'cmlzot8e30001gb9o1xyrro9x',
        instanceName: 'clubnailsbrasil',
        status: 'CONNECTED',
        phoneNumber: '5511954316390',
      },
    });
    console.log('Session created:', JSON.stringify(session, null, 2));
  } catch (e) {
    console.error(e);
  }
  await prisma.$disconnect();
})();
