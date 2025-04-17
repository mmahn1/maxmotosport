// ✅ SET THIS TO true when the real domain is live
const useCustomDomain = false;

// 🌐 Both backend domains
const CUSTOM_DOMAIN = "https://maxmotosport.eu";
const DEV_DOMAIN = "https://maxmotosport-production.up.railway.app"; // ← Replace with actual Railway domain

// ✅ Dynamically choose the backend URL based on the toggle
const serverUrl = useCustomDomain ? CUSTOM_DOMAIN : DEV_DOMAIN;

// Ensure username and password are defined
const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

// Updated fetch for login
fetch(`${serverUrl}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ username, password })
})
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert("✅ Login successful!");
      // Redirect or store login info
      localStorage.setItem("token", result.token);
      window.location.href = result.role === "admin" ? "/admin.html" : "/mock.html";
    } else {
      alert("❌ " + (result.message || result.error));
    }
  })
  .catch(error => {
    console.error("❌ Login failed:", error);
    alert("❌ Login failed: " + error);
  });