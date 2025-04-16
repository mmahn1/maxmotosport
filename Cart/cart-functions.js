// Add a product to the cart
function addToCart(product) {
    if (!product.id || !product.name || !product.price) {
        console.error("Invalid product data:", product);
        alert("Failed to add product to cart. Please try again.");
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
    alert(`${product.name} (${product.color}) added to cart!`);
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
