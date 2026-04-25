import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const router = express.Router();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
let razorpay = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️ Razorpay keys are missing from backend/.env. Payments will be disabled until the keys are configured.');
}

const payments = {};

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Payments router is active' });
});

router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', providerId } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'A valid amount is required' });
    }

    const paymentId = `pay_${Date.now()}`;
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        providerId: providerId || 'default',
        paymentId,
      },
    };

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.',
      });
    }

    const order = await razorpay.orders.create(options);

    payments[paymentId] = {
      id: paymentId,
      orderId: order.id,
      amount,
      currency,
      providerId,
      status: 'created',
      createdAt: new Date(),
    };

    res.json({ success: true, order, paymentId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create order' });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.',
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ success: false, error: 'Missing required verification fields' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid Razorpay signature' });
    }

    if (payments[paymentId]) {
      payments[paymentId].status = 'paid';
      payments[paymentId].razorpayPaymentId = razorpay_payment_id;
      payments[paymentId].updatedAt = new Date();
    }

    res.json({ success: true, message: 'Payment verified successfully', payment: payments[paymentId] });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to verify payment' });
  }
});

export default router;
