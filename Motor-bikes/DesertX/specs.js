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
    const aids = [
        {
            category: "Safety",
            title: "Cornering ABS",
            text: "An anti-lock braking system is a safety system that prevents a vehicle’s wheels from locking during heavy braking. Essentially, the ABS regulates the braking pressure on the wheel, allowing it to continuously have traction on the riding surface. There are different ABS intervention levels, depending on the selected Riding Mode.",
            image: "/Motor-bikes/Slike/DesertX specs/ABS.png"
        },
        {
            category: "Comfort",
            title: "Cruise Control",
            text: "Electronic system introduced by Ducati for the first time in 2014 on the Multistrada 1200 that allows you to automatically maintain the speed set by the rider without twisting the throttle.",
            image: "/Motor-bikes/Slike/DesertX specs/Cruise control.png"
        },
        {
            category: "Safety",
            title: "Ducati Brake Light (DBL)",
            text: "In the event of sudden braking, automatically activates the flashing of the rear light to alert the following vehicles, a solution that further improves rider’s safety.",
            image: "/Motor-bikes/Slike/DesertX specs/dbl.png"
        },
        {
            category: "Performance",
            title: "Ducati Multimedia System (DMS)",
            text: "The bike is ready for this infotainment system for connecting the smartphone to the bike via Bluetooth, which allows the rider to manage the main multimedia functions of the mobile phone",
            image: "/Motor-bikes/Slike/DesertX specs/DMS.png"
        },
        {
            category: "Comfort",
            title: "Ducati Quick Shifter (DQS)",
            text: "Electronic system derived from racing that allows you to change gears without using the clutch and without closing the throttle when shifting to a higher gear.",
            image: "/Motor-bikes/Slike/DesertX specs/DQS.png"
        },
        {
            category: "Safety",
            title: "Daytime Running Light (DRL)",
            text: "These are the daytime running lights that are used to comply with the obligation to use dipped headlights during the day.",
            image: "/Motor-bikes/Slike/DesertX specs/DRL.png"
        },
        {
            category: "Performance",
            title: "Ducati Traction Control (DTC)",
            text: "Traction control is a system that prevents (or limits) spin of the rear wheel under acceleration. Gently manages engine clearance recovery, modulating the torque delivered and avoiding the peak that can occur when clearance recovery is complete, so as to make it even easier and more predictable. acceleration out of corners.",
            image: "/Motor-bikes/Slike/DesertX specs/DTC.png"
        },
        {
            category: "Safety",
            title: "Ducati Wheelie Control (DWC)",
            text: "System that controls the wheelie and allows you to achieve maximum acceleration performance with ease and safety.",
            image: "/Motor-bikes/Slike/DesertX specs/DWC.png"
        },
        {
            category: "Safety",
            title: "Engine Brake Control (EBC)",
            text: "The EBC helps riders to optimize the stability of the bike in extreme cornering conditions, balancing the forces to which the rear tire is subjected in conditions of intensive application of the engine brake.",
            image: "/Motor-bikes/Slike/DesertX specs/EBC.png"
        },
        {
            category: "Performance",
            title: "Ride-by-Wire system",
            text: "Also known as electronic accelerator, it is a system that electronically manages the opening and closing of the throttle (s).",
            image: "/Motor-bikes/Slike/DesertX specs/RWS.png"
        }
        ,
        {
            category: "Comfort",
            title: "Turn-by-Turn GPS",
            text: "Connect your smartphone to the bike via Bluetooth and visualise directions directly on your dashboard, without using external accessories or having to stop to consult your phone.",
            image: "/Motor-bikes/Slike/DesertX specs/GPS.png"
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

    const modelSpecs = {
        DESERTX: {
            title: "DesertX", // Matches the text in the <a> element
            specs: [
                "DISPLACEMENT: 937cc",
                "POWER: 110hp (81kW) @ 9250 rpm",
                "TORQUE: 92 Nm @ 6,500 rpm",
                "SEAT HEIGHT: 875 mm",
                "FUEL TANK CAPACITY: 19 l"
            ],
            graph: "/Motor-bikes/Slike/DesertX specs/graf1.png",
            backLink: "/Motor-bikes/DesertX/DesertX.html"
        },
        DESERTX_DISCOVERY: {
            title: "DesertX_Discovery", // Matches the text in the <a> element
            specs: [
                "DISPLACEMENT: 937cc",
                "POWER: 110hp (81kW) @ 9250 rpm",
                "TORQUE: 92 Nm @ 6,500 rpm",
                "SEAT HEIGHT: 875 mm",
                "FUEL TANK CAPACITY: 19 l"
            ],
            graph: "/Motor-bikes/Slike/DesertX specs/graf2.png",
            backLink: "/Motor-bikes/DesertX/DesertX Discovery.html"
        },
        DESERTX_RALLY: {
            title: "DesertX_Rally", // Matches the text in the <a> element
            specs: [
                "DISPLACEMENT: 937cc",
                "POWER: 110hp (81kW) @ 9250 rpm",
                "TORQUE: 92 Nm @ 6,500 rpm",
                "SEAT HEIGHT: 910 mm",
                "FUEL TANK CAPACITY: 21 l"
            ],
            graph: "/Motor-bikes/Slike/DesertX specs/graf3.png",
            backLink: "/Motor-bikes/DesertX/DesertX Rally.html"
        }
    };

    const specsTitle = document.getElementById("specs-title");
    const specsList = document.getElementById("specs-list");
    const specsGraph = document.getElementById("specs-graph");
    const modelOptions = document.querySelectorAll(".model-options ul li a");
    const goBackButton = document.getElementById("go-back-button");

    function updateModelSelection(model) {
        if (modelSpecs[model]) {
            const { title, specs, graph, backLink } = modelSpecs[model];
            specsTitle.textContent = title.replace("_", " "); // Replace underscores with spaces for display
            specsList.innerHTML = specs.map(spec => `<li>${spec}</li>`).join("");
            specsGraph.src = graph;
            specsGraph.alt = `${title} Graph`;

            // Update the "Go Back" button link
            goBackButton.setAttribute("onclick", `location.href='${backLink}'`);

            // Update the selected class
            modelOptions.forEach(opt => opt.parentElement.classList.remove("selected"));
            const selectedOption = Array.from(modelOptions).find(opt => opt.textContent.trim().toUpperCase() === model.replace("_", " "));
            if (selectedOption) {
                selectedOption.parentElement.classList.add("selected");
            }
        }
    }

    modelOptions.forEach(option => {
        option.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            const model = this.textContent.trim().toUpperCase().replace(" ", "_");
            updateModelSelection(model);
            history.pushState(null, "", `?model=${model}`); // Update the URL without reloading
        });
    });

    // Handle browser back/forward navigation
    window.addEventListener("popstate", function () {
        const urlParams = new URLSearchParams(window.location.search);
        const model = urlParams.get("model") || "DESERTX"; // Default to DESERTX
        updateModelSelection(model);
    });

    // Initialize the page based on the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get("model") || "DESERTX"; // Default to DESERTX
    updateModelSelection(model);
});
