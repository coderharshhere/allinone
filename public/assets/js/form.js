console.log("form.js loaded");

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ================= FIREBASE INIT =================
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89",
  storageBucket: "allinone-aa89.firebasestorage.app",
  messagingSenderId: "924003122498",
  appId: "1:924003122498:web:2c86505457236e60055cdb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  // ================= INCOME FORM =================
  const incomeForm = document.getElementById("incomeForm");
  if (!incomeForm) return; // agar ye page income form ka nahi hai
incomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("submit handler working");

    try {
      const docRef = await addDoc(collection(db, "applications"), {
        applicantName: incomeForm.applicantName.value,
        fatherName: incomeForm.fatherName.value,
        samagraId: incomeForm.samagraId.value,
        aadhaar: incomeForm.aadhaar.value,
        email: incomeForm.email.value,
        mobile: incomeForm.mobile.value,

        gender: incomeForm.gender.value,
        district: incomeForm.district.value,
        pincode: incomeForm.pincode.value,
        state: incomeForm.state.value,
        tehsil: incomeForm.tehsil.value,
        village: incomeForm.village.value,
        fullAddress: incomeForm.fullAddress.value,
        occupation: incomeForm.occupation.value,

        annualIncome: incomeForm.annualIncome.value,
        serviceType: "Income Certificate",
        status: "pending",
        createdAt: serverTimestamp()
      });

      const applicationNumber =
        "AIO-" + docRef.id.substring(0, 8).toUpperCase();

      await emailjs.send(
        "service_allinone",
        "template_7x246oi",
        {
          to_email: incomeForm.email.value,
          to_name: incomeForm.applicantName.value,
          application_no: applicationNumber
        }
      );

      alert(
        "✅ आवेदन सफलतापूर्वक जमा हो गया\n\n" +
        "Application ID: " + applicationNumber
      );

      incomeForm.reset();

    } catch (err) {
      console.error(err);
      alert("❌ आवेदन में समस्या आई");
    }
  });

});
