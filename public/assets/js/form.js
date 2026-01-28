/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,       // ✅ Added missing import
  updateDoc  // ✅ Added missing import
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* 🔥 FIREBASE CONFIGURATION */
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89"
};

/* ================= INIT FIREBASE ================= */
// ✅ Initialize App & DB only once
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= LOGIC WRAPPER ================= */
// Wraps everything in an event listener to ensure HTML is loaded
document.addEventListener("DOMContentLoaded", () => {
  
  /* -----------------------------------------------------
     SECTION A: RAZORPAY PAYMENT LOGIC
     (Runs only if 'payNowBtn' exists on the page)
  ----------------------------------------------------- */
  const payBtn = document.getElementById("payNowBtn");
  const paymentForm = document.querySelector("form"); // Assumes the payment button is associated with the first form

  if (payBtn && paymentForm) {
    payBtn.addEventListener("click", async () => {
      
      // 1️⃣ Validate form
      if (!paymentForm.checkValidity()) {
        paymentForm.reportValidity();
        return;
      }

      const originalText = payBtn.innerText;
      payBtn.innerText = "Processing...";
      payBtn.disabled = true;

      try {
        // 2️⃣ CREATE ORDER (BACKEND CALL)
        // Ensure this Cloud Function exists and allows CORS
        const response = await fetch(
          "https://us-central1-allinone-aa89.cloudfunctions.net/createOrder",
          { method: "POST" }
        );

        if (!response.ok) throw new Error("Backend Error");
        const order = await response.json();

        // 3️⃣ RAZORPAY CHECKOUT
        const options = {
          key: "rzp_test_S9jk2wxqonRqth",
          order_id: order.id,
          amount: order.amount,
          currency: "INR",
          name: "AllInOne MP",
          description: "Income Certificate Fee",

          handler: async function (res) {
            try {
              // 4️⃣ Collect form data
              const data = {};
              new FormData(paymentForm).forEach((v, k) => data[k] = v);

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
            } catch (error) {
              console.error("Save Error:", error);
              alert("Payment success but failed to save data. Contact support.");
            }
          },
          modal: {
            ondismiss: () => {
              payBtn.disabled = false;
              payBtn.innerText = originalText;
            }
          }
        };

        // Check if Razorpay is loaded
        if (window.Razorpay) {
          const rzp = new Razorpay(options);
          rzp.open();
        } else {
          alert("Razorpay SDK not loaded. Check your internet or HTML.");
          payBtn.disabled = false;
          payBtn.innerText = originalText;
        }

      } catch (error) {
        console.error("Order Creation Error:", error);
        alert("Server Error: Could not initiate payment.");
        payBtn.disabled = false;
        payBtn.innerText = originalText;
      }
    });
  }

  /* -----------------------------------------------------
     SECTION B: GENERAL SERVICE FORMS
     (Runs for any form with data-service attribute)
  ----------------------------------------------------- */
  const serviceForms = document.querySelectorAll("form[data-service]");

  serviceForms.forEach(form => {
    // Avoid double attaching listener if this form is also the payment form
    if (payBtn && form === paymentForm) return; 

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const submitBtn = form.querySelector("button[type='submit']");
        if(submitBtn) submitBtn.disabled = true;

        /* 🔹 FORM TYPE */
        const formType = form.dataset.service;

        /* 🔥 MASTER DATA OBJECT */
        const data = {
          formType,
          status: "Pending",
          createdAt: serverTimestamp()
        };

        /* 🔹 Auto collect fields */
        new FormData(form).forEach((value, key) => {
          data[key] = value;
        });

        /* 🔐 Aadhaar Safety */
        if (data.aadhaarNumber) {
          data.aadhaarLast4 = data.aadhaarNumber.slice(-4);
          delete data.aadhaarNumber;
        }

        /* 1️⃣ SAVE to Firestore */
        const docRef = await addDoc(collection(db, "applications"), data);

        /* 2️⃣ GENERATE APPLICATION NUMBER (AIO-XXXXXXXX) */
        const applicationNumber = "AIO-" + docRef.id.substring(0, 8).toUpperCase();

        await updateDoc(doc(db, "applications", docRef.id), {
          applicationNumber
        });

        /* 3️⃣ EMAIL CONFIRMATION */
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

        alert(`✅ आवेदन सफलतापूर्वक जमा हो गया\n\nआवेदन क्रमांक: ${applicationNumber}`);
        form.reset();
        if(submitBtn) submitBtn.disabled = false;

      } catch (err) {
        console.error("FORM ERROR:", err);
        alert("❌ आवेदन जमा करने में समस्या आई");
        const submitBtn = form.querySelector("button[type='submit']");
        if(submitBtn) submitBtn.disabled = false;
      }
    });
  });

});
