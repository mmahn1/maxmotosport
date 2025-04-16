document.addEventListener("DOMContentLoaded", function () {
    loadProducts(); 
    document.getElementById("add-image").addEventListener("click", function () {
        let imageFields = document.getElementById("image-fields");
        let newImageField = document.createElement("input");
        newImageField.type = "text";
        newImageField.classList.add("image-url");
        newImageField.placeholder = `Image URL ${imageFields.children.length + 1}`;
        imageFields.appendChild(newImageField);
    });

    document.getElementById("product-form").addEventListener("submit", function (event) {
        event.preventDefault();

        let imageInputs = document.querySelectorAll(".image-url");
        let imageUrls = Array.from(imageInputs).map(input => input.value.trim()).filter(url => url !== "");

        if (imageUrls.length < 3) {
            alert("Please provide at least 3 image URLs.");
            return;
        }

        fetch("http://localhost:3000/products")
            .then(response => response.json())
            .then(products => {
                let lastId = products.length > 0 ? products[products.length - 1].id : 0;
                let newProduct = {
                    id: lastId + 1, 
                    title: document.getElementById("product-name").value.trim(),
                    description: document.getElementById("product-description").value.trim(),
                    price: document.getElementById("product-price").value.trim(),
                    stars: parseInt(document.getElementById("product-stars").value),
                    images: imageUrls
                };

                fetch("http://localhost:3000/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newProduct)
                })
                .then(response => response.json())
                .then(data => {
                    alert("✅ Product Added Successfully!");
                    document.getElementById("product-form").reset();
                    loadProducts(); 
                })
                .catch(error => console.error("❌ Error saving product:", error));
            })
            .catch(error => console.error("❌ Error fetching products:", error));
    });
});

function loadProducts() {
    let productList = document.getElementById("product-list");
    let productCount = document.getElementById("product-count");

    fetch("http://localhost:3000/products")
        .then(response => response.json())
        .then(products => {
            productList.innerHTML = "";
            productCount.textContent = `Total Products: ${products.length}`;

            if (products.length === 0) {
                productList.innerHTML = "<p>No products added yet.</p>";
                return;
            }

            products.forEach(product => {
                let productItem = document.createElement("div");
                productItem.classList.add("product-item");

                let imagesHTML = product.images.map(img => `<img src="${img}" width="50">`).join("");

                productItem.innerHTML = `
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <p>⭐ ${product.stars} / 5</p>
                    <p><strong>ID:</strong> ${product.id}</p>
                    ${imagesHTML}
                `;

                productList.appendChild(productItem);
            });
        })
        .catch(error => console.error("❌ Error loading products:", error));
}
