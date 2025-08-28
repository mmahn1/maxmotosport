document.addEventListener("DOMContentLoaded", function () {

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const playPauseButton = document.getElementById('play-pause-button');
    const audio = document.getElementById('desertx-audio');

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

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            console.log('Thumbnail clicked:', this.src);
            // Remove 'selected' class from all thumbnails
            thumbnails.forEach(img => img.classList.remove('selected'));
            console.log('Removed "selected" class from all thumbnails.');

            // Add 'selected' class to the clicked thumbnail
            this.classList.add('selected');
            console.log('Added "selected" class to the clicked thumbnail.');

            // Update the main image
            mainImage.src = this.src;
            console.log('Updated main image source to:', mainImage.src);
        });
    });

    if (!playPauseButton) {
        console.error('Play/pause button not found.');
        return;
    }

    console.log('Play/pause button found:', playPauseButton);

    // Initialize accessible state and static label
    playPauseButton.textContent = '🔊';
    playPauseButton.setAttribute('aria-label', 'Play DesertX engine sound');
    playPauseButton.setAttribute('aria-pressed', 'false');

    playPauseButton.addEventListener('click', function () {
        console.log('Play/pause button clicked.');

        if (audio.paused) {
            console.log('Audio is currently paused. Attempting to play...');
            audio.play().then(() => {
                console.log('Audio is now playing.');
                // Keep speaker emoji; only update ARIA state
                playPauseButton.setAttribute('aria-label', 'Pause DesertX engine sound');
                playPauseButton.setAttribute('aria-pressed', 'true');
            }).catch(error => {
                console.error('Error playing audio:', error);
            });
        } else {
            console.log('Audio is currently playing. Attempting to pause...');
            audio.pause();
            console.log('Audio is now paused.');
            // Keep speaker emoji; only update ARIA state
            playPauseButton.setAttribute('aria-label', 'Play DesertX engine sound');
            playPauseButton.setAttribute('aria-pressed', 'false');
        }
    });

    // Handle audio end to reset the button text
    audio.addEventListener('ended', function () {
        console.log('Audio playback ended.');
    // Keep speaker emoji; only update ARIA state
    playPauseButton.setAttribute('aria-label', 'Play DesertX engine sound');
    playPauseButton.setAttribute('aria-pressed', 'false');
    });
});