import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// ==========================================
// PROJETOS
// ==========================================

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
});

// GET /v1/projects
router.get('/v1/projects', authMiddleware, async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true, milestones: true, discussions: true, files: true, members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// POST /v1/projects
router.post('/v1/projects', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, status } = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: { name, description, status: status || 'ativo' }
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// GET /v1/projects/:id
router.get('/v1/projects/:id', authMiddleware, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// GET /v1/projects/:id/details
router.get('/v1/projects/:id/details', authMiddleware, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: { include: { milestone: true } },
        milestones: true,
        members: true,
        files: true,
        discussions: { include: { comments: true } }
      }
    });
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// GET /v1/projects/:id/stats
router.get('/v1/projects/:id/stats', authMiddleware, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: true,
        milestones: true,
        members: true,
        files: true,
        discussions: true
      }
    });
    
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    
    const completedTasks = project.tasks.filter((t: any) => t.status === 'concluida').length;

    res.json({
      tasks: {
        total: project.tasks.length,
        completed: completedTasks,
        pending: project.tasks.length - completedTasks,
        progressPercent: project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0
      },
      milestones: { total: project.milestones.length },
      members: { total: project.members.length },
      files: { total: project.files.length },
      discussions: { total: project.discussions.length }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /v1/projects/:id
router.put('/v1/projects/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, status } = projectSchema.parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, status }
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// DELETE /v1/projects/:id
router.delete('/v1/projects/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// TAREFAS
// ==========================================
router.get('/v1/projects/:projectId/tasks', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await prisma.projectTask.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) { next(error); }
});

router.post('/v1/projects/:projectId/tasks', authMiddleware, async (req, res, next) => {
  try {
    const { title, description, status, priority, milestoneId } = req.body;
    const task = await prisma.projectTask.create({
      data: {
        projectId: req.params.projectId,
        title,
        description,
        status: status || 'pendente',
        priority: priority || 'normal',
        milestoneId: milestoneId || null
      }
    });
    res.json(task);
  } catch (error) { next(error); }
});

router.put('/v1/projects/:projectId/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    const { title, description, status, priority, milestoneId } = req.body;
    const task = await prisma.projectTask.update({
      where: { id: req.params.id },
      data: { title, description, status, priority, milestoneId: milestoneId || null }
    });
    res.json(task);
  } catch (error) { next(error); }
});

router.patch('/v1/projects/:projectId/tasks/:id/status', authMiddleware, async (req, res, next) => {
    try {
      const { status } = req.body;
      const task = await prisma.projectTask.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(task);
    } catch (error) { next(error); }
});

router.delete('/v1/projects/:projectId/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.projectTask.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// ==========================================
// MARCOS (Milestones)
// ==========================================
router.get('/v1/projects/:projectId/milestones', authMiddleware, async (req, res, next) => {
  try {
    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(milestones);
  } catch (error) { next(error); }
});

router.post('/v1/projects/:projectId/milestones', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, dueDate } = req.body;
    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: req.params.projectId,
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });
    res.json(milestone);
  } catch (error) { next(error); }
});

router.put('/v1/projects/:projectId/milestones/:id', authMiddleware, async (req, res, next) => {
    try {
      const { name, description, dueDate } = req.body;
      const milestone = await prisma.projectMilestone.update({
        where: { id: req.params.id },
        data: {
          name,
          description,
          dueDate: dueDate ? new Date(dueDate) : null
        }
      });
      res.json(milestone);
    } catch (error) { next(error); }
  });

router.delete('/v1/projects/:projectId/milestones/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.projectMilestone.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// ==========================================
// DISCUSSÕES
// ==========================================
router.get('/v1/projects/:projectId/discussions', authMiddleware, async (req, res, next) => {
  try {
    const discussions = await prisma.projectDiscussion.findMany({
      where: { projectId: req.params.projectId },
      include: { comments: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(discussions);
  } catch (error) { next(error); }
});

router.post('/v1/projects/:projectId/discussions', authMiddleware, async (req, res, next) => {
  try {
    const { title } = req.body;
    const discussion = await prisma.projectDiscussion.create({
      data: {
        projectId: req.params.projectId,
        title
      },
      include: { comments: true }
    });
    res.json(discussion);
  } catch (error) { next(error); }
});

router.delete('/v1/projects/:projectId/discussions/:id', authMiddleware, async (req, res, next) => {
    try {
      await prisma.projectDiscussion.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) { next(error); }
});

router.post('/v1/projects/:projectId/discussions/:discussionId/comments', authMiddleware, async (req, res, next) => {
  try {
    const { content, authorName, authorId } = req.body;
    const comment = await prisma.projectDiscussionComment.create({
      data: {
        discussionId: req.params.discussionId,
        content,
        authorName,
        authorId
      }
    });
    res.json(comment);
  } catch (error) { next(error); }
});

router.delete('/v1/projects/:projectId/discussions/:discussionId/comments/:id', authMiddleware, async (req, res, next) => {
    try {
      await prisma.projectDiscussionComment.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) { next(error); }
});

// ==========================================
// ARQUIVOS
// ==========================================
router.get('/v1/projects/:projectId/files', authMiddleware, async (req, res, next) => {
    try {
      const files = await prisma.projectFile.findMany({
        where: { projectId: req.params.projectId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(files);
    } catch (error) { next(error); }
});
  
router.post('/v1/projects/:projectId/files', authMiddleware, async (req, res, next) => {
    try {
      const { name, url, size, type } = req.body;
      const file = await prisma.projectFile.create({
        data: {
          projectId: req.params.projectId,
          name, url, size, type
        }
      });
      res.json(file);
    } catch (error) { next(error); }
});

router.delete('/v1/projects/:projectId/files/:id', authMiddleware, async (req, res, next) => {
    try {
      await prisma.projectFile.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) { next(error); }
});

// ==========================================
// EQUIPE (Members)
// ==========================================
router.get('/v1/projects/:projectId/members', authMiddleware, async (req, res, next) => {
    try {
      const members = await prisma.projectMember.findMany({
        where: { projectId: req.params.projectId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(members);
    } catch (error) { next(error); }
});
  
router.post('/v1/projects/:projectId/members', authMiddleware, async (req, res, next) => {
    try {
      const { name, email, role } = req.body;
      const member = await prisma.projectMember.create({
        data: {
          projectId: req.params.projectId,
          name,
          email,
          role: role || 'Membro'
        }
      });
      res.json(member);
    } catch (error) { next(error); }
});

router.delete('/v1/projects/:projectId/members/:id', authMiddleware, async (req, res, next) => {
    try {
      await prisma.projectMember.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) { next(error); }
});

export default router;
