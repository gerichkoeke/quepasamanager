import { Router } from 'express';
import { prisma } from '../db/client';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check database
    let dbStatus = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'down';
    }

    const health = {
      ok: dbStatus === 'up',
      db: dbStatus,
      time: new Date().toISOString(),
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Health check failed',
      time: new Date().toISOString(),
    });
  }
});

export default router;
