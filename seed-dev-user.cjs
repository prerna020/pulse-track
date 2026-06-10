const { PrismaClient } = require('./src/generated/prisma/client.js');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 'dev-user-bypass' },
    update: {},
    create: {
      id: 'dev-user-bypass',
      name: 'Dev User',
      email: 'dev@pulsetrack.local',
    }
  });
  console.log('Dev user ready:', user.id, user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
