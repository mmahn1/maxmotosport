document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');

   const aids = [
    {
        category: "Safety",
        title: "Cornering ABS",
        text: "An anti-lock braking system is a safety system that prevents a vehicle’s wheels from locking during heavy braking. Essentially, the ABS regulates the braking pressure on the wheel, allowing it to continuously have traction on the riding surface. There are different ABS intervention levels, depending on the selected Riding Mode.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/ABS.png"
    },
    {
        category: "Comfort",
        title: "Cruise Control",
        text: "Electronic system introduced by Ducati for the first time in 2014 on the Multistrada 1200 that allows you to automatically maintain the speed set by the rider without twisting the throttle.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/Cruise control.png"
    },
    {
        category: "Safety",
        title: "Ducati Brake Light (DBL)",
        text: "In the event of sudden braking, automatically activates the flashing of the rear light to alert the following vehicles, a solution that further improves rider’s safety.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/dbl.png"
    },
    {
        category: "Performance",
        title: "Ducati Multimedia System (DMS)",
        text: "The bike is ready for this infotainment system for connecting the smartphone to the bike via Bluetooth, which allows the rider to manage the main multimedia functions of the mobile phone",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/DMS.png"
    },
    {
        category: "Performance",
        title: "Ducati Power Launch (DPL)",
        text: "System that guarantees lightning-fast starts allowing the rider to concentrate only on managing the clutch release.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/DPL.png"
    },
    {
        category: "Comfort",
        title: "Ducati Quick Shifter (DQS)",
        text: "Electronic system derived from racing that allows you to change gears without using the clutch and without closing the throttle when shifting to a higher gear.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/DQS.png"
    },
    {
        category: "Safety",
        title: "Daytime Running Light (DRL)",
        text: "These are the daytime running lights that are used to comply with the obligation to use dipped headlights during the day.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/DRL.png"
    },
    {
        category: "Performance",
        title: "Ducati Traction Control (DTC)",
        text: "Traction control is a system that prevents (or limits) spin of the rear wheel under acceleration. Gently manages engine clearance recovery, modulating the torque delivered and avoiding the peak that can occur when clearance recovery is complete, so as to make it even easier and more predictable. acceleration out of corners.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/DTC.png"
    },
    {
        category: "Safety",
        title: "Ducati Wheelie Control (DWC)",
        text: "System that controls the wheelie and allows you to achieve maximum acceleration performance with ease and safety.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/DWC.png"
    },
    {
        category: "Safety",
        title: "Engine Brake Control (EBC)",
        text: "The EBC helps riders to optimize the stability of the bike in extreme cornering conditions, balancing the forces to which the rear tire is subjected in conditions of intensive application of the engine brake.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/EBC.png"
    },
    {
        category: "Comfort",
        title: "Extended Cylinder Deactivation (ECD)",
        text: "Shutting off the rear cylinders at idle when the bike is stationary, and the deactivation strategy extends to the entire rear bank even at low speeds, when the engine speed and torque demand from the accelerator are low.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/ECD.png"
    },
    {
        category: "Performance",
        title: "Ride-by-Wire system",
        text: "Also known as electronic accelerator, it is a system that electronically manages the opening and closing of the throttle (s).",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/RWS.png"
    },
    {
        category: "Comfort",
        title: "Turn-by-Turn GPS",
        text: "Connect your smartphone to the bike via Bluetooth and visualise directions directly on your dashboard, without using external accessories or having to stop to consult your phone.",
        image: "/Motor-bikes/Slike/Limited_series/Aid_system/GPS.png"
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

    // Apparel Section 1
    const apparelItems1 = [
        {
            title: "Protection with an exclusive look",
            description: "Part of the “Ducati SuMisura” line, the Superleggera V4 racing suit is equipped with an integrated |D |air® racing airbag system, customisable and featuring graphics and colours inspired by the bike.",
            image: "/Motor-bikes/Slike/Limited_series/Superlegera_V4/racing.jpg"
        },
        {
            title: "High tech. Maximum safety.",
            description: "The Ducati Corse Carbon 2 Superleggera V4 helmet is one of the most exclusive helmets ever made. Derived from the GP-6 RC helmet used in Formula 1, it consists of a lightweight carbon fibre outer shell that combines low weight and safety.",
            image: "/Motor-bikes/Slike/Limited_series/Superlegera_V4/helmet.jpg"
        }
    ];

    let currentApparelIndex1 = 0;

    const apparelImage1 = document.getElementById("apparel-image");
    const apparelTitle1 = document.getElementById("apparel-title");
    const apparelDescription1 = document.getElementById("apparel-description");

    const tab1_1 = document.getElementById("tab1");
    const tab2_1 = document.getElementById("tab2");
    const prevApparel1 = document.getElementById("prev-apparel");
    const nextApparel1 = document.getElementById("next-apparel");

    function updateApparelContent1(index) {
        const item = apparelItems1[index];
        apparelImage1.src = item.image;
        apparelImage1.alt = item.title;
        apparelTitle1.textContent = item.title;
        apparelDescription1.textContent = item.description;

        tab1_1.classList.toggle("active", index === 0);
        tab2_1.classList.toggle("active", index === 1);
    }

    tab1_1.addEventListener("click", function () {
        currentApparelIndex1 = 0;
        updateApparelContent1(currentApparelIndex1);
    });

    tab2_1.addEventListener("click", function () {
        currentApparelIndex1 = 1;
        updateApparelContent1(currentApparelIndex1);
    });

    prevApparel1.addEventListener("click", function () {
        currentApparelIndex1 = (currentApparelIndex1 - 1 + apparelItems1.length) % apparelItems1.length;
        updateApparelContent1(currentApparelIndex1);
    });

    nextApparel1.addEventListener("click", function () {
        currentApparelIndex1 = (currentApparelIndex1 + 1) % apparelItems1.length;
        updateApparelContent1(currentApparelIndex1);
    });

    updateApparelContent1(currentApparelIndex1);

    // Apparel Section 2
    const apparelItems2 = [
        {
            title: "Experience the thrill of the track",
            description: "The Racing Kit is the supplied configuration that gives the Superleggera V4 the unbeatable power/weight ratio of 1.54 kg. An exclusive set-up of ultra-light components and technologically advanced equipment, designed to give the rider the absolute thrill of the track.",
            image: "/Motor-bikes/Slike/Limited_series/Superlegera_V4/a1.jpg"
        },
        {
            title: "Master the force of the wind",
            description: "The Superleggera V4 mounts an aerodynamic package derived from the GP16 project. A configuration that effectively acts on the bike's stability in acceleration and braking, allowing the rider to fully exploit the motorcycle's potential.",
            image: "/Motor-bikes/Slike/Limited_series/Superlegera_V4/a2.jpg"
        },
        {
            title: "To break every record",
            description: "For the Superleggera V4, an exclusive 'Race GP' interface has been developed based on the guidance of Andrea Dovizioso and his experience in MotoGP. When you're fully focused on the race, you only have a few fractions of a second to get key information.",
            image: "/Motor-bikes/Slike/Limited_series/Superlegera_V4/a3.jpg"
        }
    ];

    let currentApparelIndex2 = 0;

    const apparelImage2 = document.getElementById("apparel-image-2");
    const apparelTitle2 = document.getElementById("apparel-title-2");
    const apparelDescription2 = document.getElementById("apparel-description-2");

    const tab1_2 = document.getElementById("tab1-2");
    const tab2_2 = document.getElementById("tab2-2");
    const tab3_2 = document.getElementById("tab3-2");
    const prevApparel2 = document.getElementById("prev-apparel-2");
    const nextApparel2 = document.getElementById("next-apparel-2");

    function updateApparelContent2(index) {
        const item = apparelItems2[index];
        apparelImage2.src = item.image;
        apparelImage2.alt = item.title;
        apparelTitle2.textContent = item.title;
        apparelDescription2.textContent = item.description;

        tab1_2.classList.toggle("active", index === 0);
        tab2_2.classList.toggle("active", index === 1);
        tab3_2.classList.toggle("active", index === 2);
    }

    tab1_2.addEventListener("click", function () {
        currentApparelIndex2 = 0;
        updateApparelContent2(currentApparelIndex2);
    });

    tab2_2.addEventListener("click", function () {
        currentApparelIndex2 = 1;
        updateApparelContent2(currentApparelIndex2);
    });

    tab3_2.addEventListener("click", function () {
        currentApparelIndex2 = 2;
        updateApparelContent2(currentApparelIndex2);
    });

    prevApparel2.addEventListener("click", function () {
        currentApparelIndex2 = (currentApparelIndex2 - 1 + apparelItems2.length) % apparelItems2.length;
        updateApparelContent2(currentApparelIndex2);
    });

    nextApparel2.addEventListener("click", function () {
        currentApparelIndex2 = (currentApparelIndex2 + 1) % apparelItems2.length;
        updateApparelContent2(currentApparelIndex2);
    });

    updateApparelContent2(currentApparelIndex2);
});