document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const playPauseButton = document.getElementById('play-pause-button');
    const audio = document.getElementById('desertx-audio');
    const bikeName = document.getElementById('bike-name');
    const colorButtons = document.querySelectorAll('.color-option');
    const colorSquares = document.querySelectorAll('.color-square');

    if (!audio) {
        console.error('Audio element not found.');
        return;
    }

    console.log('Audio element found:', audio);

    // Ensure the audio is loaded and log any errors
    audio.addEventListener('canplaythrough', function () {
        console.log('Audio is ready to play.');
    });

    audio.addEventListener('error', function (e) {
        console.error('Audio failed to load:', e);
    });

    if (!playPauseButton) {
        console.error('Play/pause button not found.');
        return;
    }

    console.log('Play/pause button found:', playPauseButton);

    playPauseButton.addEventListener('click', function () {
        console.log('Play/pause button clicked.');

        if (audio.paused) {
            console.log('Audio is currently paused. Attempting to play...');
            audio.play().then(() => {
                console.log('Audio is now playing.');
                playPauseButton.textContent = '⏸'; // Change to pause symbol
                console.log('Updated button to "pause" symbol.');
            }).catch(error => {
                console.error('Error playing audio:', error);
            });
        } else {
            console.log('Audio is currently playing. Attempting to pause...');
            audio.pause();
            console.log('Audio is now paused.');
            playPauseButton.textContent = '▶'; // Change back to play symbol
            console.log('Updated button to "play" symbol.');
        }
    });

    // Handle audio end to reset the button text
    audio.addEventListener('ended', function () {
        console.log('Audio playback ended.');
        playPauseButton.textContent = '▶'; // Reset to play symbol
        console.log('Reset button to "play" symbol.');
    });

    function changeColor(color) {
        console.log(`Changing color to: ${color}`);
        
        // Update bike name
        bikeName.textContent = `Diavel V4 - ${color}`;

        // Update main image and thumbnails
        if (color === 'Red') {
            mainImage.src = '/Motor-bikes/Slike/Diavel_V4/Opcija 1.png';
            thumbnails[0].src = '/Motor-bikes/Slike/Diavel_V4/Opcija 1.png';
            thumbnails[1].src = '/Motor-bikes/Slike/Diavel_V4/opcija 2.webp';
        } else if (color === 'Black') {
            mainImage.src = '/Motor-bikes/Slike/Diavel_V4/opcija 2.webp';
            thumbnails[0].src = '/Motor-bikes/Slike/Diavel_V4/opcija 2.webp';
            thumbnails[1].src = '/Motor-bikes/Slike/Diavel_V4/Opcija 1.png';
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
            console.log('Thumbnail clicked:', this.src);

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