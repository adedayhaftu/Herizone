import crypto from 'crypto';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '2060';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';
const DEMO_MODE = process.env.DEMO_MODE === 'true';
const MPESA_BASE = MPESA_ENVIRONMENT === 'production'
  ? 'https://api.safaricom.et'
  : 'https://apisandbox.safaricom.et';

const PREMIUM_PRICE_ETB = Number(process.env.PREMIUM_PRICE_ETB || 99);

export const initializePaymentValidators = [
  body('phone').isString().notEmpty().withMessage('phone is required'),
  body('expertId').optional().isString().trim().notEmpty(),
];

export const initializeAppointmentValidators = [
  body('phone').isString().notEmpty().withMessage('phone is required'),
  body('expertId').isString().notEmpty().withMessage('expertId is required'),
  body('mode').isIn(['chat', 'audio', 'video']).withMessage('mode must be chat|audio|video'),
  body('price').isInt({ gt: 0 }).withMessage('price must be a positive integer'),
];

// Convert 09xxxx -> 2519xxxx and strip +
const normalizePhone = (raw: string): string => {
  let p = raw.replace(/\s+/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('0')) p = '251' + p.slice(1);
  return p;
};

const generateTimestamp = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
};

const generatePassword = (shortcode: string, passkey: string, timestamp: string): string => {
  const hashHex = crypto.createHash('sha256').update(`${shortcode}${passkey}${timestamp}`).digest('hex');
  return Buffer.from(hashHex).toString('base64');
};

const FIVE_PERCENT = 0.05;

const getAccessToken = async (): Promise<string> => {
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error('MPESA_CONSUMER_KEY/MPESA_CONSUMER_SECRET not configured');
  }
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${MPESA_BASE}/v1/token/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = (await res.json()) as any;
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error_description || 'Failed to get access token');
  }
  return data.access_token as string;
};

export const initializePremiumPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!MPESA_PASSKEY) {
    res.status(500).json({ error: 'MPESA_PASSKEY is not configured on the server' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const rawPhone = (req.body as { phone: string }).phone;
    const phone = normalizePhone(rawPhone);
    const timestamp = generateTimestamp();
    const password = generatePassword(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp);

    const merchantRequestId = `premium-${user.id}-${Date.now()}`;

    if (DEMO_MODE) {
      // Simulate a successful STK flow without calling M-Pesa (helps during local testing)
      await prisma.user.update({ where: { id: user.id }, data: { isPremium: true } });
      res.json({
        status: 'demo',
        message: 'Demo mode: payment marked as paid',
        merchantRequestId,
        checkoutRequestId: 'demo-checkout',
      });
      return;
    }

    const token = await getAccessToken();

    const payload = {
      MerchantRequestID: merchantRequestId,
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: PREMIUM_PRICE_ETB,
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payments/callback`,
      AccountReference: user.id,
      TransactionDesc: 'Herizone Premium',
      ReferenceData: [
        { Key: 'ThirdPartyReference', Value: user.id },
      ],
    } as Record<string, unknown>;

    const mpesaRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v3/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await mpesaRes.json()) as any;

    if (!mpesaRes.ok || data.ResponseCode !== '0') {
      const friendly = (() => {
        const code = data?.ResponseCode;
        if (code === '2035' || code === 'SFC_IC0003') {
          return 'M-Pesa reports this phone is not an active wallet in this environment. Please use an M-Pesa-registered number that matches your sandbox/production credentials.';
        }
        return undefined;
      })();

      const message = friendly || data?.ResponseDescription || data?.errorMessage || 'Failed to initiate M-Pesa payment';
      console.error('Mpesa init failed:', data);
      res.status(502).json({ error: message, raw: data });
      return;
    }

    // Optimistically mark premium; for production, confirm via callback/transaction status
    await prisma.user.update({ where: { id: user.id }, data: { isPremium: true } });

    res.json({
      status: 'pending',
      message: data.CustomerMessage ?? 'Payment prompt sent to phone',
      merchantRequestId,
      checkoutRequestId: data.CheckoutRequestID,
    });
  } catch (err: any) {
    console.error('initializePremiumPayment error:', err);
    res.status(500).json({ error: err?.message || 'Could not start M-Pesa payment' });
  }
};

// ─── Appointment Payment (M-Pesa STK) ───────────────────────────────────────

export const initializeAppointmentPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!MPESA_PASSKEY) {
    res.status(500).json({ error: 'MPESA_PASSKEY is not configured on the server' });
    return;
  }

  const { phone: rawPhone, expertId, mode, price } = req.body as {
    phone: string;
    expertId: string;
    mode: 'chat' | 'audio' | 'video';
    price: number;
  };

  try {
    const client = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
    const expert = await prisma.user.findUnique({ where: { id: expertId }, select: { id: true, name: true, priceMin: true, priceMax: true } });

    if (!client || !expert) {
      res.status(404).json({ error: 'User or expert not found' });
      return;
    }

    if (expert.priceMin && price < expert.priceMin) {
      res.status(400).json({ error: `Price cannot be below expert minimum (${expert.priceMin})` });
      return;
    }
    if (expert.priceMax && price > expert.priceMax) {
      res.status(400).json({ error: `Price cannot exceed expert maximum (${expert.priceMax})` });
      return;
    }

    const commission = Math.round(price * FIVE_PERCENT);
    const phone = normalizePhone(rawPhone);
    const timestamp = generateTimestamp();
    const password = generatePassword(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp);

    // Create appointment record first
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        expertId,
        price,
        commission,
        mode,
        status: 'pending',
      },
    });

    const merchantRequestId = `appt-${appointment.id}`;

    if (DEMO_MODE) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'paid', merchantRequestId, checkoutRequestId: 'demo-checkout' },
      });

      res.json({
        status: 'demo',
        message: 'Demo mode: appointment marked as paid',
        appointmentId: appointment.id,
        merchantRequestId,
        checkoutRequestId: 'demo-checkout',
        commission,
      });
      return;
    }

    const token = await getAccessToken();

    const payload = {
      MerchantRequestID: merchantRequestId,
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: price,
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payments/callback`,
      AccountReference: appointment.id,
      TransactionDesc: `Appointment with ${expert.name ?? 'expert'}`,
      ReferenceData: [
        { Key: 'ThirdPartyReference', Value: appointment.id },
        { Key: 'Remarks', Value: mode },
      ],
    } as Record<string, unknown>;

    const mpesaRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v3/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await mpesaRes.json()) as any;

    if (!mpesaRes.ok || data.ResponseCode !== '0') {
      console.error('Mpesa appointment init failed:', data);
      res.status(502).json({ error: data?.ResponseDescription || 'Failed to initiate M-Pesa payment', raw: data });
      return;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'paid', // optimistic; final confirmation via callback
        merchantRequestId,
        checkoutRequestId: data.CheckoutRequestID,
      },
    });

    res.json({
      status: 'pending',
      message: data.CustomerMessage ?? 'Payment prompt sent to phone',
      appointmentId: appointment.id,
      merchantRequestId,
      checkoutRequestId: data.CheckoutRequestID,
      commission,
    });
  } catch (err: any) {
    console.error('initializeAppointmentPayment error:', err);
    res.status(500).json({ error: err?.message || 'Could not start appointment payment' });
  }
};

