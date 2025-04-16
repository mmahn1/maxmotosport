document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2 style='text-align:center;'>⚠️ No product selected. <a href='mock.html'>Home</a>.</h2>";
        return;
    }

    fetch("/Izdelek/izdelki.json")
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (!product) {
                document.body.innerHTML = `<h2 style='text-align:center;'>⚠️ Product not found. <a href='mock.html'>Back to Products</a></h2>`;
                return;
            }

            document.getElementById("product-title").textContent = product.title;
            document.getElementById("product-description").textContent = product.description;
            document.getElementById("product-price").textContent = `$${product.price}`;
            document.getElementById("main-image").src = product.images[0];

            const thumbnailsContainer = document.querySelector(".thumbnails");
            thumbnailsContainer.innerHTML = "";
            product.images.forEach(imageSrc => {
                let img = document.createElement("img");
                img.src = imageSrc;
                img.style.cursor = "pointer";
                img.addEventListener("click", () => {
                    document.getElementById("main-image").src = imageSrc;
                });
                thumbnailsContainer.appendChild(img);
            });

            document.getElementById("add-to-cart").addEventListener("click", function () {
                addToCart(product);
            });
        })
        .catch(error => console.error("Error loading product:", error));
});

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();

    window.location.href = "/Cart/cart.html";
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

updateCartCount();
