// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89",
  storageBucket: "allinone-aa89.firebasestorage.app",
  messagingSenderId: "924003122498",
  appId: "1:924003122498:web:2c86505457236e60055cdb"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= EMAILJS INIT =================
emailjs.init("-HjIyXVqfuRKrznVE");

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("mpbhojForm");
  const alertBox = document.getElementById("alertBox");

  if (!form) return;

  // ================= FORM SUBMIT =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // 🔹 active tab service
      const serviceType = getActiveService();

      // 🔹 common fields
      const studentName = form.studentName?.value || "";
      const fatherName = form.fatherName?.value || "";
      const mobile = form.mobile?.value || "";
      const email = form.email?.value || "";

      // 🔹 save to firestore
      const docRef = await addDoc(
        collection(db, "mpbhojApplications"),
        {
          serviceType: serviceType,
          studentName: studentName,
          fatherName: fatherName,
          mobile: mobile,
          email: email,
          status: "pending",
          createdAt: serverTimestamp()
        }
      );

      // 🔹 application number
      const applicationNumber =
        "MPBHOJ-" + docRef.id.substring(0, 8).toUpperCase();

      // 🔹 send email
      if (email) {
        await emailjs.send(
          "service_allinone",
          "template_7x246oi",
          {
            to_email: email,
            to_name: studentName || "Student",
            application_no: applicationNumber
          }
        );
      }

      // 🔹 success UI
      if (alertBox) {
        alertBox.style.display = "block";
      }

      form.reset();

      setTimeout(() => {
        if (alertBox) alertBox.style.display = "none";
      }, 3000);

    } catch (error) {
      console.error("MPBHOJ ERROR:", error);
      alert("❌ आवेदन जमा करने में समस्या आई");
    }
  });

  // ================= HEADER =================
  fetch("./header.html")
    .then(res => res.text())
    .then(html => {
      const h = document.getElementById("header");
      if (h) h.innerHTML = html;
    });

  // ================= FOOTER =================
  fetch("./footer.html")
    .then(res => res.text())
    .then(html => {
      const f = document.getElementById("footer");
      if (f) f.innerHTML = html;
    });

});

// ================= ACTIVE TAB SERVICE =================
function getActiveService() {
  const tabs = document.querySelectorAll(".tab");
  const services = [
    "Admission",
    "Supplement",
    "Result",
    "Exam Form",
    "Other"
  ];

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("active")) {
      return services[i];
    }
  }
  return "Unknown";
}
