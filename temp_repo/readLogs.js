import { PrismaClient } from './temp_repo/api/node_modules/@prisma/client/index.js';
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.eventLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  for (const log of logs) {
    if (log.payload && typeof log.payload === 'object' && JSON.stringify(log.payload).includes('WhatsApp')) {
      console.log(JSON.stringify(log.payload, null, 2));
    }
  }
}
main().catch(console.error);
