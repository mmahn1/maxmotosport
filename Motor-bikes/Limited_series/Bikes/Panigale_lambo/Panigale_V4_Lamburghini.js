document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const bikeName = document.getElementById('bike-name');
    const colorButtons = document.querySelectorAll('.color-option');
    const colorSquares = document.querySelectorAll('.color-square');


    const apparelItems = [
        {
            title: "Full-face helmet",
            description: "The helmet is produced in collaboration with Arai in the same colours as the bike and is designed to ensure safety and performance, particularly during sports riding.",
            image: "/Motor-bikes/Slike/Limited_series/Panigale_lambo/helmet.jpg"
        },
        {
            title: "Leather jacket",
            description: "The leather jacket with protectors is produced in collaboration with Dainese. The colours match those of the livery, with the unmistakable \"Y\" on the bike.",
            image: "/Motor-bikes/Slike/Limited_series/Panigale_lambo/lether_jacket.jpg"
        },
        {
            title: "Leather suit",
            description: "The exclusive D-Air leather suit is produced in collaboration with Dainese and has a colour scheme inspired by that of the bike. Also the Speciale Clienti leather suits will have customised colour palettes, with matching the livery of the bike and the car.",
            image: "/Motor-bikes/Slike/Limited_series/Panigale_lambo/leather_suit.jpg"
        }
    ];

    let currentApparelIndex = 0;

    const apparelImage = document.getElementById("apparel-image");
    const apparelTitle = document.getElementById("apparel-title");
    const apparelDescription = document.getElementById("apparel-description");

    const tab1 = document.getElementById("tab1");
    const tab2 = document.getElementById("tab2");
    const tab3 = document.getElementById("tab3"); // New tab for the suit
    const prevApparel = document.getElementById("prev-apparel");
    const nextApparel = document.getElementById("next-apparel");

    function updateApparelContent(index) {
        const item = apparelItems[index];
        apparelImage.src = item.image;
        apparelImage.alt = item.title;
        apparelTitle.textContent = item.title;
        apparelDescription.textContent = item.description;

        // Update active tab
        tab1.classList.toggle("active", index === 0);
        tab2.classList.toggle("active", index === 1);
        tab3.classList.toggle("active", index === 2);
    }

    tab1.addEventListener("click", function () {
        currentApparelIndex = 0;
        updateApparelContent(currentApparelIndex);
    });

    tab2.addEventListener("click", function () {
        currentApparelIndex = 1;
        updateApparelContent(currentApparelIndex);
    });

    tab3.addEventListener("click", function () {
        currentApparelIndex = 2; // Set index for the suit
        updateApparelContent(currentApparelIndex);
    });

    prevApparel.addEventListener("click", function () {
        currentApparelIndex = (currentApparelIndex - 1 + apparelItems.length) % apparelItems.length;
        updateApparelContent(currentApparelIndex);
    });

    nextApparel.addEventListener("click", function () {
        currentApparelIndex = (currentApparelIndex + 1) % apparelItems.length;
        updateApparelContent(currentApparelIndex);
    });

    // Initialize with the first item
    updateApparelContent(currentApparelIndex);
});