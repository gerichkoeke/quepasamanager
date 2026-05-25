import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.eventLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    where: { 
      provider: 'chatwoot', 
      payload: { path: ['event'], equals: 'conversation_status_changed' } 
    }
  });
  console.log(JSON.stringify(logs, null, 2));
}
main();
