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
  projectId: "allinone-aa89",
  storageBucket: "allinone-aa89.firebasestorage.app",
  messagingSenderId: "924003122498",
  appId: "1:924003122498:web:2c86505457236e60055cdb"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= COMMON FORM HANDLER ================= */
document.addEventListener("DOMContentLoaded", () => {

  // 🔥 jitne bhi forms me data-service hoga sab handle honge
  const forms = document.querySelectorAll("form[data-service]");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Submitting:", form.id);

      try {
        const serviceType = form.serviceType.value;

        /* 1️⃣ SAVE DATA */
        const docRef = await addDoc(collection(db, "applications"), {
          applicantName: form.applicantName?.value || "",
          fatherName: form.fatherName?.value || "",
          samagraId: form.samagraId?.value || "",
          aadhaar: form.aadhaar?.value || "",
          email: form.email?.value || "",
          mobile: form.mobile?.value || "",

          gender: form.gender?.value || "",
          district: form.district?.value || "",
          pincode: form.pincode?.value || "",
          state: form.state?.value || "",
          tehsil: form.tehsil?.value || "",
          village: form.village?.value || "",
          fullAddress: form.fullAddress?.value || "",
          occupation: form.occupation?.value || "",
          annualIncome: form.annualIncome?.value || "",

          serviceType: serviceType,   // ✅ dynamic category
          status: "pending",
          createdAt: serverTimestamp()
        });

        /* 2️⃣ APPLICATION NUMBER */
        const applicationNumber =
          "AIO-" + docRef.id.substring(0, 8).toUpperCase();

        /* 3️⃣ UPDATE DOC */
        await updateDoc(doc(db, "applications", docRef.id), {
          applicationNumber
        });

        /* 4️⃣ EMAIL (OPTIONAL) */
        if (window.emailjs && form.email?.value) {
          await emailjs.send(
            "service_allinone",
            "template_7x246oi",
            {
              to_email: form.email.value,
              to_name: form.applicantName?.value || "Applicant",
              application_no: applicationNumber,
              service_type: serviceType
            }
          );
        }

        /* 5️⃣ SUCCESS */
        alert(
          "✅ आवेदन सफलतापूर्वक जमा हो गया\n\n" +
          "सेवा: " + serviceType + "\n" +
          "आवेदन क्रमांक: " + applicationNumber
        );

        form.reset();

      } catch (error) {
        console.error(error);
        alert("❌ आवेदन जमा करने में समस्या आई");
      }
    });
  });
});
