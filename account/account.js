// Automatically detect environment and set server URL
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Use a different variable name to avoid conflicts with header-footer.js
let accountServerUrl;
if (isLocalhost) {
  accountServerUrl = "http://localhost:3000";
} else {
  // When in production (maxmotosport.eu), use relative URLs to avoid CORS issues
  // This assumes both the frontend and backend are served from the same domain
  accountServerUrl = ""; // Empty string means relative URLs
}

document.addEventListener("DOMContentLoaded", function () {
  // Page init

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Initialize the page based on login status
  initializeAccountPage();

  // Initialize login/register toggle functionality only if user is not logged in
  if (!token) {
    initToggleButtons();
  }

  // Helper function to initialize the account page based on login status
  function initializeAccountPage() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    // Get all the page elements
    const toggleButtons = document.querySelector(".toggle-buttons");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutSection = document.getElementById("logoutSection");
    const logoutButton = document.getElementById("logoutButton");
    const loggedInUsername = document.getElementById("loggedInUsername");
    const pageTitle = document.querySelector(".account-container h2");

    if (token && username) {
      // User is logged in - show logout section only
  // Logged in

      // Hide login/register elements
      if (toggleButtons) toggleButtons.style.display = "none";
      if (loginForm) loginForm.classList.add("hidden");
      if (registerForm) registerForm.classList.add("hidden");

      // Show logout section
      if (logoutSection) logoutSection.classList.remove("hidden");
      if (loggedInUsername) {
        if (role === "admin") {
          loggedInUsername.innerHTML = `<strong>${username}</strong> <span style="color: #e00;">(Administrator)</span>`;
        } else {
          loggedInUsername.textContent = username;
        }
      }
      if (pageTitle) pageTitle.textContent = `Welcome back, ${username}!`;

      // Set up logout functionality
      if (logoutButton) {
        logoutButton.addEventListener("click", function () {
          if (confirm("Are you sure you want to log out?")) {
            // Clear all stored data
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");

            // Update header to reflect logout
            if (typeof updateUserDisplay === "function") {
              updateUserDisplay();
            }

            // Reload the page to show login form
            window.location.reload();
          }
        });
      }

      // Set up dashboard button functionality
      const dashboardButton = document.getElementById("dashboardButton");
      if (dashboardButton) {
        dashboardButton.addEventListener("click", function () {
          // For now, redirect to user dashboard or orders page
          // You can create a user dashboard page later
          alert(
            "Dashboard feature coming soon! This will show your order history and account details."
          );
          // window.location.href = "/user-dashboard/dashboard.html";
        });
      }
    } else {
      // User is not logged in - show login/register forms
  // Not logged in

      // Show login/register elements
      if (toggleButtons) toggleButtons.style.display = "flex";
      if (loginForm) loginForm.classList.remove("hidden");
      if (registerForm) registerForm.classList.add("hidden");

      // Hide logout section
      if (logoutSection) logoutSection.classList.add("hidden");
      if (pageTitle) pageTitle.textContent = "Welcome to MaX Motosport";
    }
  }

  // Helper function to initialize toggle buttons with debug output
  function initToggleButtons() {
    const showLogin = document.getElementById("showLogin");
    const showRegister = document.getElementById("showRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

  // Prepare toggle elements

    if (showLogin && showRegister && loginForm && registerForm) {
      showLogin.addEventListener("click", function () {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        showLogin.classList.add("active");
        showRegister.classList.remove("active");
      });

      showRegister.addEventListener("click", function () {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        showRegister.classList.add("active");
        showLogin.classList.remove("active");
      });

  // Toggle wired
    } else {
      console.error(
        "❌ Elements not found: Ensure login/register buttons exist."
      );
    }
  }
});

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  // Login attempt

  if (!username || !password) {
    console.error("❌ Missing username or password (client-side)");
    showMessage("Please enter both username and password.", "error");
    return;
  }

  try {
    const response = await fetch(`${accountServerUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log("🔹 Server response:", data);

    if (response.ok) {
    // Login successful
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      showMessage("Login successful! Redirecting...", "success");

      if (typeof updateUserDisplay === "function") {
        updateUserDisplay();
      } else {
  // updateUserDisplay not found
      }

      setTimeout(
        () => (window.location.href = "/Landing_page/index.html"),
        1000
      );
    } else {
  // Login failed (server-side)
      showMessage(
        data.error || "Login failed. Please check your credentials.",
        "error"
      );
    }
  } catch (error) {
  console.error("Login failed (client-side):", error);
    showMessage("An error occurred. Please try again later.", "error");
  }
}

async function register() {
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  const registerButton = document.querySelector("#registerForm button");
  const originalButtonText = registerButton.textContent;
  registerButton.disabled = true;
  registerButton.textContent = "Registering...";

  if (!username || !email || !password) {
    showMessage("Please fill in all fields.", "error");
    registerButton.disabled = false;
    registerButton.textContent = originalButtonText;
    return;
  }

  try {
  // Attempting to register

    const response = await fetch(`${accountServerUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
  // Registration response

    if (response.ok) {
      showMessage("Registration successful! You can now log in.", "success");
      setTimeout(() => {
        document.getElementById("showLogin").click();
        document.getElementById("loginUsername").value = username;
      }, 1500);
    } else {
      showMessage(data.error || "Registration failed.", "error");
    }
  } catch (error) {
    console.error("Registration failed:", error);
    showMessage("An error occurred. Please try again later.", "error");
  } finally {
    registerButton.disabled = false;
    registerButton.textContent = originalButtonText;
  }
}

function showMessage(message, type) {
  const messageContainer =
    document.getElementById("message-container") || createMessageContainer();
  messageContainer.textContent = message;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = "block";

  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 4000);
}

function createMessageContainer() {
  const container = document.createElement("div");
  container.id = "message-container";
  container.className = "message";
  document.querySelector(".account-container").appendChild(container);
  return container;
}
