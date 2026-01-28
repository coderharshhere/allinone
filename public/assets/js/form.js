/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

console.log("form.js loaded");

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89"
};

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
