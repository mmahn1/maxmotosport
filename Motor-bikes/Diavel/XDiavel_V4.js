document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const bikeName = document.getElementById('bike-name');
    const colorSquares = document.querySelectorAll('.color-square'); // Ensure correct selection
    const bikeImage = document.getElementById('bike-color-image');

    const colorImages = {
        red: '/Motor-bikes/Slike/XDiavel_V4/blazing_red.webp',
        black: '/Motor-bikes/Slike/XDiavel_V4/black lava.webp'
    };

    colorSquares.forEach(square => {
        square.addEventListener('click', function () {
            // Remove 'selected' class from all squares
            colorSquares.forEach(sq => sq.classList.remove('selected'));
            // Add 'selected' class to the clicked square
            this.classList.add('selected');
            // Update the bike image
            const color = this.dataset.color;
            bikeImage.src = colorImages[color];
            bikeImage.alt = `XDiavel V4 in ${color === 'red' ? 'Blazing Red' : 'Black Lava'}`;

            // Update "Add to Cart" button attributes
            const addToCartButton = document.querySelector('.add-to-cart-btn');
            addToCartButton.dataset.color = color;
            addToCartButton.dataset.image = bikeImage.src;
        });
    });
});