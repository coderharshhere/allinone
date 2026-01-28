/* ================= FIREBASE IMPORTS ================= */
/* ================= FIREBASE ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* 🔥 FIREBASE INIT */
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🔥 ELEMENTS */
const payBtn = document.getElementById("payNowBtn");
const form = document.querySelector("form");

/* 🔥 PAY NOW */
payBtn.addEventListener("click", async () => {

  // 1️⃣ Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  payBtn.innerText = "Processing...";
  payBtn.disabled = true;

  // 2️⃣ CREATE ORDER (BACKEND CALL)
  const response = await fetch(
    "https://us-central1-allinone-aa89.cloudfunctions.net/createOrder",
    { method: "POST" }
  );

  const order = await response.json();

  // 3️⃣ RAZORPAY CHECKOUT
  const options = {
    key: "rzp_test_S9jk2wxqonRqth",
    order_id: order.id,        // ✅ MOST IMPORTANT
    amount: order.amount,
    currency: "INR",
    name: "AllInOne MP",
    description: "Income Certificate Fee",

    handler: async function (res) {

      // 4️⃣ Collect form data
      const data = {};
      new FormData(form).forEach((v, k) => data[k] = v);

      // 5️⃣ Payment info
      data.payment = {
        paymentId: res.razorpay_payment_id,
        orderId: res.razorpay_order_id,
        status: "PAID"
      };

      data.createdAt = serverTimestamp();

      // 6️⃣ Save to Firestore
      await addDoc(collection(db, "applications"), data);

      alert("✅ Payment Successful & Application Submitted");
      window.location.href = "/thank-you.html";
    },

    modal: {
      ondismiss: () => {
        payBtn.disabled = false;
        payBtn.innerText = "Pay Now ₹99";
      }
    }
  };

  new Razorpay(options).open();
});

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= COMMON FORM HANDLER ================= */
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-service]");

  forms.forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        /* 🔹 FORM TYPE (Income / Samagra / Khasra / MP Bhoj) */
        const formType = form.dataset.service; // 👈 REQUIRED

        /* 🔥 MASTER DATA OBJECT */
        const data = {
          formType,                     // 👈 VERY IMPORTANT
          status: "Pending",            // 👈 Admin logic
          createdAt: serverTimestamp()
        };

        /* 🔹 Auto collect all form fields */
        new FormData(form).forEach((value, key) => {
          data[key] = value;
        });

        /* 🔐 Aadhaar safety (store only last 4 digits) */
        if (data.aadhaarNumber) {
          data.aadhaarLast4 = data.aadhaarNumber.slice(-4);
          delete data.aadhaarNumber;
        }

        /* 1️⃣ SAVE → ONLY applications collection */
        const docRef = await addDoc(
          collection(db, "applications"),
          data
        );

        /* 2️⃣ GENERATE APPLICATION NUMBER */
        const applicationNumber =
          "AIO-" + docRef.id.substring(0, 8).toUpperCase();

        await updateDoc(
          doc(db, "applications", docRef.id),
          { applicationNumber }
        );

        /* 3️⃣ EMAIL CONFIRMATION (optional) */
        if (window.emailjs && data.email) {
          await emailjs.send(
            "service_allinone",
            "template_7x246oi",
            {
              to_email: data.email,
              to_name: data.applicantName || "Applicant",
              application_no: applicationNumber,
              service_type: formType
            }
          );
        }

        alert(
          "✅ आवेदन सफलतापूर्वक जमा हो गया\n\n" +
          "आवेदन क्रमांक: " + applicationNumber
        );

        form.reset();

      } catch (err) {
        console.error("FORM ERROR:", err);
        alert("❌ आवेदन जमा करने में समस्या आई");
      }
    });
  });
});
