const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();
const razorpay = new Razorpay({
  key_id: 'rzp_test_Ed0wchKGa0L0Sw',
  key_secret: 'QWRxnmVi26Y7AO53RGXN5nqR',
});

router.post('/create_order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: req.body.currency,
      receipt: req.body.receipt,
      payment_capture: req.body.payment_capture,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/verify_payment', (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  const secret = 'YOUR_RAZORPAY_TEST_KEY_SECRET';

  const hash = crypto.createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (hash === signature) {
    res.json({ status: 'success' });
  } else {
    res.status(400).json({ status: 'failure' });
  }
});

module.exports = router;
