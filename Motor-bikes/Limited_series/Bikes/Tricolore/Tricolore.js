document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

    const apparelItems = [
        {
            title: "Dedicated collection",
            description: "An exclusive, top-of-the-line garment with advanced protection thanks to the triple-activated airbag, lightweight and elastic kangaroo leather, and titanium details. Uncompromised comfort and performance, available only through the SuMisura program.",
            image: "/Motor-bikes/Slike/Limited_series/Tricolore/suit.jpg"
        },
        {
            title: " Dedicated collection",
            description: "To complete the Panigale V4 Tricolore experience, Ducati presents an exclusive helmet and dedicated leather suit, designed to reflect the bike’s elegance and unique essence.",
            image: "/Motor-bikes/Slike/Limited_series/Tricolore/helmet.jpg"
        }
    ];

    let currentApparelIndex = 0;

    const apparelImage = document.getElementById("apparel-image");
    const apparelTitle = document.getElementById("apparel-title");
    const apparelDescription = document.getElementById("apparel-description");

    const tab1 = document.getElementById("tab1");
    const tab2 = document.getElementById("tab2");
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
    }

    tab1.addEventListener("click", function () {
        currentApparelIndex = 0;
        updateApparelContent(currentApparelIndex);
    });

    tab2.addEventListener("click", function () {
        currentApparelIndex = 1;
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