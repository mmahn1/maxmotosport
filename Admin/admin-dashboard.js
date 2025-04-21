let serverUrl = "";

fetch("/api/config")
    .then(response => response.json())
    .then(config => {
        serverUrl = config.serverUrl;

        // Fetch subscribers and orders after serverUrl is loaded
        fetchSubscribers();
        fetchOrders();
    })
    .catch(error => {
        console.error("❌ Failed to load server configuration:", error);
        alert("Failed to load server configuration. Please try again later.");
    });

document.addEventListener("DOMContentLoaded", () => {
    const ordersTableBody = document.querySelector("#orders-table tbody");
    const newsletterTableBody = document.querySelector("#newsletter-table tbody");

    function fetchSubscribers() {
        fetch(`${serverUrl}/api/newsletter/subscribers`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    renderSubscribers(result.subscribers);
                } else {
                    alert(result.message || "Failed to fetch subscribers.");
                }
            })
            .catch(error => {
                console.error("❌ Error fetching subscribers:", error);
                alert("Failed to fetch subscribers. Please try again later.");
            });
    }

    function renderSubscribers(subscribers) {
        newsletterTableBody.innerHTML = "";
        subscribers.forEach(subscriber => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${subscriber.email}</td>
                <td>${new Date(subscriber.subscribed_at).toLocaleString()}</td>
            `;
            newsletterTableBody.appendChild(row);
        });
    }

    function fetchOrders() {
        fetch(`${serverUrl}/api/admin/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    renderOrders(result.orders);
                } else {
                    alert(result.message || "Failed to fetch orders.");
                }
            })
            .catch(error => {
                console.error("❌ Error fetching orders:", error);
                alert("Failed to fetch orders. Please try again later.");
            });
    }

    function renderOrders(orders) {
        ordersTableBody.innerHTML = "";
        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.user_id}</td>
                <td>€${order.total_price.toFixed(2)}</td>
                <td>${new Date(order.order_date).toLocaleString()}</td>
                <td>${order.status}</td>
            `;
            ordersTableBody.appendChild(row);
        });
    }
});
