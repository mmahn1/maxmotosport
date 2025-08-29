// Automatically detect environment and set server URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isCustomDomain = window.location.hostname === 'maxmotosport.eu';

let serverUrl;
if (isLocalhost) {
    serverUrl = "http://localhost:3000";
} else if (isCustomDomain) {
    serverUrl = "https://maxmotosport.eu";
} else {
    serverUrl = "https://maxmotosport-production.up.railway.app";
}

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
    const ordersTableBody = document.querySelector("#orders-table tbody");
    const newsletterTableBody = document.querySelector("#newsletter-table tbody");
    const subscriberCount = document.getElementById("subscriber-count");
    const addSubscriberForm = document.getElementById("add-subscriber-form");
    const newSubscriberEmail = document.getElementById("new-subscriber-email");

    function fetchSubscribers() {
        fetch(`${serverUrl}/api/newsletter/subscribers`, {
            method: "GET",
            headers: { Authorization: `Bearer ${ (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token") }` }
        })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(result => { if (result.success) renderSubscribers(result.subscribers); })
            .catch(() => alert("Failed to fetch subscribers."));
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
            headers: { Authorization: `Bearer ${ (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token") }` }
        })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(result => { if (result.success) renderOrders(result.orders); })
            .catch(() => alert("Failed to fetch orders."));
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

    // Handle order expansion
    ordersTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-order-btn")) {
            const orderId = e.target.dataset.id;
            console.log(`🔹 View button clicked for order ID: ${orderId}`);
            const row = e.target.closest("tr");

            // Toggle expanded view
            if (row.nextElementSibling && row.nextElementSibling.classList.contains("order-details")) {
                console.log("🔹 Hiding order details.");
                row.nextElementSibling.remove(); // Remove expanded view
            } else {
                console.log("🔹 Showing order details.");
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

    function renderSubscribers(subscribers) {
        newsletterTableBody.innerHTML = "";
        subscribers.forEach(subscriber => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${subscriber.email}</td>
                <td><button class="remove-subscriber-btn red-button" data-email="${subscriber.email}">Remove</button></td>
            `;
            newsletterTableBody.appendChild(row);
        });
        subscriberCount.textContent = subscribers.length;
    }

    // Handle subscriber removal
    newsletterTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-subscriber-btn")) {
            const email = e.target.dataset.email;
            fetch(`${serverUrl}/api/newsletter/subscribers/${encodeURIComponent(email)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${ (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token") }`
                }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        fetchSubscribers();
                    } else {
                        alert("❌ " + (result.message || result.error));
                    }
                })
                .catch(() => alert("❌ Failed to remove subscriber."));
        }
    });

    // Handle adding a new subscriber
    addSubscriberForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newSubscriberEmail.value.trim();
        if (!email) {
            console.warn("⚠️ No email entered. Cannot add subscriber.");
            return;
        }

        fetch(`${serverUrl}/api/newsletter/subscribers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token") }`
            },
            body: JSON.stringify({ email })
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    newSubscriberEmail.value = "";
                    fetchSubscribers();
                } else {
                    alert("❌ " + (result.message || result.error));
                }
            })
        .catch(() => alert("❌ Failed to add subscriber."));
    });

    // Initial load
    fetchSubscribers();
    fetchOrders();

});