// Basic callback handler (optional): marks premium when M-Pesa confirms payment (ResultCode 0)
export const mpesaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const cb = (req.body as any)?.Body?.stkCallback;
    if (!cb) {
      res.status(400).json({ received: false });
      return;
    }
    const resultCode = cb.ResultCode;
    const merchantRequestId = cb.MerchantRequestID as string | undefined;
    const amountItem = cb.CallbackMetadata?.Item?.find((i: any) => i.Name === 'Amount');
    const phoneItem = cb.CallbackMetadata?.Item?.find((i: any) => i.Name === 'PhoneNumber');

    const accountRef = cb.AccountReference as string | undefined;

    // Premium flow: MerchantRequestID pattern premium-{userId}-timestamp
    if (merchantRequestId?.startsWith('premium-') || accountRef?.startsWith('premium-')) {
      let userId: string | undefined;
      const mr = merchantRequestId || accountRef;
      if (mr?.startsWith('premium-')) {
        const parts = mr.split('-');
        if (parts.length >= 3) userId = parts[1];
      }
      if (!userId && accountRef && !accountRef.startsWith('appt-')) userId = accountRef;
      if (resultCode === 0 && userId) {
        await prisma.user.update({ where: { id: userId }, data: { isPremium: true } });
      }
    }

    // Appointment flow: MerchantRequestID pattern appt-{appointmentId}
    if (merchantRequestId?.startsWith('appt-') || accountRef?.startsWith('appt-')) {
      const apptId = (merchantRequestId || accountRef)?.replace('appt-', '');
      if (apptId) {
        await prisma.appointment.updateMany({
          where: { id: apptId },
          data: { status: resultCode === 0 ? 'paid' : 'cancelled', checkoutRequestId: cb.CheckoutRequestID ?? undefined },
        });
      }
    }

    res.json({ ok: true, resultCode, amount: amountItem?.Value, phone: phoneItem?.Value });
  } catch (err) {
    console.error('mpesaCallback error', err);
    res.status(500).json({ error: 'Callback handling failed' });
  }
};
