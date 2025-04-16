document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.getElementById('selected-image');
    const bikeName = document.getElementById('bike-name');
    const colorButtons = document.querySelectorAll('.color-option');
    const colorSquares = document.querySelectorAll('.color-square');

    const sharedStyleImages = [
        "/Motor-bikes/Slike/Diavel_bently/s1.webp",
        "/Motor-bikes/Slike/Diavel_bently/s2.webp",
        "/Motor-bikes/Slike/Diavel_bently/s3.webp",
        "/Motor-bikes/Slike/Diavel_bently/s4.webp",
        "/Motor-bikes/Slike/Diavel_bently/s5.webp",
        "/Motor-bikes/Slike/Diavel_bently/s6.webp",
        "/Motor-bikes/Slike/Diavel_bently/s7.webp",
        "/Motor-bikes/Slike/Diavel_bently/s8.webp",
        "/Motor-bikes/Slike/Diavel_bently/s9.webp",
        "/Motor-bikes/Slike/Diavel_bently/s10.webp"
        
    ];

    let currentImageIndex = 0;
    const sharedStyleImageElement = document.getElementById("shared-style-image");

    function switchSharedStyleImage() {
        currentImageIndex = (currentImageIndex + 1) % sharedStyleImages.length;
        sharedStyleImageElement.src = sharedStyleImages[currentImageIndex];
    }

    setInterval(switchSharedStyleImage, 5000); // Switch image every 5 seconds

    const aids = [
        {
            category: "Safety",
            title: "Cornering ABS",
            text: "An anti-lock braking system is a safety system that prevents a vehicle’s wheels from locking during heavy braking. Essentially, the ABS regulates the braking pressure on the wheel, allowing it to continuously have traction on the riding surface. There are different ABS intervention levels, depending on the selected Riding Mode.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/ABS.png"
        },
        {
            category: "Comfort",
            title: "Cruise Control",
            text: "Electronic system introduced by Ducati for the first time in 2014 on the Multistrada 1200 that allows you to automatically maintain the speed set by the rider without twisting the throttle.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/Cruise control.png"
        },
        {
            category: "Safety",
            title: "Ducati Brake Light (DBL)",
            text: "In the event of sudden braking, automatically activates the flashing of the rear light to alert the following vehicles, a solution that further improves rider’s safety.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/dbl.png"
        },
        {
            category: "Performance",
            title: "Ducati Multimedia System (DMS)",
            text: "The bike is ready for this infotainment system for connecting the smartphone to the bike via Bluetooth, which allows the rider to manage the main multimedia functions of the mobile phone",
            image: "/Motor-bikes/Slike/Limited series/Aid system/DMS.png"
        },
        {
            category: "Performance",
            title: "Ducati Power Launch (DPL)",
            text: "System that guarantees lightning-fast starts allowing the rider to concentrate only on managing the clutch release.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/DPL.png"
        },
        {
            category: "Comfort",
            title: "Ducati Quick Shifter (DQS)",
            text: "Electronic system derived from racing that allows you to change gears without using the clutch and without closing the throttle when shifting to a higher gear.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/DQS.png"
        },
        {
            category: "Safety",
            title: "Daytime Running Light (DRL)",
            text: "These are the daytime running lights that are used to comply with the obligation to use dipped headlights during the day.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/DRL.png"
        },
        {
            category: "Performance",
            title: "Ducati Traction Control (DTC)",
            text: "Traction control is a system that prevents (or limits) spin of the rear wheel under acceleration. Gently manages engine clearance recovery, modulating the torque delivered and avoiding the peak that can occur when clearance recovery is complete, so as to make it even easier and more predictable. acceleration out of corners.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/DTC.png"
        },
        {
            category: "Safety",
            title: "Ducati Wheelie Control (DWC)",
            text: "System that controls the wheelie and allows you to achieve maximum acceleration performance with ease and safety.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/DWC.png"
        },
        {
            category: "Safety",
            title: "Engine Brake Control (EBC)",
            text: "The EBC helps riders to optimize the stability of the bike in extreme cornering conditions, balancing the forces to which the rear tire is subjected in conditions of intensive application of the engine brake.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/EBC.png"
        },
        {
            category: "Comfort",
            title: "Extended Cylinder Deactivation (ECD)",
            text: "Shutting off the rear cylinders at idle when the bike is stationary, and the deactivation strategy extends to the entire rear bank even at low speeds, when the engine speed and torque demand from the accelerator are low.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/ECD.png"
        },
        {
            category: "Performance",
            title: "Ride-by-Wire system",
            text: "Also known as electronic accelerator, it is a system that electronically manages the opening and closing of the throttle (s).",
            image: "/Motor-bikes/Slike/Limited series/Aid system/RWS.png"
        },
        {
            category: "Comfort",
            title: "Turn-by-Turn GPS",
            text: "Connect your smartphone to the bike via Bluetooth and visualise directions directly on your dashboard, without using external accessories or having to stop to consult your phone.",
            image: "/Motor-bikes/Slike/Limited series/Aid system/GPS.png"
        }
    ];

    let currentAidIndex = 0;

    const categoryElement = document.getElementById("aid-category");
    const titleElement = document.getElementById("aid-title");
    const textElement = document.getElementById("aid-text");
    const imageElement = document.getElementById("aid-image");

    const prevButton = document.getElementById("prev-aid");
    const nextButton = document.getElementById("next-aid");

    function updateAidContent(index) {
        const aid = aids[index];
        categoryElement.textContent = aid.category;
        titleElement.textContent = aid.title;
        textElement.textContent = aid.text;
        imageElement.src = aid.image;
        imageElement.alt = aid.title;
    }

    prevButton.addEventListener("click", function () {
        currentAidIndex = (currentAidIndex - 1 + aids.length) % aids.length;
        updateAidContent(currentAidIndex);
    });

    nextButton.addEventListener("click", function () {
        currentAidIndex = (currentAidIndex + 1) % aids.length;
        updateAidContent(currentAidIndex);
    });

    // Initialize with the first aid
    updateAidContent(currentAidIndex);

    const apparelItems = [
        {
            title: "Technical leather jacket",
            description: "Designed for those who want to add to the style of Diavel for Bentley, this jacket combines refined materials and a standout design.",
            image: "/Motor-bikes/Slike/Diavel_bently/jacket.jpg"
        },
        {
            title: "Jet Helmet",
            description: "A state-of-the-art helmet offering maximum safety and comfort, featuring a design inspired by the Diavel for Bentley.",
            image: "/Motor-bikes/Slike/Diavel_bently/helmet.jpg"
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