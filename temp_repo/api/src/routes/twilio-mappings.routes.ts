import { Router } from 'express';
import { prisma } from '../db/client';

const router = Router();

router.get('/twilio-mappings', async (req, res, next) => {
  try {
    const mappings = await prisma.twilioMapping.findMany();
    res.json(mappings);
  } catch (error) {
    next(error);
  }
});

router.post('/twilio-mappings', async (req, res, next) => {
  try {
    const mapping = await prisma.twilioMapping.create({
      data: req.body,
    });
    res.status(201).json(mapping);
  } catch (error) {
    next(error);
  }
});

router.put('/twilio-mappings/:id', async (req, res, next) => {
  try {
    const mapping = await prisma.twilioMapping.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(mapping);
  } catch (error) {
    next(error);
  }
});

router.delete('/twilio-mappings/:id', async (req, res, next) => {
  try {
    await prisma.twilioMapping.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
