import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const app = express();
const PORT = process.env.PORT || 5501;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Razorpay
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
let razorpay = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized');
} else {
  console.warn('⚠️ Razorpay keys missing from backend/.env');
}

const payments = {};

// Payment routes
app.get('/api/payments', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payments API is active',
    razorpayConfigured: !!razorpay
  });
});

app.post('/api/payments/create-order', async (req, res) => {
  try {
    console.log('🔵 [CREATE ORDER] Request received:', req.body);
    
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

    console.log('🔵 [CREATE ORDER] Order options:', { amount: amountInPaise, currency });

    if (!razorpay) {
      console.error('❌ [CREATE ORDER] Razorpay not initialized');
      return res.status(500).json({
        success: false,
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.',
      });
    }

    console.log('🔵 [CREATE ORDER] Creating Razorpay order...');
    const order = await razorpay.orders.create(options);
    console.log('✅ [CREATE ORDER] Order created:', order.id);

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
    console.error('❌ [CREATE ORDER] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create order'
    });
  }
});

app.post('/api/payments/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay is not configured.',
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing verification fields' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    if (payments[paymentId]) {
      payments[paymentId].status = 'paid';
    }

    res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    console.error('❌ [VERIFY] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'welcome.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Preview server running at http://localhost:${PORT}/`);
  console.log(`💳 Payment API enabled: ${razorpay ? '✅ YES' : '❌ NO (check backend/.env)'}`);
  console.log(`📱 Open: http://127.0.0.1:${PORT}/Jharkhand_tourism_final/digitalanother.html`);
});