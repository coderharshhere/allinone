
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
