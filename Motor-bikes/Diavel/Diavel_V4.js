document.addEventListener("DOMContentLoaded", function () {

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const playPauseButton = document.getElementById('play-pause-button');
    const audio = document.getElementById('desertx-audio');
    const bikeName = document.getElementById('bike-name');
    const colorButtons = document.querySelectorAll('.color-option');
    const colorSquares = document.querySelectorAll('.color-square');

    if (!audio) {
        return;
    }

    // Ensure the audio is loaded and log any errors
    audio.addEventListener('canplaythrough', function () {});

    audio.addEventListener('error', function (e) {});

    if (!playPauseButton) {
        return;
    }

    playPauseButton.addEventListener('click', function () {
        if (audio.paused) {
            audio.play().then(() => {
                playPauseButton.textContent = '⏸'; // Change to pause symbol
            }).catch(error => {
                // ignore autoplay errors
            });
        } else {
            audio.pause();
            playPauseButton.textContent = '▶'; // Change back to play symbol
        }
    });

    // Handle audio end to reset the button text
    audio.addEventListener('ended', function () {
        playPauseButton.textContent = '▶'; // Reset to play symbol
    });

    function changeColor(color) {
        
        // Update bike name
        bikeName.textContent = `Diavel V4 - ${color}`;

        // Update main image and thumbnails
        if (color === 'Red') {
            mainImage.src = '/Motor-bikes/Slike/Diavel_V4/Opcija1.png';
            thumbnails[0].src = '/Motor-bikes/Slike/Diavel_V4/Opcija1.png';
            thumbnails[1].src = '/Motor-bikes/Slike/Diavel_V4/opcija2.webp';
        } else if (color === 'Black') {
            mainImage.src = '/Motor-bikes/Slike/Diavel_V4/opcija2.webp';
            thumbnails[0].src = '/Motor-bikes/Slike/Diavel_V4/opcija2.webp';
            thumbnails[1].src = '/Motor-bikes/Slike/Diavel_V4/Opcija1.png';
        }

        // Update selected color square
        colorSquares.forEach(square => square.classList.remove('selected'));
        document.querySelector(`.color-square.${color.toLowerCase()}`).classList.add('selected');

        // Ensure the first thumbnail is selected
        thumbnails.forEach(img => img.classList.remove('selected'));
        thumbnails[0].classList.add('selected');

        // Update "Add to Cart" button attributes
        const addToCartButton = document.querySelector('.add-to-cart-btn');
        addToCartButton.dataset.color = color.toLowerCase();
        addToCartButton.dataset.image = mainImage.src;
    }

    // Add event listeners to color squares
    colorSquares.forEach(square => {
        square.addEventListener('click', function () {
            const color = this.classList.contains('red') ? 'Red' : 'Black';
            changeColor(color);
        });
    });

    // Add event listeners to thumbnails
    thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {

            // Update main image
            mainImage.src = this.src;

            // Update selected thumbnail
            thumbnails.forEach(img => img.classList.remove('selected'));
            this.classList.add('selected');

            // Update bike name and color square based on the selected thumbnail
            if (this.src.includes('Opcija 1')) {
                changeColor('Red');
            } else if (this.src.includes('opcija 2')) {
                changeColor('Black');
            }
        });
    });

    // Set default color to Red
    changeColor('Red');
});