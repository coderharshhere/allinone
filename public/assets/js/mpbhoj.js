import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* ================= FIREBASE INIT ================= */
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

/* ================= EMAILJS INIT ================= */
emailjs.init("-HjIyXVqfuRKrznVE");

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {

  const mpbhojForm = document.getElementById("mpbhojForm");
  if (!mpbhojForm) return;

  /* ========== SUBMIT ========== */
  mpbhojForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const serviceType = getActiveService();

      const name = mpbhojForm.studentName.value;
      const father = mpbhojForm.fatherName.value;
      const mobile = mpbhojForm.querySelector('input[type="tel"]').value;
      const email = mpbhojForm.querySelector('input[type="email"]').value;

      const docRef = await addDoc(collection(db, "mpbhojApplications"), {
        serviceType,
        studentName: name,
        fatherName: father,
        mobile,
        email,
        status: "pending",
        createdAt: serverTimestamp()
      });

      const applicationNumber =
        "MPBHOJ-" + docRef.id.substring(0, 8).toUpperCase();

      await emailjs.send(
        "service_allinone",
        "template_7x246oi",
        {
          to_email: email,
          to_name: name,
          application_no: applicationNumber
        }
      );

      document.getElementById("alertBox").style.display = "block";
      mpbhojForm.reset();

      setTimeout(() => {
        document.getElementById("alertBox").style.display = "none";
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("❌ कुछ त्रुटि हुई");
    }
  });

  /* ========== HEADER / FOOTER ========== */
  fetch("./header.html")
    .then(res => res.text())
    .then(html => document.getElementById("header").innerHTML = html);

  fetch("./footer.html")
    .then(res => res.text())
    .then(html => document.getElementById("footer").innerHTML = html);
});

/* ================= TAB LOGIC ================= */
function openTab(i) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

  document.querySelectorAll(".tab")[i].classList.add("active");
  document.querySelectorAll(".tab-content")[i].classList.add("active");
}

function getActiveService() {
  const services = ["Admission", "Supplement", "Result", "Exam Form", "Other"];
  const tabs = document.querySelectorAll(".tab");

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("active")) return services[i];
  }
  return "Unknown";
}
