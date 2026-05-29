import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
  mfaCode: z.string().optional(),
});

// Login using username and password
router.post('/auth/local', async (req, res, next) => {
  try {
    const { username, password, mfaCode } = loginSchema.parse(req.body);

    const userSetting = await prisma.appSetting.findUnique({
      where: { key: 'admin_username' },
    });

    const passSetting = await prisma.appSetting.findUnique({
      where: { key: 'admin_password' },
    });
    
    // If no user is configured, fail (they must use token)
    if (!userSetting || !userSetting.value || !passSetting || !passSetting.value) {
      return res.status(401).json({ error: 'Usuário não configurado. Use o token.' });
    }

    if (username !== userSetting.value) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, passSetting.value);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Check MFA if enabled
    const mfaEnabledSetting = await prisma.appSetting.findUnique({
      where: { key: 'admin_mfa_enabled' },
    });
    
    if (mfaEnabledSetting && mfaEnabledSetting.value === 'true') {
      const mfaSecretSetting = await prisma.appSetting.findUnique({
        where: { key: 'admin_mfa_secret' },
      });

      if (!mfaCode) {
        return res.status(401).json({ error: 'Código MFA obrigatório', requireMfa: true });
      }

      if (mfaSecretSetting && mfaSecretSetting.value) {
        const isValidMfa = speakeasy.totp.verify({
          token: mfaCode,
          secret: mfaSecretSetting.value,
          encoding: 'base32',
        });

        if (!isValidMfa) {
          return res.status(401).json({ error: 'Código MFA inválido' });
        }
      }
    }

    // Success - return the token
    logger.info({ username }, 'User logged in via local auth');
    res.json({ token: config.adminToken, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors });
    }
    next(error);
  }
});

// Admin config for local login (requires existing token to configure)
const configSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
});

router.post('/auth/local/config', authMiddleware, async (req, res, next) => {
  try {
    const { username, password } = configSchema.parse(req.body);

    if (username) {
      await prisma.appSetting.upsert({
        where: { key: 'admin_username' },
        update: { value: username },
        create: { key: 'admin_username', value: username },
      });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await prisma.appSetting.upsert({
        where: { key: 'admin_password' },
        update: { value: hashed },
        create: { key: 'admin_password', value: hashed },
      });
    }

    res.json({ success: true, message: 'Configurações de acesso salvas' });
  } catch (error) {
    next(error);
  }
});

router.get('/auth/local/config', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.appSetting.findUnique({ where: { key: 'admin_username' } });
    const mfaEnabled = await prisma.appSetting.findUnique({ where: { key: 'admin_mfa_enabled' } });

    res.json({
      configured: !!user?.value,
      mfaEnabled: mfaEnabled?.value === 'true',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/mfa/generate', authMiddleware, async (req, res, next) => {
  try {
    const userSetting = await prisma.appSetting.findUnique({
      where: { key: 'admin_username' },
    });
    const username = userSetting?.value || 'admin';
    const secretInfo = speakeasy.generateSecret({ name: `QuepasaManager (${username})` });

    res.json({
      secret: secretInfo.base32,
      otpauth: secretInfo.otpauth_url,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/mfa/enable', authMiddleware, async (req, res, next) => {
  try {
    const { secret, token } = req.body;
    
    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret e Token são obrigatórios' });
    }

    const isValid = speakeasy.totp.verify({ token, secret, encoding: 'base32' });
    if (!isValid) {
      return res.status(400).json({ error: 'Token MFA inválido' });
    }

    await prisma.appSetting.upsert({
      where: { key: 'admin_mfa_secret' },
      update: { value: secret },
      create: { key: 'admin_mfa_secret', value: secret },
    });

    await prisma.appSetting.upsert({
      where: { key: 'admin_mfa_enabled' },
      update: { value: 'true' },
      create: { key: 'admin_mfa_enabled', value: 'true' },
    });

    res.json({ success: true, message: 'MFA ativado com sucesso' });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/mfa/disable', authMiddleware, async (req, res, next) => {
  try {
    await prisma.appSetting.upsert({
      where: { key: 'admin_mfa_enabled' },
      update: { value: 'false' },
      create: { key: 'admin_mfa_enabled', value: 'false' },
    });

    res.json({ success: true, message: 'MFA desativado' });
  } catch (error) {
    next(error);
  }
});

export default router;
