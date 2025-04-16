document.addEventListener("DOMContentLoaded", function () {
    loadProducts("bikes.json", "bikes-container", "bike");
    loadCategories("ponudba2.json", "accessories-container");

    let currentProduct = null; // Track the currently displayed product

    function loadCategories(jsonPath, containerId) {
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load categories: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(categories => {
                const container = document.getElementById(containerId);
                container.innerHTML = ""; // Clear container
                
                if (categories && categories.length > 0) {
                    categories.forEach(category => {
                        if (!category.image || !category.name || !category.id) {
                            console.error("⚠️ Missing category data:", category);
                            return;
                        }

                        const categoryCard = document.createElement("div");
                        categoryCard.classList.add("product-card");
                        categoryCard.dataset.id = category.id;
                        categoryCard.dataset.redirect = category.redirectTo;
                        categoryCard.innerHTML = `
                            <img src="${category.image}" alt="${category.name}">
                            <h3>${category.name}</h3>
                        `;
                        
                        categoryCard.addEventListener("click", (e) => {
                            const target = e.currentTarget;
                            const redirect = target.dataset.redirect;
                            console.log(`Clicked on category: ${target.dataset.id}, redirecting to: ${redirect}`);
                            window.location.href = `/ponudba/specific-accessories/${redirect}`;
                        });

                        container.appendChild(categoryCard);
                    });

                    // Enable horizontal scrolling with mouse wheel
                    container.addEventListener("wheel", (event) => {
                        if (event.deltaY !== 0) {
                            container.scrollLeft += event.deltaY * 2; // Increase scroll speed
                            container.classList.add("scrolling");
                            clearTimeout(container.scrollTimeout);
                            container.scrollTimeout = setTimeout(() => {
                                container.classList.remove("scrolling");
                            }, 500);
                            event.preventDefault();
                        }
                    });
                } else {
                    container.innerHTML = "<p>No categories available.</p>";
                }
            })
            .catch(error => {
                console.error("Error loading categories:", error);
                document.getElementById(containerId).innerHTML = `<p>Error loading categories.</p>`;
            });
    }

    function loadProducts(jsonPath, containerId, type) {
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(products => {
                const container = document.getElementById(containerId);

                if (products.length > 0) {
                    products.forEach(product => {
                        if (!product.image || !product.name) {
                            console.error("⚠️ Missing product data:", product);
                            return;
                        }

                        const productCard = document.createElement("div");
                        productCard.classList.add("product-card");
                        productCard.innerHTML = `
                            <img src="${product.image}" alt="${product.name}">
                            <h3>${product.name}</h3>
                        `;
                        if (type === "bike") {
                            productCard.addEventListener("click", () => toggleProductDetails(product, type));
                        } else if (type === "accessory") {
                            productCard.addEventListener("click", () => redirectToSpecificAccessories(product.category));
                        }

                        // Add hover effect to bike cards
                        if (type === "bike") {
                            let hoverTimeout;
                            productCard.addEventListener("mouseover", () => {
                                productCard.style.backgroundColor = "red";
                                productCard.querySelector("h3").style.color = "white";
                                hoverTimeout = setTimeout(() => {
                                    productCard.style.backgroundColor = "white";
                                    productCard.querySelector("h3").style.color = "black";
                                }, 2000);
                            });
                            productCard.addEventListener("mouseout", () => {
                                clearTimeout(hoverTimeout);
                                productCard.style.backgroundColor = "white";
                                productCard.querySelector("h3").style.color = "black";
                            });
                        }

                        container.appendChild(productCard);
                    });

                    // Enable horizontal scrolling with mouse wheel
                    container.addEventListener("wheel", (event) => {
                        if (event.deltaY !== 0) {
                            container.scrollLeft += event.deltaY * 2; // Increase scroll speed
                            container.classList.add("scrolling");
                            clearTimeout(container.scrollTimeout);
                            container.scrollTimeout = setTimeout(() => {
                                container.classList.remove("scrolling");
                            }, 500);
                            event.preventDefault();
                        }
                    });
                } else {
                    container.innerHTML = "<p>No products available.</p>";
                }
            })
            .catch(error => {
                console.error("Error loading products:", error);
                document.getElementById(containerId).innerHTML = `<p>Error loading products.</p>`;
            });
    }

    function toggleProductDetails(product, type) {
        if (currentProduct === product) {
            closePreview();
            currentProduct = null;
        } else {
            showProductDetails(product, type);
            currentProduct = product;
        }
    }

    function showProductDetails(product, type) {
        const previewSection = document.getElementById("preview-section");
        const previewTitle = document.getElementById("preview-title");
        const previewImage = document.getElementById("preview-image");
        const previewText = document.getElementById("preview-text");
        const tabContainer = document.getElementById("tab-container");

        previewTitle.textContent = product.name;
        previewImage.src = product.image;

        // Clear previous tabs
        tabContainer.innerHTML = "";

        // Add tabs for versions only
        if (product.versions && product.versions.length > 0) {
            product.versions.forEach((version, index) => {
                createTab(version.name, () => showVersion(version), tabContainer, index === 0);
            });
            showVersion(product.versions[0]); // Show the first version by default
        }

        previewSection.style.display = "block";
    }

    function createTab(name, onClick, tabContainer, active = false) {
        const tab = document.createElement("button");
        tab.classList.add("tab-btn");
        tab.textContent = name;
        tab.addEventListener("click", function() {
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            onClick();
        });
        if (active) tab.classList.add("active");
        tabContainer.appendChild(tab);
    }

    // This function will only be used from tabs now, not for direct category navigation
    function redirectToSpecificAccessories(category) {
        let page = "accessories";
        
        // Convert category to lowercase for case-insensitive comparison
        const lowerCategory = category ? category.toLowerCase().trim() : '';
        
        if (lowerCategory === "bike wear") {
            page = "motorcycle-wear";
        } else if (lowerCategory === "casual wear") {
            page = "casual-wear";
        }
        
        window.location.href = `/ponudba/specific-accessories/${page}.html`;
    }

    window.closePreview = function () {
        const previewSection = document.getElementById("preview-section");
        previewSection.style.display = "none";
        currentProduct = null; // Reset the current product
    };

    function showVersion(version) {
        const previewText = document.getElementById("preview-text");
        previewText.innerHTML = `
            <div class="preview-data">
                <div><strong>Power:</strong> ${version.power || "N/A"}</div>
                <div><strong>Torque:</strong> ${version.torque || "N/A"}</div>
                <div><strong>Weight:</strong> ${version.weight || "N/A"}</div>
            </div>
            <button onclick="window.location.href='${version.button}'" class="bike-page-btn">
                Go to Bike Page
            </button>
        `;
        document.getElementById("preview-image").src = version.image; // Update the main image with the version image
    }

    function addToCart(product) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    }

    // Example usage: Attach to buttons
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", () => {
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price),
            };
            addToCart(product);
        });
    });
});
