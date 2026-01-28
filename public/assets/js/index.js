const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true }); // ✅ CORS Allow All Origins

// 🔥 RAZORPAY CONFIGURATION
// (Note: Production में Secret Key को Environment Variable में रखना सुरक्षित होता है)
const razorpay = new Razorpay({
  key_id: "rzp_test_S9jk2wxqonRqth",   // आपकी Public Key
  key_secret: "L37P5sAIS4nnb3at4BYZzVOw" // आपकी Secret Key
});

exports.createOrder = functions.https.onRequest((req, res) => {
  // ✅ 1. CORS Wrapper (सबसे जरूरी)
  cors(req, res, async () => {
    
    // ✅ 2. Method Check (सिर्फ POST Allow करें)
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      // ✅ 3. Amount Setup
      // अगर Frontend से amount भेजा है तो वो लें, नहीं तो Default ₹99 (9900 पैसे)
      const amount = req.body.amount || 9900; 

      const options = {
        amount: amount, 
        currency: "INR",
        receipt: "order_" + Date.now(),
        payment_capture: 1 // Auto capture payment
      };

      // ✅ 4. Create Order via Razorpay
      const order = await razorpay.orders.create(options);
      
      // ✅ 5. Send Success Response
      res.status(200).json(order);

    } catch (error) {
      console.error("Razorpay Error:", error);
      
      // Error response sending back to frontend
      res.status(500).json({ 
        error: "Something went wrong in backend", 
        details: error.message 
      });
    }
  });
});
