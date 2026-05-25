import { Router } from 'express';
import { prisma } from '../db/client';
import { authMiddleware } from '../middlewares/auth.middleware';

import { rabbitMQService } from '../services/rabbitmq.service';

const router = Router();

// Get metrics
router.get('/metrics', authMiddleware, async (req, res, next) => {
  try {
    // Count total events
    const totalEvents = await prisma.eventLog.count();

    // Count events by direction
    const incomingCount = await prisma.eventLog.count({
      where: { direction: 'in' },
    });

    const outgoingCount = await prisma.eventLog.count({
      where: { direction: 'out' },
    });

    // Count active mappings
    const activeWahaMappings = await prisma.sessionMapping.count({
      where: { active: true },
    });

    const activeQuepasaMappings = await prisma.quepasaMapping.count({
      where: { active: true },
    });

    const totalActiveMappings = activeWahaMappings + activeQuepasaMappings;

    // specific integrations
    const quepasaWithChatwoot = await prisma.quepasaMapping.count({
       where: { active: true, chatwootApiToken: { not: '' } }
    });
    
    const quepasaWithTypebot = await prisma.quepasaMapping.count({
       where: { active: true, useTypebot: true }
    });

    const wahaWithChatwoot = await prisma.sessionMapping.count({
       where: { active: true, chatwootApiToken: { not: null } }
    });

    // Waha uses typebotFlowId optionally, it is 'connection-only' if not configured
    const wahaWithTypebot = await prisma.sessionMapping.count({
      where: { 
        active: true, 
        typebotFlowId: { 
          notIn: ['connection-only', ''] 
        } 
      }
    });

    // Count active bots
    const activeNativeBots = await prisma.nativeBotSession.count({
      where: { state: 'menu' }
    });

    const activeTypebots = await prisma.typebotSession.count();

    // Count unique sessions
    const uniqueSessions = await prisma.eventLog.findMany({
      where: { sessionId: { not: null } },
      distinct: ['sessionId'],
      select: { sessionId: true },
    });

    // Count events by session
    const eventsBySession = await prisma.$queryRaw<Array<{ session_id: string; count: bigint }>>`
      SELECT session_id, COUNT(*) as count
      FROM event_logs
      WHERE session_id IS NOT NULL
      GROUP BY session_id
      ORDER BY count DESC
      LIMIT 10
    `;

    // Recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = await prisma.eventLog.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    // Get recent activity details (last 10 events)
    const recentActivity = await prisma.eventLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        sessionId: true,
        direction: true,
        provider: true,
        createdAt: true,
      },
    });

    res.json({
      total_sessions: uniqueSessions.length,
      active_bots: activeNativeBots + activeTypebots,
      active_integrations: totalActiveMappings,
      messages_processed: totalEvents,
      rabbitmq_connected: rabbitMQService.isConnected(),
      recent_events_count: recentEvents,
      instances: {
        quepasa_active: activeQuepasaMappings,
        waha_active: activeWahaMappings,
        chatwoot_connections: quepasaWithChatwoot + wahaWithChatwoot,
        typebot_connections: quepasaWithTypebot + wahaWithTypebot
      },
      recent_activity: recentActivity.map((event: any) => ({
        id: event.id,
        session_name: event.sessionId,
        event_type: `${event.direction === 'in' ? 'Entrada' : 'Saída'} - ${event.provider}`,
        timestamp: event.createdAt.toISOString(),
      })),
      stats: {
        totalEvents,
        incomingCount,
        outgoingCount,
      },
      topSessions: eventsBySession.map((row: any) => ({
        sessionId: row.session_id,
        eventCount: Number(row.count),
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
