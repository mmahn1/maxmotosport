document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

    // Scroll to bike description when an additional image is clicked
    const additionalImages = document.querySelectorAll('.additional-images img');

    additionalImages.forEach((image) => {
        image.addEventListener('click', function () {
            const targetId = image.alt.replace('Image ', 'bike-').trim(); // Convert "Image 1" to "bike-1"
            console.log(`Image clicked: ${image.alt}, Target ID: ${targetId}`); // Debug log
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                console.log(`Scrolling to section with ID: ${targetId}`); // Debug log
                const offset = 1000; // Adjust this value to scroll higher (includes the image above)
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            } else {
                console.error(`No section found with ID: ${targetId}`); // Debug log
            }
        });
    });

    
});