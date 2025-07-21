const useCustomDomain1 = true; 

// Automatically detect environment and set server URL
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isCustomDomain = typeof window !== 'undefined' && window.location.hostname === 'maxmotosport.eu';

let CUSTOM_DOMAIN_1;
if (isLocalhost) {
    CUSTOM_DOMAIN_1 = "http://localhost:3000";
} else if (isCustomDomain) {
    CUSTOM_DOMAIN_1 = "https://maxmotosport.eu";
} else {
    CUSTOM_DOMAIN_1 = "https://maxmotosport-production.up.railway.app";
}

const serverUrl = CUSTOM_DOMAIN_1;

function login() {
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