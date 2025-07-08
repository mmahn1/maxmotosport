const useCustomDomain1 = true; 

const CUSTOM_DOMAIN_1 = "https://maxmotosport-production.up.railway.app";

const serverUrl =CUSTOM_DOMAIN_1;

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