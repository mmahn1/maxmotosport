document.addEventListener("DOMContentLoaded", function () {
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');

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
});
