const serverUrl = "https://example.com"; // Replace with your actual server URL

document.addEventListener("DOMContentLoaded", () => {
    const ordersTableBody = document.querySelector("#orders-table tbody");

    // Fetch all orders
    function fetchOrders() {
        fetch(`${serverUrl}/api/admin/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}` // Include JWT token
            }
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    renderOrders(result.orders);
                } else {
                    alert("❌ " + (result.message || result.error));
                }
            })
            .catch(error => {
                console.error("❌ Failed to fetch orders:", error);
                alert("❌ Failed to fetch orders: " + error);
            });
    }

    // Render orders in the table
    function renderOrders(orders) {
        ordersTableBody.innerHTML = ""; // Clear existing rows

        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.user_id}</td>
                <td>€${order.total_price.toFixed(2)}</td>
                <td>${new Date(order.order_date).toLocaleString()}</td>
                <td>${order.status}</td>
                <td>
                    <button class="view-order-btn" data-id="${order.id}">View</button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }

    // Handle order expansion
    ordersTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-order-btn")) {
            const orderId = e.target.dataset.id;
            const row = e.target.closest("tr");

            // Toggle expanded view
            if (row.nextElementSibling && row.nextElementSibling.classList.contains("order-details")) {
                row.nextElementSibling.remove(); // Remove expanded view
            } else {
                const order = orders.find(o => o.id == orderId);
                const detailsRow = document.createElement("tr");
                detailsRow.classList.add("order-details");
                detailsRow.innerHTML = `
                    <td colspan="6">
                        <h3>Order Items</h3>
                        <ul>
                            ${JSON.parse(order.product_details).map(item => `
                                <li>${item.quantity}x ${item.name} (€${item.price.toFixed(2)} each)</li>
                            `).join("")}
                        </ul>
                    </td>
                `;
                row.after(detailsRow);
            }
        }
    });

    fetchOrders();
});
