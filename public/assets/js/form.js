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

/* ================= PDF GENERATOR ================= */
function generateFormPDF(data, applicationNumber) {
  if (!window.jspdf?.jsPDF) {
    console.log("PDF library not loaded");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text("All In One - Application Receipt", 105, 20, { align: "center" });
  
  // Status Warning
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(14);
  doc.text("STATUS: PAYMENT NOT DONE YET", 105, 35, { align: "center" });
  doc.setTextColor(0, 0, 0);
  
  // Application Number
  doc.setFontSize(16);
  doc.text(`Application No: ${applicationNumber}`, 105, 50, { align: "center" });
  
  // Line
  doc.line(20, 55, 190, 55);
  
  let yPos = 70;
  doc.setFontSize(11);
  
  // Add data
  const addLine = (label, value) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(String(value || '-'), 70, yPos);
    yPos += 10;
  };
  
  addLine("Service", data.formType);
  addLine("Status", data.status);
  addLine("Date", new Date().toLocaleDateString());
  
  // Applicant details
  yPos += 5;
  doc.setFont(undefined, 'bold');
  doc.text("Applicant Details:", 20, yPos);
  yPos += 10;
  doc.setFont(undefined, 'normal');
  
  // Loop through data
  Object.keys(data).forEach(key => {
    if (!['formType', 'status', 'createdAt', 'aadhaarLast4'].includes(key) && data[key]) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      addLine(label, data[key]);
    }
  });
  
  if (data.aadhaarLast4) {
    addLine("Aadhaar", `XXXX-XXXX-${data.aadhaarLast4}`);
  }
  
  // Footer note
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(10);
  doc.text("Note: Payment is pending. Complete payment to process application.", 105, 280, { align: "center" });
  
  doc.save(`${applicationNumber}.pdf`);
}

/* ================= LOGIC ================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form[data-service]");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }

    try {
      /* 🔹 DATA COLLECT */
      const data = {
        formType: form.dataset.service || "Income Certificate",
        status: "Payment Not Done Yet",  // 🔴 YEH STATUS HAI
        createdAt: serverTimestamp()
      };

      new FormData(form).forEach((value, key) => {
        if (value.trim()) data[key] = value.trim();
      });

      /* 🔐 Aadhaar safety */
      if (data.aadhaar) {
        data.aadhaarLast4 = data.aadhaar.slice(-4);
        delete data.aadhaar;
      }

      /* 🔥 SAVE TO FIREBASE */
      const docRef = await addDoc(collection(db, "applications"), data);
      const applicationNumber = "AIO-" + docRef.id.substring(0, 8).toUpperCase();

      await updateDoc(doc(db, "applications", docRef.id), {
        applicationNumber
      });

      /* 📄 GENERATE PDF */
      generateFormPDF(data, applicationNumber);

      /* ✅ SIMPLE SUCCESS ALERT */
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "आवेदन सफल!",
          text: `आवेदन क्रमांक: ${applicationNumber}\n\nStatus: PAYMENT NOT DONE YET\n\nकृपया भुगतान करें।`,
          icon: "warning",
          confirmButtonText: "ठीक है"
        }).then(() => {
          window.location.href = "thank-you.html";
        });
      } else {
        alert(`Success! Application No: ${applicationNumber}\nStatus: Payment Not Done Yet`);
        window.location.href = "thank-you.html";
      }

    } catch (err) {
      console.error(err);
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      }
      
      const msg = err.message || "Unknown error";
      
      if (typeof Swal !== 'undefined') {
        Swal.fire("Error", "आवेदन विफल: " + msg, "error");
      } else {
        alert("Error: " + msg);
      }
    }
  });
});
