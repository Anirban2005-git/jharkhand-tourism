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
  res.json({ 
    success: true, 
    message: 'Payments router is active',
    razorpayConfigured: !!razorpay,
    keys: {
      keyId: RAZORPAY_KEY_ID ? `${RAZORPAY_KEY_ID.substring(0, 10)}...` : '❌ MISSING',
      keySecret: RAZORPAY_KEY_SECRET ? '✓ Set' : '❌ MISSING'
    }
  });
});

router.get('/status', (req, res) => {
  res.json({
    razorpayConfigured: !!razorpay,
    RAZORPAY_KEY_ID: RAZORPAY_KEY_ID || 'MISSING',
    RAZORPAY_KEY_SECRET: RAZORPAY_KEY_SECRET ? '***' : 'MISSING',
    razorpayInstance: razorpay ? 'Initialized' : 'Not Initialized'
  });
});

router.post('/create-order', async (req, res) => {
  try {
    console.log('🔵 [CREATE ORDER] Request received:', req.body);
    console.log('🔵 [CREATE ORDER] Razorpay config:', { KEY_ID: RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing', KEY_SECRET: RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Missing' });
    
    const { amount, currency = 'INR', providerId } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'A valid amount is required' });
    }

    const paymentId = `pay_${Date.now()}`;
    const amountInPaise = Math.round(amount * 100);
    
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        providerId: providerId || 'default',
        paymentId,
      },
    };

    console.log('🔵 [CREATE ORDER] Order options:', options);

    if (!razorpay) {
      console.error('❌ [CREATE ORDER] Razorpay instance not initialized');
      return res.status(500).json({
        success: false,
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.',
      });
    }

    console.log('🔵 [CREATE ORDER] Creating order with Razorpay...');
    const order = await razorpay.orders.create(options);
    console.log('✅ [CREATE ORDER] Order created successfully:', order);

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
    console.error('❌ [CREATE ORDER] Error:', error.message, error.response?.data || error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create order',
      details: error.response?.data || null
    });
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
      .createHmac('sha256', RAZORPAY_KEY_SECRET) // ✅ FIX 2 (changed)
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