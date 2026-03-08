import { Router } from 'express';
import {
    initializeAppointmentPayment,
    initializeAppointmentValidators,
    initializePaymentValidators,
    initializePremiumPayment,
    mpesaCallback,
} from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/initialize', authenticate, initializePaymentValidators, initializePremiumPayment);
router.post('/appointments/initialize', authenticate, initializeAppointmentValidators, initializeAppointmentPayment);
router.post('/callback', mpesaCallback);

export default router;
