// Express server to create Razorpay orders
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const RAZORPAY_KEY_ID = 'rzp_test_S81qGkN4miqepM';
const RAZORPAY_KEY_SECRET = 'n5PdmkrRgxQ7I8NIN3J6WJmm';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: receipt,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Razorpay backend running on port ${PORT}`);
});
