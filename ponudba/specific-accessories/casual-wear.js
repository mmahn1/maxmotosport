document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("accessories-container");

    if (!container) {
        console.error("⚠️ Error: 'accessories-container' div is missing in HTML.");
        return;
    }

    const jsonFile = "/ponudba/specific-accessories/accessories.json";

    loadCasualWear(jsonFile);

    function loadCasualWear(jsonPath) {
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load casual wear: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(accessories => {
                container.innerHTML = "";

                // Add a safety check for the category property
                const filteredAccessories = accessories.filter(accessory => 
                    accessory.category && accessory.category.toLowerCase() === "casual wear"
                );

                if (filteredAccessories.length > 0) {
                    filteredAccessories.forEach(accessory => {
                        const accessoryCard = document.createElement("div");
                        accessoryCard.classList.add("product-card");
                        accessoryCard.innerHTML = `
                            <img src="${accessory.image}" alt="${accessory.name}">
                            <h3>${accessory.name}</h3>
                        `;
                        
                        // Add click event to navigate to product detail page
                        accessoryCard.addEventListener('click', function() {
                            if (accessory.id) {
                                window.location.href = `/univerzalni izdelek/product.html?id=${accessory.id}`;
                            }
                        });

                        container.appendChild(accessoryCard);
                    });
                } else {
                    container.innerHTML = "<p>No casual wear available.</p>";
                }
            })
            .catch(error => {
                console.error("Error loading casual wear:", error);
                container.innerHTML = `<p>Error loading casual wear.</p>`;
            });
    }
});
