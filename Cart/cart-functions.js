// Add a product to the cart
function addToCart(product) {
    if (!product.id || !product.name || !product.price) {
        console.error("Invalid product data:", product);
        showCustomAlert("Failed to add product to cart. Please try again.");
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const uniqueId = `${product.id}-${product.color}`; // Combine ID and color for uniqueness
    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, uniqueId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(); // Update cart count
    showCustomAlert(`${product.name} added to cart!`); // Display only the product name
}

// Function to update the cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) cartCountElement.textContent = cartCount;
}

// Function to display a custom alert
function showCustomAlert(message) {
    const alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)"; // Center horizontally
    alertBox.style.backgroundColor = "lightgreen";
    alertBox.style.color = "green";
    alertBox.style.border = "2px solid green";
    alertBox.style.padding = "10px 20px";
    alertBox.style.borderRadius = "5px";
    alertBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    alertBox.style.zIndex = "1000";
    alertBox.style.fontSize = "16px";

    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, 3000); // Remove alert after 3 seconds
}

// Attach the addToCart function to buttons
function attachAddToCartButtons() {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", () => {
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price),
                image: button.dataset.image,
                color: button.dataset.color, // Include the selected color
            };
            addToCart(product);
        });
    });
}

// Initialize the cart functionality
document.addEventListener("DOMContentLoaded", attachAddToCartButtons);
