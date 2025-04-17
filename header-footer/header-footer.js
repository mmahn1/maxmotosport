const serverUrl = "https://maxmotosport-production.up.railway.app"; // Replace with your actual server URL

document.addEventListener("DOMContentLoaded", function () {
    loadHeader();
    loadFooter();
    loadNewsletter(); // Add this line to load the newsletter
    adjustFooterPosition();
    window.addEventListener("resize", adjustFooterPosition);
    window.addEventListener("scroll", handleHeaderScroll);
    updateCartCount(); // Call updateCartCount on page load
});

document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A') {
    console.log('Link clicked:', e.target.href);
  }
});

function loadHeader() {
    fetch('/header-footer/header.html') // Use an absolute path
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load header');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('header-placeholder').innerHTML = html;
            console.log('✅ Header loaded successfully');
        })
        .catch(error => {
            console.error('❌ Error loading header:', error);
        });
}

function loadFooter() {
    fetch('/header-footer/footer.html') // Use an absolute path
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load footer');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
            console.log('✅ Footer loaded successfully');
        })
        .catch(error => {
            console.error('❌ Error loading footer:', error);
        });
}

function loadNewsletter() {
    fetch("/Newsletter/newsletter.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load newsletter: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const newsletterPlaceholder = document.getElementById("newsletter-placeholder");
            if (newsletterPlaceholder) {
                newsletterPlaceholder.innerHTML = html;
                console.log("✅ Newsletter loaded successfully");
            } else {
                console.error("⚠️ Error: 'newsletter-placeholder' div is missing in HTML.");
            }
        })
        .catch(error => {
            console.error("❌ Error loading newsletter:", error);
        });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems; // Update the cart count
    }
}

// Ensure the cart count updates dynamically when the cart changes
window.addEventListener("storage", (event) => {
    if (event.key === "cart") {
        updateCartCount(); // Update cart count when localStorage changes
    }
});

function updateUserDisplay() {
    const userLink = document.getElementById("userLink");
    const userText = document.getElementById("userText");
    const userIcon = document.getElementById("userIcon");

    if (!userLink || !userText || !userIcon) {
        console.error("❌ User elements not found in header.");
        return;
    }

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
        userText.textContent = username;
        userIcon.classList.remove("hidden");
        userLink.href = "#";
        userLink.title = "Logged in as " + username;

        userLink.addEventListener("click", function (event) {
            event.preventDefault();
            const existingDropdown = document.getElementById("user-dropdown");
            if (existingDropdown) {
                existingDropdown.classList.toggle("show-dropdown");
                return;
            }
            const dropdown = document.createElement("div");
            dropdown.id = "user-dropdown";
            dropdown.className = "user-dropdown";
            const profileLink = document.createElement("a");
            profileLink.href = "/account/profile.html";
            profileLink.innerHTML = '<i class="fas fa-id-card"></i> My Profile';
            const ordersLink = document.createElement("a");
            ordersLink.href = "/account/orders.html";
            ordersLink.innerHTML = '<i class="fas fa-box"></i> My Orders';
            const logoutLink = document.createElement("a");
            logoutLink.href = "#";
            logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            logoutLink.addEventListener("click", function (e) {
                e.preventDefault();
                if (confirm("Do you want to log out?")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    window.location.href = "/account/account.html";
                }
            });
            dropdown.appendChild(profileLink);
            dropdown.appendChild(ordersLink);
            dropdown.appendChild(logoutLink);
            userLink.parentNode.appendChild(dropdown);
            dropdown.classList.add("show-dropdown");
            document.addEventListener("click", function closeDropdown(e) {
                if (!userLink.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove("show-dropdown");
                    document.removeEventListener("click", closeDropdown);
                }
            });
        });
    } else {
        userText.textContent = "Login / Register";
        userText.classList.remove("hidden");
        userIcon.classList.remove("hidden");
        userLink.href = "/account/account.html";
        userLink.title = "Login or create an account";
        const newUserLink = userLink.cloneNode(true);
        userLink.parentNode.replaceChild(newUserLink, userLink);
    }
}

function checkAdminStatus() {
    fetch('/api/check-admin') // Use an absolute path
        .then(response => {
            if (!response.ok) {
                throw new Error('Server responded with 404 (Not Found)');
            }
            return response.json();
        })
        .then(data => {
            if (data.isAdmin) {
                console.log('✅ Admin check passed');
            } else {
                console.log('⚠️ Admin check skipped: Not an admin');
            }
        })
        .catch(error => {
            console.error('❌ Error checking admin status:', error);
        });
}

function setupSearchBar() {
    const searchIcon = document.getElementById("search-icon");
    const searchBar = document.getElementById("search-bar");
    const searchContainer = document.querySelector(".search-container");

    if (!searchIcon || !searchBar || !searchContainer) {
        console.error("❌ Search elements not found.");
        return;
    }

    searchIcon.addEventListener("click", function () {
        searchContainer.classList.toggle("active");
        searchBar.focus();
    });

    searchBar.addEventListener("blur", function () {
        if (searchBar.value.trim() === "") {
            searchContainer.classList.remove("active");
        }
    });

    searchBar.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = searchBar.value.trim();
            if (query) {
                window.location.href = `/ponudba/ponudba.html?search=${encodeURIComponent(query)}`;
            }
        }
    });

    document.addEventListener("click", function (event) {
        if (!searchContainer.contains(event.target) && event.target !== searchIcon) {
            searchContainer.classList.remove("active");
        }
    });
}

function adjustFooterPosition() {
    const body = document.body;
    const html = document.documentElement;
    const footer = document.querySelector(".footer");

    if (footer) {
        const bodyHeight = body.scrollHeight;
        const windowHeight = window.innerHeight;

        if (bodyHeight < windowHeight) {
            footer.style.position = "absolute";
            footer.style.bottom = "0";
            footer.style.width = "100%";
        } else {
            footer.style.position = "relative";
        }
    }
}

function handleHeaderScroll() {
    const header = document.querySelector("header");
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
    }
}

function setupDropdownMenus() {
    const dropdowns = document.querySelectorAll('.dropdown');
    if (dropdowns.length === 0) {
        return;
    }
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        if (!dropdownToggle || !dropdownContent) return;
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.dropdown-content.active').forEach(content => {
                if (content !== dropdownContent) {
                    content.classList.remove('active');
                }
            });
            dropdownContent.classList.toggle('active');
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content.active').forEach(content => {
                content.classList.remove('active');
            });
        }
    });
}

document.head.insertAdjacentHTML('beforeend', `
<style>
.header-scrolled {
    background-color: rgba(0, 0, 0, 0.95);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
}

.user-dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    background: #1a1a1a;
    border: 1px solid #333;
    border-top: 2px solid #e00;
    min-width: 180px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    border-radius: 4px;
    display: none;
    z-index: 1001;
}

.user-dropdown.show-dropdown {
    display: block;
    animation: fadeIn 0.2s ease;
}

.user-dropdown a {
    display: block;
    padding: 10px 15px;
    color: #ddd;
    text-decoration: none;
    transition: all 0.2s;
}

.user-dropdown a:hover {
    background-color: #333;
    color: #e00;
}

.user-dropdown a:not(:last-child) {
    border-bottom: 1px solid #333;
}

.pulse-animation {
    animation: pulse 0.5s ease;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}
</style>
`);
