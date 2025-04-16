document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartTableBody = document.querySelector("#cart-table tbody");
    const cartTotal = document.getElementById("cart-total");

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

    renderCart();
});