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

    try {
      // कौन सा टैब एक्टिव है यह पता करें
      const serviceType = getActiveService();
      const activeTabIndex = getActiveTabIndex();

      // सिर्फ एक्टिव टैब के फील्ड्स लें
      const activeContent = document.querySelectorAll(".tab-content")[activeTabIndex];
      const data = {};

      // एक्टिव टैब के सभी input, select, textarea से डेटा लें
      activeContent.querySelectorAll("[name]").forEach(el => {
        if (el.type === "checkbox") {
          data[el.name] = el.checked;
        } else if (el.type === "radio") {
          if (el.checked) data[el.name] = el.value;
        } else {
          data[el.name] = el.value.trim();
        }
      });

      // 🔹 FIREBASE SAVE - सब कुछ applications कलेक्शन में
      const docRef = await addDoc(collection(db, "applications"), {
        // सर्विस टाइप पहचान के लिए
        serviceType: serviceType,           // "Admission", "Supplement", "Result", "Exam", "Other"
        serviceCategory: "MPBHOJ",          // MP Bhoj के लिए पहचान
        
        // फॉर्म डेटा
        formData: data,
        
        // मेटाडेटा
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // यूजर इंफो (अगर लॉगिन सिस्टम हो तो)
        userAgent: navigator.userAgent,
        source: window.location.href
      });

      const applicationNumber = "MPBHOJ-" + docRef.id.substring(0, 8).toUpperCase();

      // 🔹 EMAIL (optional)
      try {
        const userEmail = data.email || data.txtEmailId || "";
        const userName = data.studentName || data.firstName || data.txtFname || "Student";
        
        if (userEmail) {
          await emailjs.send(
            "service_allinone",
            "template_7x246oi",
            {
              to_email: userEmail,
              to_name: userName,
              application_no: applicationNumber,
              service_type: serviceType
            }
          );
        }
      } catch (emailErr) {
        console.warn("📧 Email failed but data saved", emailErr);
      }

      // सफलता मैसेज दिखाएं
      showSuccessMessage(applicationNumber, serviceType);
      form.reset();

    } catch (err) {
      console.error("🔥 Firebase Error", err);
      alert("डेटा सेव नहीं हो पाया। कृपया फिर से प्रयास करें।\nError: " + err.message);
    }
  });

}); // ✅ DOMContentLoaded END

// ================= TAB LOGIC =================
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

// सफलता मैसेज दिखाएं
function showSuccessMessage(appNumber, service) {
  const alertBox = document.getElementById("alertBox");
  if (alertBox) {
    alertBox.innerHTML = `
      <i class="fas fa-check-circle"></i> 
      <strong>आवेदन सफलतापूर्वक जमा हो गया!</strong><br>
      <span style="font-size: 14px; color: #666;">
        Service: ${service} | Application No: ${appNumber}
      </span>
    `;
    alertBox.style.display = "block";
    
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 5000);
  }
}

// ================= HELPER FUNCTIONS =================

// एड्रेस कॉपी करें (अगर HTML में बटन हो)
window.copyAddress = function() {
  const corrHouse = document.querySelector('[name="corrHouse"]')?.value || "";
  const corrColony = document.querySelector('[name="corrColony"]')?.value || "";
  const corrCity = document.querySelector('[name="corrCity"]')?.value || "";
  const corrState = document.querySelector('[name="corrState"]')?.value || "";
  const corrDistrict = document.querySelector('[name="corrDistrict"]')?.value || "";
  const corrPin = document.querySelector('[name="corrPin"]')?.value || "";

  const permHouse = document.querySelector('[name="permHouse"]');
  const permColony = document.querySelector('[name="permColony"]');
  const permCity = document.querySelector('[name="permCity"]');
  const permState = document.querySelector('[name="permState"]');
  const permDistrict = document.querySelector('[name="permDistrict"]');
  const permPin = document.querySelector('[name="permPin"]');

  if (permHouse) permHouse.value = corrHouse;
  if (permColony) permColony.value = corrColony;
  if (permCity) permCity.value = corrCity;
  if (permState) permState.value = corrState;
  if (permDistrict) permDistrict.value = corrDistrict;
  if (permPin) permPin.value = corrPin;
};

// नंबरिक इनपुट वैलिडेशन
window.CreateNumericTextBox = function(element, event) {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
};

// परसेंटेज कैलकुलेट
window.calculatePercentage = function() {
  const maxMarks = document.querySelector('[name="maxMarks"]');
  const obtMarks = document.querySelector('[name="obtMarks"]');
  const percentage = document.querySelector('[name="percentage"]');

  if (maxMarks && obtMarks && percentage) {
    const max = parseFloat(maxMarks.value) || 0;
    const obt = parseFloat(obtMarks.value) || 0;

    if (max > 0 && obt > 0) {
      if (obt > max) {
        alert('प्राप्त अंक अधिकतम अंक से अधिक नहीं हो सकते!');
        obtMarks.value = '';
        percentage.value = '';
      } else {
        const per = ((obt / max) * 100).toFixed(2);
        percentage.value = per + '%';
      }
    }
  }
};

// इम्प्लॉयमेंट टाइप टॉगल
window.toggleEmployment = function(value) {
  const empGroup = document.getElementById('employmentGroup');
  if (empGroup) {
    if (value === 'Y') {
      empGroup.classList.remove('conditional-field');
      empGroup.classList.add('active');
    } else {
      empGroup.classList.add('conditional-field');
      empGroup.classList.remove('active');
      const empInput = document.querySelector('[name="employmentType"]');
      if (empInput) empInput.value = '';
    }
  }
};
