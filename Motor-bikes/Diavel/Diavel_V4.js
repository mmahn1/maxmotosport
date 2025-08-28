document.addEventListener("DOMContentLoaded", function () {

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const playPauseButton = document.getElementById('play-pause-button');
    const audio = document.getElementById('desertx-audio');
    const bikeName = document.getElementById('bike-name');
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

        // Update selected color square (if present), otherwise ignore
        if (colorSquares && colorSquares.length) {
            colorSquares.forEach(square => square.classList.remove('selected'));
            const sq = document.querySelector(`.color-square.${color.toLowerCase()}`);
            if (sq) sq.classList.add('selected');
        }

        // Ensure the first thumbnail is selected
        thumbnails.forEach(img => img.classList.remove('selected'));
        thumbnails[0].classList.add('selected');

        // Update "Add to Cart" button attributes
        const addToCartButton = document.querySelector('.add-to-cart-btn');
        addToCartButton.dataset.color = color.toLowerCase();
        addToCartButton.dataset.image = mainImage.src;
    }

    // Ignore color squares: we now select color via thumbnails only

    // Add event listeners to thumbnails
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function () {
            // First thumbnail = Red, Second = Black
            const color = index === 0 ? 'Red' : 'Black';

            // Update selected thumbnail styles
            thumbnails.forEach(img => img.classList.remove('selected'));
            this.classList.add('selected');

            // Apply canonical images, name, and cart data for chosen color
            changeColor(color);
        });
    });

    // Set default color to Red
    changeColor('Red');
});