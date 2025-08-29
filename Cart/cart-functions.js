(() => {
// Normalize product object from a button element's dataset
function productFromButton(btn) {
    return {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image,
        color: btn.dataset.color || 'default'
    };
}

// Add a product to the cart
function addToCart(product) {
    if (!product.id || !product.name || !product.price) {
        console.error("Invalid product data:", product);
        showCustomAlert("Failed to add product to cart. Please try again.");
        return;
    }

    // Prefer sessionStorage so the cart clears on tab/window close. One-time migrate from localStorage if present.
    let raw = null;
    try {
        raw = sessionStorage.getItem("cart");
        if (!raw) {
            const legacy = localStorage.getItem("cart");
            if (legacy) {
                sessionStorage.setItem("cart", legacy);
                try { localStorage.removeItem("cart"); } catch (e) {}
                raw = legacy;
            }
        }
    } catch (e) {
        // ignore storage errors
    }
    const cart = raw ? JSON.parse(raw) : [];
    const uniqueId = `${product.id}-${product.color}`; // Combine ID and color for uniqueness
    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, uniqueId, quantity: 1 });
    }

    // Write back to sessionStorage only
    try {
        sessionStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
        // ignore
    }
    if (typeof updateCartCount === 'function') updateCartCount(); // Update cart count
    try { console.debug('[Cart] Added:', product, 'Cart now:', cart); } catch (e) {}
    showCustomAlert(`${product.name} added to cart!`); // Display only the product name
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

// Attach the addToCart function to buttons (guarded to attach only once)
let __cartDelegatedHandlerAttached = false;
function attachAddToCartButtons() {
    if (__cartDelegatedHandlerAttached) return;
    __cartDelegatedHandlerAttached = true;
    document.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('.add-to-cart-btn');
        if (btn) {
            e.preventDefault();
            addToCart(productFromButton(btn));
        }
    });
}

// Initialize the cart functionality (attach once whether DOM loaded or not)
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", attachAddToCartButtons, { once: true });
} else {
    attachAddToCartButtons();
}

// Expose for debugging/manual calls
try { window.addToCart = addToCart; } catch (e) {}
try { window.showCustomAlert = showCustomAlert; } catch (e) {}

})();