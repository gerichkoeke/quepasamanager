const { PrismaClient } = require("./node_modules/@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const mappings = await prisma.quepasaMapping.findMany();
  console.log(JSON.stringify(mappings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
