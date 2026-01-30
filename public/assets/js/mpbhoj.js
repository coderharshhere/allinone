import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
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

// ================= EMAILJS INIT =================
emailjs.init("-HjIyXVqfuRKrznVE");

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("mpbhojForm");
  if (!form) {
    console.error("❌ Form not found");
    return;
  }

  // ================= SUBMIT =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      // कौन सा टैब/सर्विस एक्टिव है
      const serviceType = getActiveService();
      const activeTabIndex = getActiveTabIndex();

      // सिर्फ एक्टिव टैब के फील्ड्स लें
      const activeContent = document.querySelectorAll(".tab-content")[activeTabIndex];
      const formData = {};

      // एक्टिव टैब के सभी input, select, textarea से डेटा लें
      activeContent.querySelectorAll("[name]").forEach(el => {
        if (el.type === "checkbox") {
          formData[el.name] = el.checked;
        } else if (el.type === "radio") {
          if (el.checked) formData[el.name] = el.value;
        } else {
          formData[el.name] = el.value.trim();
        }
      });

      /* 🔹 MAIN DATA OBJECT */
      const data = {
        formType: serviceType,           // "Admission", "Supplement", "Result", "Exam", "Other"
        serviceCategory: "MPBHOJ",       // पहचान के लिए
        serviceName: "MP Bhoj University",
        formData: formData,              // सारा फॉर्म डेटा यहाँ
        status: "Pending",               // शुरुआती स्टेटस
        paymentStatus: "Unpaid",         // पेमेंट स्टेटस
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      /* 🔐 Aadhaar Safety (Last 4 digits only) */
      if (formData.aadharNo || formData.aadhaar) {
        const aadhar = formData.aadharNo || formData.aadhaar;
        data.aadharLast4 = aadhar.slice(-4);
        delete formData.aadharNo;
        delete formData.aadhaar;
      }

      /* 🔥 SAVE TO DATABASE (applications collection) */
      const docRef = await addDoc(collection(db, "applications"), data);

      /* 🔢 GENERATE APPLICATION NUMBER - इसी तरह जैसे Income Certificate में है */
      const applicationNumber = "MPBHOJ-" + docRef.id.substring(0, 8).toUpperCase();

      /* 📝 UPDATE DOCUMENT WITH APPLICATION NUMBER */
      await updateDoc(doc(db, "applications", docRef.id), {
        applicationNumber: applicationNumber
      });

      /* 📧 EMAIL SEND (optional) */
      try {
        const userEmail = formData.email || formData.txtEmailId || "";
        const userName = formData.studentName || formData.firstName || formData.txtFname || "Student";
        
        if (window.emailjs && userEmail) {
          await emailjs.send(
            "service_allinone",
            "template_7x246oi",
            {
              to_email: userEmail,
              to_name: userName,
              application_no: applicationNumber,
              service_type: serviceType,
              service_category: "MP Bhoj Open University"
            }
          );
        }
      } catch (emailErr) {
        console.warn("📧 Email failed but data saved", emailErr);
      }

      /* ✅ SUCCESS POPUP (SweetAlert) - Income Certificate जैसा */
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "✅ आवेदन सफल!",
          html: `
            <div style="text-align: center;">
              <p style="font-size: 16px; margin-bottom: 10px;">आपका आवेदन सफलतापूर्वक जमा हो गया है</p>
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">कृपया इस आवेदन क्रमांक को सुरक्षित रखें</p>
              <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; border: 2px dashed #667eea;">
                <b style="font-size: 14px; color: #333;">आवेदन क्रमांक:</b><br>
                <span style="font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px;">${applicationNumber}</span>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 10px;">Service: ${serviceType}</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "ठीक है",
          confirmButtonColor: "#667eea",
          allowOutsideClick: false
        }).then(() => {
          form.reset();
          // Optional: Redirect to thank you page
          // window.location.href = "thank-you.html?app=" + applicationNumber;
        });
      } else {
        // अगर SweetAlert न हो तो simple alert
        alert(`✅ आवेदन सफल!\n\nआवेदन क्रमांक: ${applicationNumber}\n\nकृपया इसे नोट कर लें।`);
        form.reset();
      }

    } catch (err) {
      console.error("🔥 Firebase Error:", err);
      
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "❌ आवेदन विफल",
          text: "डेटा सेव नहीं हो पाया। कृपया पुनः प्रयास करें।",
          icon: "error",
          confirmButtonText: "ठीक है"
        });
      } else {
        alert("❌ डेटा सेव नहीं हो पाया। कृपया फिर से प्रयास करें।");
      }
      
      if (submitBtn) submitBtn.disabled = false;
    }
  });

}); // DOMContentLoaded END

// ================= HELPER FUNCTIONS =================

// कौन सा टैब एक्टिव है (नाम)
function getActiveService() {
  const tabs = document.querySelectorAll(".tab");
  const services = ["Admission", "Supplement", "Result", "Exam", "Other"];

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("active")) return services[i];
  }
  return "Unknown";
}

// कौन सा टैब एक्टिव है (इंडेक्स)
function getActiveTabIndex() {
  const tabs = document.querySelectorAll(".tab");
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("active")) return i;
  }
  return 0;
}

// Tab switching logic
window.openTab = function (i) {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(t => t.classList.remove("active"));
  contents.forEach(c => {
    c.classList.remove("active");
    c.querySelectorAll("[data-required]").forEach(el =>
      el.removeAttribute("required")
    );
  });

  tabs[i].classList.add("active");
  contents[i].classList.add("active");

  contents[i].querySelectorAll("[data-required]").forEach(el =>
    el.setAttribute("required", "")
  );
};

// Address copy function
window.copyAddress = function() {
  const fields = ['House', 'Colony', 'City', 'State', 'District', 'Pin'];
  fields.forEach(field => {
    const corr = document.querySelector(`[name="corr${field}"]`);
    const perm = document.querySelector(`[name="perm${field}"]`);
    if (corr && perm) perm.value = corr.value;
  });
};

// Numeric validation
window.CreateNumericTextBox = function(element, event) {
  const charCode = (event.which) ? event.which : event.keyCode;
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
};

// Employment toggle
window.toggleEmployment = function(value) {
  const empGroup = document.getElementById('employmentGroup');
  if (empGroup) {
    if (value === 'Y') {
      empGroup.style.display = 'flex';
    } else {
      empGroup.style.display = 'none';
      const input = empGroup.querySelector('input');
      if (input) input.value = '';
    }
  }
};
