document.addEventListener("DOMContentLoaded", function () {

    // Scroll to bike description when an additional image is clicked
    const additionalImages = document.querySelectorAll('.additional-images img');

    additionalImages.forEach((image) => {
        image.addEventListener('click', function () {
            const targetId = image.alt.replace('Image ', 'bike-').trim(); // Convert "Image 1" to "bike-1"
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offset = 1000; // Adjust this value to scroll higher (includes the image above)
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            } else {
                // Section not found; no-op
            }
        });
    });

    
});