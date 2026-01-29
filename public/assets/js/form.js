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

      const applicationNumber =
        "AIO-" + docRef.id.substring(0, 8).toUpperCase();

      await updateDoc(doc(db, "applications", docRef.id), {
        applicationNumber
      });

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

   /*   alert(
        `✅ आवेदन सफल!\n\nआवेदन क्रमांक: ${applicationNumber}`
      );

      window.location.href = "thank-you.html";

    } catch (err) {
      console.error(err);
      alert("❌ आवेदन जमा करने में समस्या आई");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

});*/

try {
      // ... aapka form submission logic yahan rahega ...

      // 1. SUCCESS POPUP
      Swal.fire({
        title: '<span style="font-size: 20px;">✅ आवेदन सफल!</span>',
        html: `<div style="text-align: center; font-family: 'Hind', sans-serif;">
                <p style="font-size: 15px; color: #4b5563;">धन्यवाद! आपका फॉर्म सबमिट कर दिया गया है।</p>
                <div style="background: #eff6ff; padding: 15px; border-radius: 12px; margin: 15px 0; border: 1px dashed #1e3a8a;">
                    <p style="font-size: 13px; color: #1e3a8a; margin-bottom: 5px;">आपका आवेदन क्रमांक:</p>
                    <p style="font-size: 22px; font-weight: 800; color: #1e3a8a; letter-spacing: 1px;">${applicationNumber}</p>
                </div>
                <p style="font-size: 13px; color: #6b7280;">हमारी टीम आपसे जल्द ही संपर्क करेगी। आप इस नंबर से अपना स्टेटस ट्रैक कर सकते हैं।</p>
               </div>`,
        icon: 'success',
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: 'ठीक है',
        allowOutsideClick: false,
        customClass: {
            popup: 'my-mobile-popup' // Wahi mobile friendly class jo pehle banayi thi
        }
      }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "thank-you.html";
        }
      });

    } catch (err) {
      console.error(err);

      // 2. ERROR POPUP
      Swal.fire({
        title: '<span style="font-size: 18px; color: #dc2626;">❌ आवेदन विफल</span>',
        text: 'सर्वर में समस्या के कारण आपका आवेदन जमा नहीं किया जा सका। कृपया दोबारा प्रयास करें।',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'फिर से कोशिश करें',
        customClass: {
            popup: 'my-mobile-popup'
        }
      });

      if (submitBtn) submitBtn.disabled = false;
    }

