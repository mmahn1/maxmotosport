// ✅ SET THIS TO true to use CUSTOM_DOMAIN_1 (e.g., your current development domain)
const useCustomDomain1 = true; // Switch between CUSTOM_DOMAIN_1 and CUSTOM_DOMAIN_2

// 🌐 Both custom domains
const CUSTOM_DOMAIN_1 = "https://maxmotosport-production.up.railway.app"; // Current domain

// ✅ Dynamically choose the backend URL based on the toggle
const serverUrl =CUSTOM_DOMAIN_1;

// Login function
function login() {
  // Ensure username and password are retrieved from the correct input fields
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

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
}