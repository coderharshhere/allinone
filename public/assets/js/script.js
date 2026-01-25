// ================= HOME PAGE JS =================

// GLOBAL STATE
let currentCategory = "all";
let currentSearch = "";

// ================= SEARCH =================
function searchService() {
    const input = document.getElementById("searchInput");
    currentSearch = input ? input.value.toLowerCase().trim() : "";
    applyFilters();
}

// ================= CATEGORY FILTER =================
function filterServices(category) {
    currentCategory = category;

    // Active tab highlight
    document.querySelectorAll(".category-tab").forEach(tab => {
        tab.classList.remove("active");
        if (tab.dataset.category === category) {
            tab.classList.add("active");
        }
    });

    applyFilters();
}

// ================= COMMON FILTER LOGIC =================
function applyFilters() {
    const cards = document.querySelectorAll(".service-card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();

        const matchSearch = text.includes(currentSearch);
        const matchCategory =
            currentCategory === "all" ||
            card.dataset.category === currentCategory;

        card.style.display =
            matchSearch && matchCategory ? "" : "none";
    });
}

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

    // Initial render
    applyFilters();

    // ================= HEADER LOAD =================
    fetch("header.html")
        .then(res => res.text())
        .then(html => {
            const header = document.getElementById("header");
            if (header) header.innerHTML = html;
        })
        .catch(err => console.error("Header load error:", err));

    // ================= FOOTER LOAD =================
    fetch("footer.html")
        .then(res => res.text())
        .then(html => {
            const footer = document.getElementById("footer");
            if (footer) footer.innerHTML = html;
        })
        .catch(err => console.error("Footer load error:", err));
});
