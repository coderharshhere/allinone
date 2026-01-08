 <script>
        // Filtering Functionality
        function filterServices(category) {
            const cards = document.querySelectorAll('.service-card');
            const tabs = document.querySelectorAll('.category-tab');
            
            // Toggle Active Class
            tabs.forEach(tab => tab.classList.remove('active'));
            event.currentTarget.classList.add('active');

            // Show/Hide Cards
            cards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Search Functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.service-card');

            cards.forEach(card => {
                const title = card.querySelector('h4').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(term) || desc.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    </script>
    <script>
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
</script>
