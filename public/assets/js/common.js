// ================= EMAILJS INIT =================
(function () {
  emailjs.init("-HjIyXVqfuRKrznVE");
})();

// ================= PINCODE AUTO FILL =================
document.addEventListener("DOMContentLoaded", () => {

  const pinInput = document.getElementById("pincode");
  const districtInput = document.getElementById("district");
  const stateInput = document.getElementById("state");

  if (pinInput) {
    pinInput.addEventListener("blur", () => {
      const pin = pinInput.value.trim();
      if (pin.length === 6) fetchPincode(pin);
    });
  }

  function fetchPincode(pin) {
    const API_KEY = "579b464db66ec23bdd000001cf26e874ff084c794c4c4c10fd788575";

    fetch(
      `https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=${API_KEY}&format=json&filters[pincode]=${pin}&limit=1`
    )
      .then(res => res.json())
      .then(data => {
        if (!data.records?.length) return;
        const d = data.records[0];
        if (stateInput) stateInput.value = d.statename;
        if (districtInput) districtInput.value = d.district;
      })
      .catch(console.error);
  }

  // ================= HEADER / FOOTER =================
  fetch("header.html")
    .then(res => res.text())
    .then(html => {
      const h = document.getElementById("header");
      if (h) h.innerHTML = html;
    });

  fetch("footer.html")
    .then(res => res.text())
    .then(html => {
      const f = document.getElementById("footer");
      if (f) f.innerHTML = html;
    });

});
