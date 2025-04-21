const serverUrl = "https://maxmotosport-production.up.railway.app/"; 

document.addEventListener("DOMContentLoaded", () => {
    const ordersTableBody = document.querySelector("#orders-table tbody");
    const newsletterSection = document.getElementById("newsletter-section");
    const ordersSection = document.getElementById("orders-section");
    const toggleNewsletterBtn = document.getElementById("toggle-newsletter");
    const toggleOrdersBtn = document.getElementById("toggle-orders");
    const newsletterTableBody = document.querySelector("#newsletter-table tbody");
    const subscriberCount = document.getElementById("subscriber-count");
    const addSubscriberForm = document.getElementById("add-subscriber-form");
    const newSubscriberEmail = document.getElementById("new-subscriber-email");

    // Toggle sections
    toggleNewsletterBtn.addEventListener("click", () => {
        newsletterSection.classList.toggle("hidden");
        toggleNewsletterBtn.textContent = newsletterSection.classList.contains("hidden")
            ? "Show Newsletter Subscribers"
            : "Hide Newsletter Subscribers";
    });

    toggleOrdersBtn.addEventListener("click", () => {
        ordersSection.classList.toggle("hidden");
        toggleOrdersBtn.textContent = ordersSection.classList.contains("hidden")
            ? "Show Orders"
            : "Hide Orders";
    });

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

    // Fetch and render newsletter subscribers
    function fetchSubscribers() {
        fetch(`${serverUrl}/api/newsletter/subscribers`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    renderSubscribers(result.subscribers);
                } else {
                    alert("❌ " + (result.message || result.error));
                }
            })
            .catch(error => {
                console.error("❌ Failed to fetch subscribers:", error);
                alert("❌ Failed to fetch subscribers: " + error);
            });
    }

    function renderSubscribers(subscribers) {
        newsletterTableBody.innerHTML = ""; // Clear existing rows
        subscribers.forEach(subscriber => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${subscriber.email}</td>
                <td>
                    <button class="remove-subscriber-btn red-button" data-email="${subscriber.email}">Remove</button>
                </td>
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
                    Authorization: `Bearer ${localStorage.getItem("token")}`
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
                .catch(error => {
                    console.error("❌ Failed to remove subscriber:", error);
                    alert("❌ Failed to remove subscriber: " + error);
                });
        }
    });

    // Handle adding a new subscriber
    addSubscriberForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newSubscriberEmail.value.trim();
        if (!email) return;

        fetch(`${serverUrl}/api/newsletter/subscribers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
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
            .catch(error => {
                console.error("❌ Failed to add subscriber:", error);
                alert("❌ Failed to add subscriber: " + error);
            });
    });

    // Initial fetch
    fetchSubscribers();
    fetchOrders();
});
