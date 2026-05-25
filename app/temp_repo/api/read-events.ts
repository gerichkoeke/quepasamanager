import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.eventLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    where: { provider: 'chatwoot' }
  });
  console.log(JSON.stringify(logs, null, 2));
}
main();
