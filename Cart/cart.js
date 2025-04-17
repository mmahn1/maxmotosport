document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartTableBody = document.querySelector("#cart-table tbody");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-btn");

    function renderCart() {
        cartTableBody.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            const price = parseFloat(item.price) || 0; // Ensure price is a valid number
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${item.name}</td>
                <td>€${price.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="quantity-input">
                </td>
                <td>€${(price * item.quantity).toFixed(2)}</td>
                <td>
                    <button data-index="${index}" class="remove-btn">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);
            total += price * item.quantity;
        });

        cartTotal.textContent = `€${total.toFixed(2)}`;
    }

    function updateCartCount() {
        const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
        const cartCountElement = document.getElementById("cart-count");
        if (cartCountElement) cartCountElement.textContent = cartCount;
    }

    function updateQuantity(index, quantity) {
        cart[index].quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateCartCount(); // Update cart count
    }

    function removeItem(index) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateCartCount(); // Update cart count
    }

    // Send cart data to the backend
    function checkout() {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Prepare cart data for the backend
        const cartData = cart.map(item => ({
            product_id: item.id, // Use the product ID from the JSON file
            quantity: item.quantity
        }));

        fetch(`${serverUrl}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}` // Include JWT token
            },
            body: JSON.stringify({ cart: cartData })
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert("✅ Order placed successfully!");
                    localStorage.removeItem("cart"); // Clear the cart
                    renderCart(); // Re-render the cart
                    updateCartCount(); // Reset cart count
                } else {
                    alert("❌ " + (result.message || result.error));
                }
            })
            .catch(error => {
                console.error("❌ Checkout failed:", error);
                alert("❌ Checkout failed: " + error);
            });
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

    updateCartCount(); // Update cart count on page load
    renderCart();
});