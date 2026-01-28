const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true }); // ✅ CORS बहुत जरूरी है

const razorpay = new Razorpay({
  key_id: "rzp_test_S9jk2wxqonRqth",
  key_secret: "L37P5sAIS4nnb3at4BYZzVOw"
});

exports.createOrder = functions.https.onRequest((req, res) => {
  // ✅ CORS Wrapper: इसके बिना Browser से Request फेल हो जाएगी
  cors(req, res, async () => {
    
    // (Optional) सिर्फ POST Request को ही allow करें
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const options = {
        amount: 9900, // ₹99 (Paise में amount होता है)
        currency: "INR",
        receipt: "order_" + Date.now(),
        payment_capture: 1
      };

      const order = await razorpay.orders.create(options);
      
      // ✅ JSON response भेजें
      res.status(200).json(order);

    } catch (error) {
      console.error("Razorpay Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
});
