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

/* 📄 PDF LIBRARY ADD करें (jsPDF) */
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
import autoTable from "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js";

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyA-iZvVroV-H6aRs7X-mlnt_ra3_vnaNzg",
  authDomain: "allinone-aa89.firebaseapp.com",
  projectId: "allinone-aa89"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= PDF GENERATOR FUNCTION ================= */
function generateFormPDF(data, applicationNumber) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 128);
  doc.text("All In One - Application Receipt", 105, 20, { align: "center" });
  
  // Application Number (Bar code style)
  doc.setFontSize(16);
  doc.setTextColor(255, 0, 0);
  doc.text(`Application No: ${applicationNumber}`, 105, 35, { align: "center" });
  
  // Line
  doc.setDrawColor(0, 0, 0);
  doc.line(20, 40, 190, 40);
  
  // Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPos = 55;
  const lineHeight = 10;
  
  // Form Type
  doc.setFont(undefined, 'bold');
  doc.text("Service Type:", 20, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(data.formType || "Income Certificate", 60, yPos);
  yPos += lineHeight + 5;
  
  // Status
  doc.setFont(undefined, 'bold');
  doc.text("Status:", 20, yPos);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 128, 0);
  doc.text("Payment Done (Pending Verification)", 60, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += lineHeight + 5;
  
  // Line
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Applicant Details Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Applicant Details", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  
  // Dynamic Data Loop (excluding internal fields)
  const excludeFields = ['formType', 'status', 'createdAt', 'aadhaarLast4', 'paymentId'];
  
  Object.keys(data).forEach(key => {
    if (!excludeFields.includes(key) && data[key]) {
      // Format key name (camelCase to Title Case)
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`${formattedKey}:`, 20, yPos);
      doc.setFont(undefined, 'normal');
      
      // Handle long text
      const text = String(data[key]);
      const splitText = doc.splitTextToSize(text, 120);
      doc.text(splitText, 70, yPos);
      
      yPos += (splitText.length * 5) + 5;
    }
  });
  
  // Aadhaar Last 4 (if exists)
  if (data.aadhaarLast4) {
    doc.setFont(undefined, 'bold');
    doc.text("Aadhaar (Last 4):", 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`XXXX-XXXX-${data.aadhaarLast4}`, 70, yPos);
    yPos += 10;
  }
  
  // Footer
  yPos = 280;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("This is computer generated receipt. Please keep this safe for future reference.", 105, yPos, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, yPos + 5, { align: "center" });
  
  // Download PDF
  doc.save(`Application_${applicationNumber}.pdf`);
}

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

      const applicationNumber = "AIO-" + docRef.id.substring(0, 8).toUpperCase();

      await updateDoc(doc(db, "applications", docRef.id), {
        applicationNumber
      });

      /* 📄 PDF DOWNLOAD (यहाँ PDF generate होगा) */
      generateFormPDF(data, applicationNumber);

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

      /* ✅ SUCCESS POPUP */
      Swal.fire({
        title: "✅ आवेदन सफल!",
        html: `
          <p style="font-size:14px">आपका आवेदन सफलतापूर्वक जमा हो गया है</p>
          <b>आवेदन क्रमांक:</b><br>
          <span style="font-size:20px;color:#d9534f">${applicationNumber}</span>
          <br><br>
          <small style="color:#666">PDF डाउनलोड हो रहा है...</small>
        `,
        icon: "success",
        confirmButtonText: "ठीक है"
      }).then(() => {
        window.location.href = "thank-you.html";
      });

    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "❌ आवेदन विफल",
        text: "कृपया पुनः प्रयास करें",
        icon: "error",
        confirmButtonText: "ठीक है"
      });

      if (submitBtn) submitBtn.disabled = false;
    }
  });

});
