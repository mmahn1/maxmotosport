document.addEventListener("DOMContentLoaded", function () {

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const playPauseButton = document.getElementById('play-pause-button');
    const audio = document.getElementById('desertx-audio');

    if (!audio) {
        return;
    }

    // Ensure the audio is loaded and log any errors
    audio.addEventListener('canplaythrough', function () {});

    audio.addEventListener('error', function (e) {});

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            // Remove 'selected' class from all thumbnails
            thumbnails.forEach(img => img.classList.remove('selected'));

            // Add 'selected' class to the clicked thumbnail
            this.classList.add('selected');

            // Update the main image
            mainImage.src = this.src;
        });
    });

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
});