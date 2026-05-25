const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.eventLog.findMany({
    orderBy: { createdAt: 'desc' },
    where: { provider: 'chatwoot', payload: { path: ['event'], equals: 'conversation_status_changed' } },
    take: 5
  });
  console.log(JSON.stringify(events, null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
