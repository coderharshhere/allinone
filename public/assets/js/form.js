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
        const serviceType = form.dataset.service;
        const collectionName =
          form.dataset.collection || "applications";

        const data = {
          serviceType,
          status: "pending",
          createdAt: serverTimestamp()
        };

        // 🔹 form ke sab fields auto collect
        new FormData(form).forEach((value, key) => {
          data[key] = value;
        });

        // 🔹 Aadhaar safety (Samagra)
        if (data.aadhaarNumber) {
          data.aadhaarLast4 = data.aadhaarNumber.slice(-4);
          delete data.aadhaarNumber;
        }

        /* 1️⃣ SAVE */
        const docRef = await addDoc(
          collection(db, collectionName),
          data
        );

        /* 2️⃣ APPLICATION NUMBER */
        const applicationNumber =
          "AIO-" + docRef.id.substring(0, 8).toUpperCase();

        await updateDoc(
          doc(db, collectionName, docRef.id),
          { applicationNumber }
        );

        /* 3️⃣ EMAIL */
        if (window.emailjs && data.email) {
          await emailjs.send(
            "service_allinone",
            "template_7x246oi",
            {
              to_email: data.email,
              to_name: data.applicantName || "Applicant",
              application_no: applicationNumber,
              service_type: serviceType
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
