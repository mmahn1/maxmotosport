document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("accessories-container");
    const filterButtons = document.querySelectorAll(".filter-btn");
    let accessoriesData = []; // Store all accessories data globally

    if (!container) {
        console.error("⚠️ Error: 'accessories-container' div is missing in HTML.");
        return;
    }

    const jsonFile = "/ponudba/specific-accessories/accessories.json";
    loadAccessories(jsonFile);

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            
            // Add active class to clicked button
            this.classList.add("active");
            
            // Get the filter value from data-filter attribute
            const filterValue = this.getAttribute("data-filter");
            
            // Filter accessories
            filterAccessories(filterValue);
        });
    });

    function loadAccessories(jsonPath) {
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load accessories: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(accessories => {
                // Store all accessories for filtering later
                accessoriesData = accessories.filter(accessory => 
                    accessory.category && accessory.category.toLowerCase() === "accessories"
                );
                
                // Display all accessories initially
                displayAccessories(accessoriesData);
            })
            .catch(error => {
                console.error("Error loading accessories:", error);
                container.innerHTML = `<p>Error loading accessories.</p>`;
            });
    }

    function displayAccessories(accessories) {
        container.innerHTML = "";

        if (accessories.length > 0) {
            accessories.forEach(accessory => {
                const accessoryCard = document.createElement("div");
                accessoryCard.classList.add("product-card", "fade-in");
                
                // Add the search category as a data attribute
                if (accessory.serch) {
                    accessoryCard.dataset.category = accessory.serch.toLowerCase();
                }
                
                // Add id as a data attribute for product links
                if (accessory.id) {
                    accessoryCard.dataset.id = accessory.id;
                }
                
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
            container.innerHTML = "<p>No accessories available in this category.</p>";
        }
    }

    function filterAccessories(filter) {
        if (filter === "all") {
            // Show all accessories
            displayAccessories(accessoriesData);
        } else {
            // Filter accessories by search category
            const filtered = accessoriesData.filter(accessory => 
                accessory.serch && accessory.serch.toLowerCase() === filter
            );
            
            displayAccessories(filtered);
        }
    }
});
