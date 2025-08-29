(() => {
    // Automatically detect environment and set server URL (scoped)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isCustomDomain = window.location.hostname === 'maxmotosport.eu';

    const serverUrl = isLocalhost
        ? "http://localhost:3000"
        : isCustomDomain
        ? "https://maxmotosport.eu"
        : "https://maxmotosport-production.up.railway.app";

        document.addEventListener("DOMContentLoaded", () => {
            // Simple green toast (non-blocking) for in-page notifications
            function showGreenToast(message) {
                const alertBox = document.createElement("div");
                alertBox.textContent = message;
                alertBox.style.position = "fixed";
                alertBox.style.top = "20px";
                alertBox.style.left = "50%";
                alertBox.style.transform = "translateX(-50%)";
                alertBox.style.backgroundColor = "#d4edda"; // light green
                alertBox.style.color = "#155724"; // dark green text
                alertBox.style.border = "2px solid #28a745";
                alertBox.style.padding = "10px 20px";
                alertBox.style.borderRadius = "6px";
                alertBox.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                alertBox.style.zIndex = "1000";
                alertBox.style.fontSize = "16px";
                document.body.appendChild(alertBox);
                setTimeout(() => { alertBox.remove(); }, 3000);
            }
    function readCartFromStorage() {
        try {
            let s = sessionStorage.getItem("cart");
            const l = localStorage.getItem("cart");
            if (!s && l) {
                sessionStorage.setItem("cart", l);
                s = l;
            }
            return s || l;
        } catch (e) { return null; }
    }
    let raw = readCartFromStorage();
    let cart = raw ? JSON.parse(raw) : [];
    try { console.debug("[Cart] Loaded items:", cart); } catch (e) {}
    const cartTableBody = document.querySelector("#cart-table tbody");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-btn");

    function renderCart() {
        // Always read fresh from storage to avoid timing issues
        const freshRaw = readCartFromStorage();
        cart = freshRaw ? JSON.parse(freshRaw) : [];
        cartTableBody.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `<td colspan="5" style="text-align:center; padding: 16px; opacity: .7;">Your cart is empty.</td>`;
            cartTableBody.appendChild(emptyRow);
            cartTotal.textContent = `€0.00`;
            if (typeof updateCartCount === 'function') updateCartCount();
            return;
        }

        cart.forEach((item, index) => {
            const price = parseFloat(item.price) || 0; // Ensure price is a valid number
            // Normalize image path and provide a fallback for live environment
            let imageSrc = item.image || "/Slike/fallbackimage.png";
            if (imageSrc && !imageSrc.startsWith("http")) {
                // Ensure leading slash for relative paths
                if (!imageSrc.startsWith("/")) imageSrc = "/" + imageSrc;
            }
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <img src="${imageSrc}" alt="${item.name || 'Product'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null;this.src='/Slike/fallbackimage.png';">
                    <div style="font-size: 12px; color: #666;">${item.name}${item.color ? ` • ${item.color}` : ''}</div>
                </td>
                <td>€${price.toFixed(2)}</td>
                <td>€${(price * item.quantity).toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="quantity-input" style="width:64px;">
                </td>
                <td>
                    <button data-index="${index}" class="remove-btn">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);
            total += price * item.quantity;
        });

        cartTotal.textContent = `€${total.toFixed(2)}`;
    }

    function updateQuantity(index, quantity) {
        cart[index].quantity = quantity;
        try {
            sessionStorage.setItem("cart", JSON.stringify(cart));
        } catch (e) {}
    renderCart();
    if (typeof updateCartCount === 'function') updateCartCount(); // Update cart count
    }

    function removeItem(index) {
        cart.splice(index, 1);
        try {
            sessionStorage.setItem("cart", JSON.stringify(cart));
        } catch (e) {}
    renderCart();
    if (typeof updateCartCount === 'function') updateCartCount(); // Update cart count
    }

        // Checkout clears the cart immediately and shows a success message
        function checkout() {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }
            // Clear cart immediately
            try { sessionStorage.removeItem("cart"); localStorage.removeItem("cart"); } catch (e) {}
            cart = [];
                    renderCart();
                    if (typeof updateCartCount === 'function') updateCartCount();
                    showGreenToast("Order Successful");
        }

    cartTableBody.addEventListener("input", (e) => {
        if (e.target.classList.contains("quantity-input")) {
            const index = e.target.dataset.index;
            const quantity = parseInt(e.target.value, 10);
            if (quantity > 0) updateQuantity(index, quantity);
        }
    });

    cartTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn")) {
            const index = e.target.dataset.index;
            removeItem(index);
        }
    });

    checkoutButton.addEventListener("click", checkout);

    renderCart();
    // If empty on first pass, retry once shortly after to account for any async header migration
    if (!cart || cart.length === 0) {
        setTimeout(() => {
            renderCart();
        }, 100);
    }
    });
})();