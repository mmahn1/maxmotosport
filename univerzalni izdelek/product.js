document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    window.currentProduct = null;
    window.currentVersion = null;
    
    if (!productId) {
        showError("No product specified");
        return;
    }
    
    fetchProductData(productId);
    
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.onclick = function() {
        modal.style.display = "none";
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
    
    document.getElementById('learn-more').addEventListener('click', function() {
        toggleDescription(window.currentProduct);
    });
});

let showFullDescription = false;

function fetchProductData(productId) {
    fetch('/ponudba/specific-accessories/accessories.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load product data: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(products => {
            const product = products.find(item => item.id === productId);
            
            if (!product) {
                showError("Product not found");
                return;
            }
            
            window.currentProduct = product;
            
            displayProduct(product);
        })
        .catch(error => {
            console.error("Error loading product data:", error);
            showError("Error loading product data");
        });
}

function displayProduct(product) {
    document.title = product.name;
    
    document.getElementById('product-name').textContent = product.name;
    
    document.getElementById('product-description').textContent = product.description || "No description available.";
    
    const learnMoreBtn = document.getElementById('learn-more');
    if (product.description2 && product.description) {
        learnMoreBtn.style.display = 'block';
    } else {
        learnMoreBtn.style.display = 'none';
    }
    
    const colorOptionsContainer = document.getElementById('color-options');
    const colorSelector = document.getElementById('color-selector');
    
    if (product.versions && product.versions.length > 0) {
        colorOptionsContainer.style.display = 'block';
        colorSelector.innerHTML = ''; 
        
        const defaultOption = createColorOption(
            product.name, 
            product.image, 
            product,
            true 
        );
        colorSelector.appendChild(defaultOption);
        
        product.versions.forEach(version => {
            const colorOption = createColorOption(
                version.name, 
                version.image, 
                version
            );
            colorSelector.appendChild(colorOption);
        });
    } else {
        colorOptionsContainer.style.display = 'none';
    }
    
    updateMainImage(product.image, product.name);
    
    updateThumbnails(product);
    
    updateProductDetails(product);
}

function createColorOption(name, image, versionData, isActive = false) {
    const option = document.createElement('div');
    option.classList.add('color-option');
    if (isActive) option.classList.add('active');
    
    option.innerHTML = `
        <img src="${image}" alt="${name}">
        <div class="color-name">${name}</div>
    `;
    
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        this.classList.add('active');
        
        window.currentVersion = versionData;
        
        if (versionData !== window.currentProduct) {
            const images = [];
            if (versionData.image) images.push(versionData.image);
            if (versionData.image2) images.push(versionData.image2);
            
            updateMainImage(versionData.image, versionData.name);
            
            if (images.length > 0) {
                updateThumbnailsFromArray(images);
            }
        } else {
            updateMainImage(window.currentProduct.image, window.currentProduct.name);
            updateThumbnails(window.currentProduct);
        }
    });
    
    return option;
}

function updateMainImage(src, alt) {
    const featuredImage = document.getElementById('featured-image');
    featuredImage.src = src;
    featuredImage.alt = alt;
    

    featuredImage.onclick = function() {
        openImageModal(src);
    };
}

function updateThumbnails(product) {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.image2) images.push(product.image2);
    if (product.image3) images.push(product.image3);
    if (product.image4) images.push(product.image4);
    
    updateThumbnailsFromArray(images);
}

function updateThumbnailsFromArray(images) {
    const thumbnailContainer = document.getElementById('thumbnail-container');
    thumbnailContainer.innerHTML = ''; 
    
    if (images.length > 1) {
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = "Product thumbnail";
            thumbnail.classList.add('thumbnail');
            
            if (index === 0) {
                thumbnail.classList.add('active');
            }
            
            thumbnail.onclick = function() {
                updateMainImage(image, "Product image");
                
                document.querySelectorAll('.thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                thumbnail.classList.add('active');
            };
            
            thumbnailContainer.appendChild(thumbnail);
        });
    }
}

function updateProductDetails(product) {
    const detailsTabs = document.getElementById('details-tabs');
    const tabContent = document.getElementById('tab-content');
    const detailsSection = document.querySelector('.details-section');
    
    detailsTabs.innerHTML = '';
    tabContent.innerHTML = '';
    
    const sections = [];
    
    if (product["product-details"]) {
        sections.push({
            id: 'details',
            title: 'Details',
            content: product["product-details"]
        });
    }
    
    if (product.size) {
        sections.push({
            id: 'size',
            title: 'Size',
            content: product.size
        });
    }
    
    if (product.protections) {
        sections.push({
            id: 'protections',
            title: 'Protections',
            content: product.protections
        });
    }
    
    if (product.certification) {
        sections.push({
            id: 'certification',
            title: 'Certification',
            content: product.certification
        });
    }
    
    if (sections.length === 0) {
        detailsSection.classList.add('hidden');
        return;
    } else {
        detailsSection.classList.remove('hidden');
    }
    
    sections.forEach((section, index) => {
        const tab = document.createElement('button');
        tab.classList.add('tab');
        tab.setAttribute('data-tab', section.id);
        tab.textContent = section.title;
        
        if (index === 0) {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${section.id}-pane`).classList.add('active');
        });
        
        detailsTabs.appendChild(tab);
        
        const tabPane = document.createElement('div');
        tabPane.classList.add('tab-pane');
        tabPane.id = `${section.id}-pane`;
        
        if (index === 0) {
            tabPane.classList.add('active');
        }
        
        tabPane.innerHTML = `<p>${section.content}</p>`;
        tabContent.appendChild(tabPane);
    });
}

function toggleDescription(product) {
    const productData = window.currentVersion || product;
    
    const descriptionElement = document.getElementById('product-description');
    const button = document.getElementById('learn-more');
    
    if (showFullDescription) {
        descriptionElement.textContent = productData.description || product.description || "No description available.";
        button.textContent = "Learn More";
    } else {
        descriptionElement.textContent = productData.description2 || product.description2 || "No detailed description available.";
        button.textContent = "Show Less";
    }
    
    showFullDescription = !showFullDescription;
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    
    modal.style.display = "flex";
    modalImg.src = imageSrc;
}

function showError(message) {
    const container = document.querySelector('.product-container');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}
