import { Router } from 'express';
import { prisma } from '../db/client';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// =====================================
// PATIENTS (Clientes)
// =====================================
router.get('/v1/appointments/patients', authMiddleware, async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({ include: { partner: true }, orderBy: { name: 'asc' } });
    res.json(patients);
  } catch (error) { next(error); }
});

router.post('/v1/appointments/patients', authMiddleware, async (req, res, next) => {
  try {
    const { name, phone, email, cpf, partnerId, observations } = req.body;
    const patient = await prisma.patient.create({
      data: { name, phone, email, cpf, partnerId: partnerId || null, observations }
    });
    res.json(patient);
  } catch (error) { next(error); }
});

router.put('/v1/appointments/patients/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, phone, email, cpf, partnerId, observations } = req.body;
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: { name, phone, email, cpf, partnerId: partnerId || null, observations }
    });
    res.json(patient);
  } catch (error) { next(error); }
});

router.delete('/v1/appointments/patients/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.patient.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});


// =====================================
// PRACTITIONERS (Profissionais)
// =====================================
router.get('/v1/appointments/practitioners', authMiddleware, async (req, res, next) => {
  try {
    const practitioners = await prisma.practitioner.findMany({ orderBy: { name: 'asc' } });
    res.json(practitioners);
  } catch (error) { next(error); }
});

router.post('/v1/appointments/practitioners', authMiddleware, async (req, res, next) => {
  try {
    const { name, specialty, registrations, email, phone, color, bufferMinutes, lunchBreak, availableDays } = req.body;
    const practitioner = await prisma.practitioner.create({
      data: {
        name, specialty, registrations, email, phone, color, bufferMinutes: bufferMinutes || 0,
        lunchBreak: lunchBreak || false, availableDays
      }
    });
    res.json(practitioner);
  } catch (error) { next(error); }
});

router.put('/v1/appointments/practitioners/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, specialty, registrations, email, phone, color, bufferMinutes, lunchBreak, availableDays } = req.body;
    const practitioner = await prisma.practitioner.update({
      where: { id: req.params.id },
      data: {
        name, specialty, registrations, email, phone, color, bufferMinutes: bufferMinutes || 0,
        lunchBreak: lunchBreak || false, availableDays
      }
    });
    res.json(practitioner);
  } catch (error) { next(error); }
});

router.delete('/v1/appointments/practitioners/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.practitioner.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});


// =====================================
// SERVICES (Serviços)
// =====================================
router.get('/v1/appointments/services', authMiddleware, async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    res.json(services);
  } catch (error) { next(error); }
});

router.post('/v1/appointments/services', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, duration, price, color, online } = req.body;
    const service = await prisma.service.create({
      data: { name, description, duration: duration || 60, price: price || 0, color, online: online || false }
    });
    res.json(service);
  } catch (error) { next(error); }
});

router.put('/v1/appointments/services/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, duration, price, color, online } = req.body;
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { name, description, duration: duration || 60, price: price || 0, color, online: online || false }
    });
    res.json(service);
  } catch (error) { next(error); }
});

router.delete('/v1/appointments/services/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});


// =====================================
// HEALTH PLANS (Parceiros)
// =====================================
router.get('/v1/appointments/health-plans', authMiddleware, async (req, res, next) => {
  try {
    const partners = await prisma.healthPlan.findMany({ orderBy: { name: 'asc' } });
    res.json(partners);
  } catch (error) { next(error); }
});

router.post('/v1/appointments/health-plans', authMiddleware, async (req, res, next) => {
  try {
    const { name, type, paymentTerm, ansCode } = req.body;
    const partner = await prisma.healthPlan.create({
      data: { name, type, paymentTerm, ansCode }
    });
    res.json(partner);
  } catch (error) { next(error); }
});

router.put('/v1/appointments/health-plans/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, type, paymentTerm, ansCode } = req.body;
    const partner = await prisma.healthPlan.update({
      where: { id: req.params.id },
      data: { name, type, paymentTerm, ansCode }
    });
    res.json(partner);
  } catch (error) { next(error); }
});

router.delete('/v1/appointments/health-plans/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.healthPlan.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// =====================================
// APPOINTMENTS (Agenda)
// =====================================
router.get('/v1/appointments', authMiddleware, async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        practitioner: true,
        service: true
      },
      orderBy: { startTime: 'asc' }
    });
    res.json(appointments);
  } catch (error) { next(error); }
});

router.post('/v1/appointments', authMiddleware, async (req, res, next) => {
  try {
    const { patientId, practitionerId, serviceId, startTime, endTime, status, notes } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        practitionerId,
        serviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'pendente',
        notes
      },
      include: { patient: true, practitioner: true, service: true }
    });
    res.json(appointment);
  } catch (error) { next(error); }
});

router.put('/v1/appointments/:id', authMiddleware, async (req, res, next) => {
  try {
    const { patientId, practitionerId, serviceId, startTime, endTime, status, notes } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        patientId,
        practitionerId,
        serviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        notes
      },
      include: { patient: true, practitioner: true, service: true }
    });
    res.json(appointment);
  } catch (error) { next(error); }
});

router.patch('/v1/appointments/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(appointment);
  } catch (error) { next(error); }
});

router.delete('/v1/appointments/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// REPORTS
router.get('/v1/appointments/reports/overview', authMiddleware, async (req, res, next) => {
  try {
    const all = await prisma.appointment.findMany();
    const totals = {
      total: all.length,
      confirmados: all.filter((a: any) => a.status === 'confirmado').length,
      pendentes: all.filter((a: any) => a.status === 'pendente').length,
      faltas: all.filter((a: any) => a.status === 'falta').length,
      em_andamento: all.filter((a: any) => a.status === 'em_andamento').length,
      realizados: all.filter((a: any) => a.status === 'realizado').length,
      taxa_comparecimento: 0
    };
    if (totals.total > 0) {
      totals.taxa_comparecimento = Math.round((totals.realizados / totals.total) * 100);
    }
    res.json(totals);
  } catch (error) { next(error); }
});

export default router;
