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
  // Check if jsPDF is available
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error("jsPDF library not loaded");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 128);
  doc.text("All In One - Application Receipt", 105, 20, { align: "center" });
  
  // Application Number
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
  
  // Form Type & Status
  doc.setFont(undefined, 'bold');
  doc.text("Service Type:", 20, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(data.formType || "Income Certificate", 70, yPos);
  yPos += lineHeight;
  
  doc.setFont(undefined, 'bold');
  doc.text("Status:", 20, yPos);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 128, 0);
  doc.text("Payment Done (Pending Verification)", 70, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += lineHeight + 5;
  
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Applicant Details
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Applicant Details", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  
  const excludeFields = ['formType', 'status', 'createdAt', 'aadhaarLast4'];
  
  Object.keys(data).forEach(key => {
    if (!excludeFields.includes(key) && data[key] && key !== 'aadhaar') {
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
      
      const text = String(data[key]);
      const splitText = doc.splitTextToSize(text, 110);
      doc.text(splitText, 70, yPos);
      
      yPos += (splitText.length * 6) + 4;
    }
  });
  
  // Aadhaar Last 4
  if (data.aadhaarLast4) {
    doc.setFont(undefined, 'bold');
    doc.text("Aadhaar (Last 4):", 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`XXXX-XXXX-${data.aadhaarLast4}`, 70, yPos);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Computer generated receipt. Keep safe for future reference.", 105, 280, { align: "center" });
  doc.text(`Date: ${new Date().toLocaleString('en-IN')}`, 105, 285, { align: "center" });
  
  // Download
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

      /* 🔥 SAVE TO FIREBASE */
      const docRef = await addDoc(collection(db, "applications"), data);
      const applicationNumber = "AIO-" + docRef.id.substring(0, 8).toUpperCase();

      await updateDoc(doc(db, "applications", docRef.id), {
        applicationNumber
      });

      /* 📄 GENERATE PDF */
      generateFormPDF(data, applicationNumber);

      /* 📧 EMAIL */
      if (window.emailjs && data.email) {
        try {
          await emailjs.send(
            "service_allinone",
            "template_7x246oi",
            {
              to_email: data.email,
              to_name: data.applicantName || data.name || "Applicant",
              application_no: applicationNumber,
              payment_id: data.paymentId || "Manual",
              service_type: data.formType
            }
          );
        } catch (emailErr) {
          console.error("Email failed:", emailErr);
        }
      }

      /* ✅ SUCCESS MESSAGE (Swal Check) */
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "✅ आवेदन सफल!",
          html: `
            <div style="text-align:center">
              <p>आपका आवेदन सफलतापूर्वक जमा हो गया है</p>
              <div style="background:#f0f0f0;padding:10px;border-radius:5px;margin:10px 0">
                <b>आवेदन क्रमांक:</b><br>
                <span style="font-size:24px;color:#d9534f;font-weight:bold">${applicationNumber}</span>
              </div>
              <small style="color:#666">PDF डाउनलोड हो रहा है...</small>
            </div>
          `,
          icon: "success",
          confirmButtonText: "ठीक है",
          allowOutsideClick: false
        }).then(() => {
          window.location.href = "thank-you.html";
        });
      } else {
        // Fallback if Swal not loaded
        alert(`आवेदन सफल!\nआवेदन क्रमांक: ${applicationNumber}`);
        window.location.href = "thank-you.html";
      }

    } catch (err) {
      console.error("Submit Error:", err);
      
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "❌ आवेदन विफल",
          text: "कृपया पुनः प्रयास करें | Error: " + err.message,
          icon: "error",
          confirmButtonText: "ठीक है"
        });
      } else {
        alert("Error: " + err.message);
      }
      
      if (submitBtn) submitBtn.disabled = false;
    }
  });

});
