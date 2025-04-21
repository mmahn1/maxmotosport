const serverUrl = "http://localhost:3000"; // Update this to match your server's URL

console.log("🔹 admin-dashboard.js script loaded successfully.");

document.addEventListener("DOMContentLoaded", () => {
    console.log("🔹 DOM fully loaded and parsed.");
    const ordersTableBody = document.querySelector("#orders-table tbody");
    const newsletterSection = document.getElementById("newsletter-section");
    const ordersSection = document.getElementById("orders-section");
    const toggleNewsletterBtn = document.getElementById("toggle-newsletter");
    const toggleOrdersBtn = document.getElementById("toggle-orders");
    const newsletterTableBody = document.querySelector("#newsletter-table tbody");
    const subscriberCount = document.getElementById("subscriber-count");
    const addSubscriberForm = document.getElementById("add-subscriber-form");
    const newSubscriberEmail = document.getElementById("new-subscriber-email");

    console.log("🔹 Admin dashboard script loaded successfully.");

    // Toggle newsletter section
    toggleNewsletterBtn.addEventListener("click", () => {
        console.log("🔹 Toggle Newsletter button clicked.");
        const isHidden = newsletterSection.classList.toggle("hidden");
        toggleNewsletterBtn.textContent = isHidden
            ? "Show Newsletter Subscribers"
            : "Hide Newsletter Subscribers";
        console.log(`🔹 Newsletter section is now ${isHidden ? "hidden" : "visible"}.`);
    });

    // Toggle orders section
    toggleOrdersBtn.addEventListener("click", () => {
        console.log("🔹 Toggle Orders button clicked.");
        const isHidden = ordersSection.classList.toggle("hidden");
        toggleOrdersBtn.textContent = isHidden
            ? "Show Orders"
            : "Hide Orders";
        console.log(`🔹 Orders section is now ${isHidden ? "hidden" : "visible"}.`);
    });

    // Fetch all orders
    function fetchOrders() {
        console.log("🔹 Fetching orders...");
        fetch(`${serverUrl}/api/admin/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}` // Include JWT token
            }
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    console.log("✅ Orders fetched successfully.");
                    renderOrders(result.orders);
                } else {
                    console.error("❌ Failed to fetch orders:", result.message || result.error);
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
        console.log("🔹 Rendering orders...");
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
        console.log(`✅ Rendered ${orders.length} orders.`);
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

    // Fetch and render newsletter subscribers
    function fetchSubscribers() {
        console.log("🔹 Fetching newsletter subscribers...");
        fetch(`${serverUrl}/api/newsletter/subscribers`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(response => {
                console.log("🔹 Response received:", response);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log("🔹 Parsed JSON:", result);
                if (result.success) {
                    console.log("✅ Newsletter subscribers fetched successfully.");
                    renderSubscribers(result.subscribers);
                } else {
                    console.error("❌ Failed to fetch subscribers:", result.message || result.error);
                    alert("❌ " + (result.message || result.error));
                }
            })
            .catch(error => {
                console.error("❌ Error fetching subscribers:", error);
                alert("❌ Failed to fetch subscribers: " + error);
            });
    }

    function renderSubscribers(subscribers) {
        console.log("🔹 Rendering subscribers...");
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
        console.log(`✅ Rendered ${subscribers.length} subscribers.`);
    }

    // Handle subscriber removal
    newsletterTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-subscriber-btn")) {
            const email = e.target.dataset.email;
            console.log(`🔹 Remove button clicked for email: ${email}`);
            fetch(`${serverUrl}/api/newsletter/subscribers/${encodeURIComponent(email)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        console.log(`✅ Subscriber with email ${email} removed successfully.`);
                        fetchSubscribers();
                    } else {
                        console.error(`❌ Failed to remove subscriber: ${result.message || result.error}`);
                        alert("❌ " + (result.message || result.error));
                    }
                })
                .catch(error => {
                    console.error("❌ Error removing subscriber:", error);
                    alert("❌ Failed to remove subscriber: " + error);
                });
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

        console.log(`🔹 Adding new subscriber with email: ${email}`);
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
                    console.log(`✅ Subscriber with email ${email} added successfully.`);
                    newSubscriberEmail.value = "";
                    fetchSubscribers();
                } else {
                    console.error(`❌ Failed to add subscriber: ${result.message || result.error}`);
                    alert("❌ " + (result.message || result.error));
                }
            })
            .catch(error => {
                console.error("❌ Error adding subscriber:", error);
                alert("❌ Failed to add subscriber: " + error);
            });
    });

    // Initial fetch
    console.log("🔹 Initializing fetch for subscribers and orders...");
    fetchSubscribers();
    fetchOrders();
});
