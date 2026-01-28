const functions = require("firebase-functions");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_S9jk2wxqonRqth",
  key_secret: "L37P5sAIS4nnb3at4BYZzVOw"
});

exports.createOrder = functions.https.onRequest(async (req, res) => {
  try {
    const options = {
      amount: 9900, // ₹99
      currency: "INR",
      receipt: "income_" + Date.now()
    };

    const order = await razorpay.orders.create(options);
    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
