import { execSync } from 'child_process';
const dbUrl = 'postgresql://postgres:postgres@localhost:5433/quepasa_manager?schema=public';
execSync(`npx prisma db push --schema=prisma/schema.prisma`, {
  env: { ...process.env, DATABASE_URL: dbUrl },
  stdio: 'inherit',
  cwd: './temp_repo/api'
});
