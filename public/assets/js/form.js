document.addEventListener("DOMContentLoaded", () => {

  // ========== COMMON: PINCODE AUTO FILL ==========
  const pinInput = document.getElementById("pincode");
  if (pinInput) {
    pinInput.addEventListener("blur", () => {
      const pin = pinInput.value.trim();
      if (pin.length === 6) fetchPincode(pin);
    });
  }

  function fetchPincode(pin) {
    const API_KEY = "YOUR_API_KEY";

    fetch(`https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=${API_KEY}&format=json&filters[pincode]=${pin}&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (!data.records?.length) return;
        const d = data.records[0];

        const state = document.getElementById("state");
        const district = document.getElementById("district");

        if (state) state.value = d.statename;
        if (district) district.value = d.district;
      });
  }

  // ========== COMMON: ACCESSIBILITY MESSAGE ==========
  const srStatus = document.getElementById("sr-status");
  if (srStatus) {
    srStatus.innerText = "फॉर्म लोड हो गया है";
  }
  
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header").innerHTML = data;
    });

  fetch("footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    });


});


