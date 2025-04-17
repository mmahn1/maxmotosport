document.addEventListener("DOMContentLoaded", function () {
    const bikeImage = document.getElementById("bike-detail-image");
    const bikeTitle = document.getElementById("bike-detail-title");
    const bikeDescription = document.getElementById("bike-detail-description");
    const bikePrice = document.getElementById("bike-detail-price");
    const bikeLink = document.getElementById("bike-detail-link");
    let currentIndex = 0;
    let offers = [];

    fetch("specialoffer.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ JSON data loaded:", data); // Debugging log
            offers = data;
            setupBikeDetails();
        })
        .catch(error => {
            console.error("❌ Error loading special offers:", error);
        });

    function setupBikeDetails() {
        if (!bikeImage || !bikeTitle || !bikeDescription || !bikePrice || !bikeLink) {
            console.error("❌ Bike details elements not found in the DOM.");
            return;
        }

        function updateBikeDetails(index) {
            const offer = offers[index];
            bikeImage.src = offer.image;
            bikeImage.alt = offer.title;
            bikeTitle.textContent = offer.title;
            bikeDescription.textContent = offer.description;
            bikePrice.textContent = `Price: ${offer.price}`;
            bikeLink.href = offer.link;
        }

        // Initialize with the first bike
        updateBikeDetails(currentIndex);

        // Switch bike details every 7 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % offers.length;
            updateBikeDetails(currentIndex);
        }, 7000);
    }
});