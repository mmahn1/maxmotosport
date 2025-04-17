document.addEventListener("DOMContentLoaded", function () {
    console.log("🔹 Login/Register Page Loaded");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
        if (role === "admin") {
            window.location.href = "/Admin/admin-dashboard.html";
        } else {
            window.location.href = "/Landing_page/index.html";
        }
        return;
    }

    const showLogin = document.getElementById("showLogin");
    const showRegister = document.getElementById("showRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (showLogin && showRegister && loginForm && registerForm) {
        showLogin.addEventListener("click", () => {
            loginForm.classList.remove("hidden");
            registerForm.classList.add("hidden");
            showLogin.classList.add("active");
            showRegister.classList.remove("active");
        });

        showRegister.addEventListener("click", () => {
            registerForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
            showRegister.classList.add("active");
            showLogin.classList.remove("active");
        });
    } else {
        console.error("❌ Elements not found: Ensure login/register buttons exist.");
    }
});

async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const loginButton = document.querySelector("#loginForm button");
    const originalButtonText = loginButton.textContent;
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    if (!username || !password) {
        showMessage("Please enter both username and password.", "error");
        loginButton.disabled = false;
        loginButton.textContent = originalButtonText;
        return;
    }

    try {
        const response = await fetch("https://maxmotosport-production.up.railway.app/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userId", data.id);

            showMessage("Login successful! Redirecting...", "success");

            setTimeout(() => {
                if (data.role === "admin") {
                    window.location.href = "/Admin/dashboard.html";
                } else {
                    window.location.href = "/user-dashboard/dashboard.html";
                }
            }, 1000);
        } else {
            showMessage(data.error || "Login failed. Please check your credentials.", "error");
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
        }
    } catch (error) {
        console.error("❌ Login failed:", error);
        showMessage("An error occurred. Please try again later.", "error");
        loginButton.disabled = false;
        loginButton.textContent = originalButtonText;
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
        const response = await fetch(`${serverUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
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
    const messageContainer = document.getElementById("message-container") || createMessageContainer();
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
