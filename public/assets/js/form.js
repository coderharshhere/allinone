/* ================= FIREBASE ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= LOGIC ================= */
document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("form[data-service]");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      /* 🔹 DATA COLLECT */
      const data = {
        formType: form.dataset.service || "Income Certificate",
        status: "Payment Done (Manual Verification)",
        createdAt: serverTimestamp()
      };

      new FormData(form).forEach((value, key) => {
        data[key] = value;
      });

      /* 🔐 Aadhaar safety */
      if (data.aadhaar) {
        data.aadhaarLast4 = data.aadhaar.slice(-4);
        delete data.aadhaar;
      }

      /* 🔥 SAVE */
      const docRef = await addDoc(collection(db, "applications"), data);

      const applicationNumber =
        "AIO-" + docRef.id.substring(0, 8).toUpperCase();

      await updateDoc(doc(db, "applications", docRef.id), {
        applicationNumber
      });

      /* 📧 EMAIL */
      if (window.emailjs && data.email) {
        await emailjs.send(
          "service_allinone",
          "template_7x246oi",
          {
            to_email: data.email,
            to_name: data.applicantName || "Applicant",
            application_no: applicationNumber,
            payment_id: data.paymentId || "Provided by user",
            service_type: data.formType
          }
        );
      }

      alert(
        `✅ आवेदन सफल!\n\nआवेदन क्रमांक: ${applicationNumber}`
      );

      window.location.href = "thank-you.html";

    } catch (err) {
      console.error(err);
      alert("❌ आवेदन जमा करने में समस्या आई");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

});
