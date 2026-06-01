import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authMiddleware } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

const router = Router();

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  mfaEnabled: z.boolean().optional(),
  modules: z.array(z.string()).optional(),
});

// GET /users - list all users
router.get('/users', authMiddleware, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        mfaEnabled: true,
        modules: true,
        createdAt: true,
      },
    });
    
    // Also attach the 'admin' if requested, but let's just return db users
    res.json(users.map(u => ({ ...u, modules: JSON.parse(u.modules) })));
  } catch (error) {
    next(error);
  }
});

// POST /users - create a new user
router.post('/users', authMiddleware, async (req, res, next) => {
  try {
    const { username, password, mfaEnabled, modules } = userSchema.parse(req.body);

    if (!password) {
      return res.status(400).json({ error: 'Password is required for new users' });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        mfaEnabled: mfaEnabled || false,
        modules: JSON.stringify(modules || ['all']),
      },
      select: { id: true, username: true, mfaEnabled: true, modules: true },
    });

    res.json({ ...user, modules: JSON.parse(user.modules) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    next(error);
  }
});

// PUT /users/:id - update a user
router.put('/users/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, mfaEnabled, modules } = userSchema.parse(req.body);

    const data: any = { username, mfaEnabled };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (modules) {
      data.modules = JSON.stringify(modules);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, mfaEnabled: true, modules: true },
    });

    res.json({ ...user, modules: JSON.parse(user.modules) });
  } catch (error) {
     if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    next(error);
  }
});

// DELETE /users/:id - delete a user
router.delete('/users/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Generate and enable MFA for a specific user requires generating a secret
import speakeasy from 'speakeasy';

router.post('/users/:id/mfa/generate', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secretInfo = speakeasy.generateSecret({ name: `QuepasaManager (${user.username})` });
    
    // We can save the secret temporarily or require activation
    await prisma.user.update({
      where: { id },
      data: { mfaSecret: secretInfo.base32 },
    });

    res.json({
      secret: secretInfo.base32,
      otpauth: secretInfo.otpauth_url,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id/mfa/enable', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.mfaSecret) return res.status(400).json({ error: 'MFA not initiated' });

    const isValid = speakeasy.totp.verify({ token, secret: user.mfaSecret, encoding: 'base32' });
    if (!isValid) return res.status(400).json({ error: 'Invalid token' });

    await prisma.user.update({
      where: { id },
      data: { mfaEnabled: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id/mfa/disable', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: { mfaEnabled: false, mfaSecret: null },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
