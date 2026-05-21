const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.eventLog.findMany({
    where: { peer: { contains: '@lid' } },
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.log(JSON.stringify(events, null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
