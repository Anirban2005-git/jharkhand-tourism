import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_SjRmK2cMzL5fSP",   // ✅ exact match
  key_secret: "U878316Y0vM1wQ7T4tzowPpR", // ✅ exact match
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Razorpay test server is running!',
    timestamp: new Date().toISOString()
  });
});

// Create order endpoint
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', providerId } = req.body;

    if (!amount || !providerId) {
      return res.status(400).json({ error: 'Amount and providerId are required' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        providerId: providerId,
        service: 'Tour Guide Booking'
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: order,
      paymentId: `payment_${Date.now()}`
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order: ' + error.message });
  }
});

// Verify payment endpoint
app.post('/api/payments/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ error: 'All payment details are required' });
    }

    // For testing, we'll just return success
    res.json({
      success: true,
      message: 'Payment verified successfully (test mode)',
      payment: {
        id: paymentId,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment: ' + error.message });
  }
});

// Serve static files
app.use(express.static('../dummy.sih'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Razorpay test server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend served from http://localhost:${PORT}`);
});

