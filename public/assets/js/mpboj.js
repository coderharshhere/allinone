import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
console.log("form.js loaded");
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
console.log("mpbhoj.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const mpbhojForm = document.getElementById("mpbhojForm");
  if (!mpbhojForm) return;

  mpbhojForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("MPBHOJ submit handler working");

    try {
      // 🔹 Active tab service detect
      const serviceType = getActiveService();

      // 🔹 COMMON FIELDS (safe way)
      const name = mpbhojForm.studentName.value;
const father = mpbhojForm.fatherName.value;
      const mobile =
        mpbhojForm.querySelector('input[type="tel"]')?.value || "";
      const email =
        mpbhojForm.querySelector('input[type="email"]')?.value || "";

      // 🔹 FIREBASE SAVE
      const docRef = await addDoc(collection(db, "mpbhojApplications"), {
        serviceType: serviceType,
        studentName: name,
        fatherName: father,
        mobile: mobile,
        email: email,
        status: "pending",
        createdAt: serverTimestamp()
      });

      const applicationNumber =
        "MPBHOJ-" + docRef.id.substring(0, 8).toUpperCase();

      // 🔹 EMAIL
      await window.emailjs.send(
        "service_allinone",
        "template_7x246oi",
        {
          to_email: email,
          to_name: name || "Student",
          application_no: applicationNumber
        }
      );

      // 🔹 SUCCESS UI
      document.getElementById("alertBox").style.display = "block";
      mpbhojForm.reset();

      setTimeout(() => {
        document.getElementById("alertBox").style.display = "none";
      }, 3000);

    } catch (err) {
      console.error(err);
      document.getElementById("errorBox").style.display = "block";
    }
    // 🔹 Active tab detect
function getActiveService() {
  const tabs = document.querySelectorAll(".tab");
  const services = ["Admission", "Supplement", "Result", "Exam Form", "Other"];

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("active")) {
      return services[i];
    }
  }
  return "Unknown";
}
  });

