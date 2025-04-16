document.addEventListener('DOMContentLoaded', function() {
    initializeTimelineControls();
    
    fetch('./timline.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.sort((a, b) => {
                return parseInt(a.releaseDate.from) - parseInt(b.releaseDate.from);
            });
            
            displayTimeline(data, 'all');
            
            setupFilters(data);
        })
        .catch(error => {
            console.error('Error fetching timeline data:', error);
            const timelineContainer = document.querySelector('.vertical-timeline');
            if (timelineContainer) {
                timelineContainer.innerHTML = 
                    '<div class="error">Oprostite, prišlo je do napake pri nalaganju podatkov.</div>';
            }
        });

    setupDetailOverlayListeners();

    setupBackToTop();

    createEraInfoOverlay();
    
    const heroSection = document.querySelector('.about-hero');
    if (heroSection) {
        const testImg = new Image();
        testImg.onload = function() {
        };
        testImg.onerror = function() {
            heroSection.classList.add('no-image');
        };
        testImg.src = '../Slike/ducati-showroom.jpg';
    }

    function handleMapError() {
        const mapElement = document.getElementById('interactive-map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="map-fallback">
                    <div class="map-fallback-text">Interaktivni zemljevid trenutno ni na voljo</div>
                    <div class="map-fallback-address">
                        <i class="fas fa-map-marker-alt"></i> Kotnikova ulica 5, 1000 Ljubljana
                    </div>
                    <img src="../Slike/location-map.png" alt="Lokacija trgovine" 
                         onerror="this.onerror=null; this.src='../Slike/static-map.jpg'; this.onerror=function(){this.style.display='none'; this.parentElement.innerHTML += '<p>Slika zemljevida ni na voljo</p>';}">
                    <a href="https://goo.gl/maps/AyBKqpAfPARuQnYj6" target="_blank" rel="noopener noreferrer" class="map-link">
                        <i class="fas fa-external-link-alt"></i> Odpri v Google Maps
                    </a>
                </div>
            `;
        }
    }

    function handleMapScriptError() {
        console.warn('Failed to load Google Maps API script');
        handleMapError();
    }
    
    let map;
    function initMap() {
        try {
            if (!window.google || !window.google.maps) {
                console.warn('Google Maps API not available');
                handleMapError();
                return;
            }
            
            const scriptElements = document.querySelectorAll('script');
            let apiKeyIssue = false;
            
            for (const script of scriptElements) {
                if (script.src && script.src.includes('maps.googleapis.com')) {
                    if (script.src.includes('REPLACE_WITH_YOUR_ACTUAL_API_KEY') || 
                        script.src.includes('YOUR_API_KEY')) {
                        console.warn('Google Maps API key not provided. Using fallback display instead.');
                        apiKeyIssue = true;
                        break;
                    }
                }
            }
            
            if (apiKeyIssue) {
                handleMapError();
                return;
            }
                        const storeLocation = { lat: 46.054208, lng: 14.509716 };
            
            const mapElement = document.getElementById("interactive-map");
            if (!mapElement) {
                console.error('Map element not found');
                return;
            }
            
            map = new google.maps.Map(mapElement, {
                zoom: 16,
                center: storeLocation,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true,
            });
            
            const marker = new google.maps.Marker({
                position: storeLocation,
                map: map,
                title: "Max MotoSport",
                animation: google.maps.Animation.DROP,
            });
            
            const infoContent = `
                <div class="map-info-window">
                    <h3>Max MotoSport</h3>
                    <p>Uradni Ducati prodajalec</p>
                    <p><strong>Odpiralni čas:</strong><br>
                    Pon - Pet: 9:00 - 18:00<br>
                    Sob: 9:00 - 13:00</p>
                    <p><strong>Telefon:</strong> +386 1 234 5678</p>
                </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
            });
            
            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });
            
            infoWindow.open(map, marker);
        } catch (error) {
            console.error('Error initializing Google Map:', error);
            handleMapError();
        }
    }
    
    window.initMap = initMap;
    
    window.gm_authFailure = handleMapError;

    document.querySelectorAll('.member-image img').forEach(img => {
        img.onload = function() {
            if (this.naturalHeight > this.naturalWidth) {
                this.parentElement.classList.add('portrait');
            }
        };
        
        if (img.complete) {
            if (img.naturalHeight > img.naturalWidth) {
                img.parentElement.classList.add('portrait');
            }
        }
    });

    function handleMapError() {
        const mapElement = document.getElementById('interactive-map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="map-fallback">
                    <div class="map-fallback-text">Interaktivni zemljevid trenutno ni na voljo</div>
                    <div class="map-fallback-address">
                        <i class="fas fa-map-marker-alt"></i> Kotnikova ulica 5, 1000 Ljubljana
                    </div>
                    <img src="../Slike/static-map.jpg" alt="Lokacija trgovine" 
                         onerror="this.style.display='none'">
                    <a href="https://goo.gl/maps/1BkqFwSvjTrqeCLu6" target="_blank" rel="noopener noreferrer" class="map-link">
                        <i class="fas fa-external-link-alt"></i> Odpri v Google Maps
                    </a>
                </div>
            `;
        }
    }

    (function() {
        emailjs.init("YOUR_EMAILJS_USER_ID"); 
    })();
    
    const showContactBtn = document.getElementById('showContactForm');
    const cancelContactBtn = document.getElementById('cancelContactForm');
    const contactFormContainer = document.getElementById('contactFormContainer');
    const contactForm = document.getElementById('contactForm');
    
    if (showContactBtn && contactFormContainer) {
        showContactBtn.addEventListener('click', function() {
            contactFormContainer.classList.add('active');
            contactFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    
    if (cancelContactBtn && contactFormContainer) {
        cancelContactBtn.addEventListener('click', function() {
            contactFormContainer.classList.remove('active');
        });
    }
    
    if (contactForm) {
        const originalContactForm = contactForm.innerHTML;
        
        function validateForm() {
            let isValid = true;
            
            contactForm.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
            });
            
            contactForm.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    field.parentElement.classList.add('error');
                    isValid = false;
                }
            });
            
          
            const emailField = document.getElementById('email');
            if (emailField && emailField.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value.trim())) {
                    emailField.parentElement.classList.add('error');
                    isValid = false;
                }
            }
            
            
            const phoneField = document.getElementById('phone');
            if (phoneField && phoneField.value.trim()) {
               
                const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
                if (!phonePattern.test(phoneField.value.trim())) {
                    phoneField.parentElement.classList.add('error');
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
           
            if (!validateForm()) {
                return;
            }
            
           
            const sendingIndicator = contactForm.querySelector('.sending-indicator');
            if (sendingIndicator) {
                sendingIndicator.classList.add('active');
            }
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const cancelBtn = contactForm.querySelector('.cancel-btn');
            
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            if (cancelBtn) {
                cancelBtn.disabled = true;
            }
            
           
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || "Ni podan",
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            emailjs.send(
                'YOUR_SERVICE_ID', 
                'YOUR_TEMPLATE_ID', 
                {
                    to_email: 'maxmotosport.shop@gmail.com',
                    from_name: formData.name,
                    from_email: formData.email,
                    phone: formData.phone,
                    subject: formData.subject,
                    message: formData.message
                }
            ).then(function() {
                contactForm.innerHTML = `
                    <div class="form-success">
                        <i class="fas fa-check-circle"></i>
                        <h3>Hvala za vaše sporočilo!</h3>
                        <p>Odgovorili vam bomo v najkrajšem možnem času.</p>
                        <button type="button" class="close-success-btn">Zapri</button>
                    </div>
                `;
                
                const closeSuccessBtn = contactForm.querySelector('.close-success-btn');
                if (closeSuccessBtn) {
                    closeSuccessBtn.addEventListener('click', function() {
                        contactFormContainer.classList.remove('active');
                        setTimeout(() => {
                            contactForm.reset();
                            contactForm.innerHTML = originalContactForm;
                        }, 300);
                    });
                }
            }).catch(function(error) {
                console.error('Error sending email:', error);
                contactForm.innerHTML = `
                    <div class="form-success">
                        <i class="fas fa-times-circle" style="color: #d32f2f;"></i>
                        <h3>Napaka pri pošiljanju sporočila</h3>
                        <p>Prišlo je do napake. Prosimo, poskusite znova ali nas kontaktirajte neposredno na maxmotosport.shop@gmail.com.</p>
                        <button type="button" class="close-success-btn">Zapri</button>
                    </div>
                `;
                
                const closeBtn = contactForm.querySelector('.close-success-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        contactFormContainer.classList.remove('active');
                        setTimeout(() => {
                            contactForm.reset();
                            contactForm.innerHTML = originalContactForm;
                        }, 300);
                    });
                }
            }).finally(function() {
                if (sendingIndicator) {
                    sendingIndicator.classList.remove('active');
                }
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                if (cancelBtn) {
                    cancelBtn.disabled = false;
                }
            });
        });
        
        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', function() {
                if (field.hasAttribute('required') && !field.value.trim()) {
                    field.parentElement.classList.add('error');
                } else {
                    field.parentElement.classList.remove('error');
                    
                    if (field.type === 'email' && field.value.trim()) {
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailPattern.test(field.value.trim())) {
                            field.parentElement.classList.add('error');
                        }
                    }
                    
                    if (field.type === 'tel' && field.value.trim()) {
                        const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
                        if (!phonePattern.test(field.value.trim())) {
                            field.parentElement.classList.add('error');
                        }
                    }
                }
            });
            
            field.addEventListener('input', function() {
                if (field.value.trim()) {
                    field.parentElement.classList.remove('error');
                }
            });
        });
    }
});

if (typeof window.initMap !== 'function') {
    window.initMap = function() {
        const mapElement = document.getElementById('interactive-map');
        if (mapElement && mapElement.innerHTML.trim() === '') {
            const handleMapError = function() {
                mapElement.innerHTML = `
                    <div class="map-fallback">
                        <div class="placeholder-img">
                            <span>Interaktivni zemljevid trenutno ni na voljo</span>
                            <p>Nahajamo se na Ljubljanska cesta 123, 1000 Ljubljana</p>
                        </div>
                        <a href="https://goo.gl/maps/WZYpzSdEMDpES31S6" target="_blank" class="map-link">
                            <i class="fas fa-external-link-alt"></i> Odpri v Google Maps
                        </a>
                    </div>
                `;
            };
            
            handleMapError();
        }
    };
}

function setupDetailOverlayListeners() {
    const overlay = document.getElementById('timelineDetailOverlay');
    const closeDetailBtn = document.querySelector('.close-detail');
    
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', closeDetailOverlay);
    } else {
        console.warn('Close button for detail overlay not found');
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDetailOverlay();
        }
    });
    
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeDetailOverlay();
            }
        });
    } else {
        console.warn('Timeline detail overlay element not found');
    }
}

function initializeTimelineControls() {
    const toggleBtn = document.getElementById('toggleTimelineBtn');
    const skipBtn = document.getElementById('skipTimelineBtn');
    const timelineContent = document.getElementById('timelineContent');
    const timelineSection = document.getElementById('timelineSection');
    
    if (!toggleBtn || !skipBtn || !timelineContent || !timelineSection) {
        console.warn('One or more timeline control elements are missing');
        return;
    }
    
    toggleBtn.addEventListener('click', function() {
        timelineContent.classList.toggle('minimized');
        
        if (timelineContent.classList.contains('minimized')) {
            toggleBtn.textContent = 'Razširi časovnico';
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            
            fetch('./timline.json')
                .then(response => response.json())
                .then(data => {
                    displayTimeline(data, filter);
                })
                .catch(() => {}); 
        } else {
            toggleBtn.textContent = 'Minimiziraj časovnico';
            const showMoreBtn = document.querySelector('.timeline-show-more');
            if (showMoreBtn) showMoreBtn.remove();
        }
    });
    
    skipBtn.addEventListener('click', function() {
        const footer = document.getElementById('footer-placeholder');
        
        if (footer && footer.offsetHeight > 0) {
            footer.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({
                top: document.body.scrollHeight - 100,
                behavior: 'smooth'
            });
        }
        
        skipBtn.textContent = 'Preskočeno!';
        setTimeout(() => {
            skipBtn.textContent = 'Preskoči časovnico';
        }, 2000);
    });

    const yearRangeFilterBtn = document.getElementById('year-range-filter');
    const yearRangeSelector = document.getElementById('year-range-selector');
    const applyYearFilterBtn = document.getElementById('apply-year-filter');
    const cancelYearFilterBtn = document.getElementById('cancel-year-filter');
    const startYearSelect = document.getElementById('start-year');
    const endYearSelect = document.getElementById('end-year');
    
    if (yearRangeFilterBtn && yearRangeSelector) {
        yearRangeFilterBtn.addEventListener('click', function() {
            const isVisible = yearRangeSelector.style.display === 'block';
            
            if (isVisible) {
                yearRangeSelector.style.display = 'none';
                this.classList.remove('active');
                
                document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
                
                fetch('./timline.json')
                    .then(response => response.json())
                    .then(data => {
                        displayTimeline(data, 'all');
                    })
                    .catch(error => {
                        console.error('Error fetching timeline data:', error);
                    });
            } else {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                this.classList.add('active');
                yearRangeSelector.style.display = 'block';
                
                if (!startYearSelect.options.length) {
                    populateYearDropdowns();
                }
            }
        });
        
        applyYearFilterBtn.addEventListener('click', function() {
            const startYear = startYearSelect.value;
            const endYear = endYearSelect.value;
            
            if (parseInt(startYear) > parseInt(endYear)) {
                alert('Začetno leto ne more biti večje od končnega leta.');
                return;
            }
            
            fetch('./timline.json')
                .then(response => response.json())
                .then(data => {
                    displayTimelineByYearRange(data, startYear, endYear);
                    yearRangeSelector.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error fetching timeline data:', error);
                });
        });
        
        cancelYearFilterBtn.addEventListener('click', function() {
            yearRangeSelector.style.display = 'none';
            yearRangeFilterBtn.classList.remove('active');

            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            
            fetch('./timline.json')
                .then(response => response.json())
                .then(data => {
                    displayTimeline(data, 'all');
                })
                .catch(error => {
                    console.error('Error fetching timeline data:', error);
                });
        });
    }
}

function populateYearDropdowns() {
    const startYear = document.getElementById('start-year');
    const endYear = document.getElementById('end-year');
    
    if (!startYear || !endYear) return;
    

    startYear.innerHTML = '';
    endYear.innerHTML = '';
    

    const currentYear = new Date().getFullYear();
    const earliestYear = 1940;
    

    for (let year = earliestYear; year <= currentYear; year++) {
        const startOption = document.createElement('option');
        startOption.value = year;
        startOption.textContent = year;
        startYear.appendChild(startOption);
        
        const endOption = document.createElement('option');
        endOption.value = year;
        endOption.textContent = year;
        endYear.appendChild(endOption);
    }
    

    startYear.value = earliestYear;
    endYear.value = currentYear;
}


let currentFilter = 'all';


function displayTimeline(data, filter) {
    const container = document.querySelector('.vertical-timeline');
    if (!container) return;
    
   
    currentFilter = filter;
    
    container.innerHTML = '';
    
    const existingNavDots = document.querySelector('.timeline-navigation');
    if (existingNavDots) {
        existingNavDots.remove();
    }
    
    let filteredData = data;
    if (filter === 'current') {
        filteredData = data.filter(item => item.releaseDate.to === 'present');
    } else if (filter === 'discontinued') {
        filteredData = data.filter(item => item.releaseDate.to !== 'present');
    }
    
    filteredData = [...filteredData].sort((a, b) => parseInt(a.releaseDate.from) - parseInt(b.releaseDate.from));
    
    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-results">Ni najdenih modelov za izbrane filtre.</div>';
        return;
    }
    
    displayTimelineItems(filteredData, container);
    
    if (filteredData.length > 5 && timelineContent && timelineContent.classList.contains('minimized')) {
        const showMoreContainer = document.createElement('div');
        showMoreContainer.className = 'timeline-show-more';
        showMoreContainer.innerHTML = `
            <button class="show-more-btn">Prikaži vse modele</button>
        `;
        
        showMoreContainer.querySelector('.show-more-btn').addEventListener('click', function() {
            timelineContent.classList.remove('minimized');
            const toggleBtn = document.getElementById('toggleTimelineBtn');
            if (toggleBtn) toggleBtn.textContent = 'Minimiziraj časovnico';
            
            this.parentElement.remove();
            
            window.scrollBy({
                top: 100,
                behavior: 'smooth'
            });
        });
        
        container.appendChild(showMoreContainer);
    }
}

function displayTimelineItems(items, container) {
    items = [...items].sort((a, b) => parseInt(a.releaseDate.from) - parseInt(b.releaseDate.from));
    
    const eras = [
        { 
            year: 1950, 
            label: '1950-te', 
            title: '1950-te: Začetki Ducati motociklov',
            description: 'V tem obdobju so se majhni in lahki motocikli Ducati začeli uveljavljati po drugi svetovni vojni. Podjetje se je preusmerilo iz izdelave radijskih komponent v proizvodnjo motociklov. Leta 1946 se je pojavil prvi Ducati motocikel Cucciolo ("mladič") - v bistvu motor, ki se je lahko pritrdil na kolo. Obdobje je zaznamoval razvoj majhnih enocilindrskih motorjev in ustanovitev Ducatija kot proizvajalca kakovostnih motociklov.',
            image: '../Slike/timeLine/cucciolo.jpg'
        },
        { 
            year: 1960, 
            label: '1960-te', 
            title: '1960-te: Razvoj in širitev modelov',
            description: 'V šestdesetih letih prejšnjega stoletja je Ducati razširil svojo ponudbo z raznolikimi modeli, od majhnih skuterjev do zmogljivejših enocilindrskih motorjev. Leta 1968 je Ducati predstavil legendarni Ducati Mark 3 Desmo s 350 kubičnimi centimetri, ki je bil prvi serijski motor z revolucionarnim desmodromičnim sistemom ventilov. To desetletje je zaznamoval tudi Ducati Apollo, ambiciozen vendar nikoli dokončan projekt za ustvarjanje motocikla z V4 motorjem s prostornino 1260cc.',
            image: '../Slike/timeLine/desmo.jpg'
        },
        { 
            year: 1970, 
            label: '1970-te', 
            title: '1970-te: Klasično obdobje in L-twin motorji',
            description: 'Sedemdeseta leta prejšnjega stoletja so pomenila revolucijo za Ducati z razvojem legendarnih L-twin motorjev, kjer sta valja razporejena pod kotom 90 stopinj. Ti motorji so zagotavljali boljše uravnoteženje in postali sinonim za zvok in občutek pravih Ducati motociklov. V tem obdobju se je uveljavila tudi znamenita blagovna znamka 750 GT, ki velja za eno najbolj ikoničnih klasičnih motornih koles. Ta čas je zaznamoval tudi inženir Fabio Taglioni in njegov revolucionarni desmodromični sistem ventilov.',
            image: '../Slike/timeLine/750.jpg'
        },
        { 
            year: 1990, 
            label: '1990-te', 
            title: '1990-te: Moderna era in dominacija v dirkanju',
            description: 'Devetdeseta leta so prinesla Ducatijev vzpon v svetu dirkanja in oblikovanja. Leta 1994 se je pojavil revolucionarni Ducati 916, ki ga je oblikoval Massimo Tamburini in velja za enega najlepših motociklov vseh časov. Ducati je v tem času začel dominirati v World Superbike prvenstvih, s čimer si je utrdil sloves vrhunske zmogljivosti in tehnološke naprednosti. Leta 1993 je bil predstavljen tudi model Monster, ki je postal eden najbolj prepoznavnih in prodajnih Ducatijevih modelov.',
            image: '../Slike/timeLine/916.jpg'
        },
        { 
            year: 2010, 
            label: '2010+', 
            title: '2010 in naprej: Sodobni Ducati',
            description: 'Obdobje po letu 2010 predstavlja Ducatijev vzpon pod vodstvom skupine Audi AG (od 2012), ki je del skupine Volkswagen. Ducati je v tem času razvil inovativne modele kot so Panigale V4 (prvi serijski motocikel Ducati z V4 motorjem), Multistrada V4, Streetfighter V4 in ostale, ki združujejo italijansko oblikovanje, tehnološko naprednost in dirkaško DNK. Sodobni Ducati motocikli slovijo po izjemni zmogljivosti, napredni elektroniki in prepoznavnem karakterju.',
            image: '../Slike/timeLine/panigale.jpg'
        }
    ];
    
    let currentEraIndex = 0;
    let lastItemYear = 0;
    let lastEraMarkerPosition = 0;
    let itemsAfterEraMarker = 0; 
    
    items.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.dataset.id = item.id;
        
        const year = parseInt(item.releaseDate.from);
        timelineItem.dataset.year = item.releaseDate.from;
        
        if (lastItemYear > 0 && currentFilter !== 'current') {
            while (currentEraIndex < eras.length && year >= eras[currentEraIndex].year && lastItemYear < eras[currentEraIndex].year) {
                if (itemsAfterEraMarker > 0 && itemsAfterEraMarker < 2) {
                    const spacer = document.createElement('div');
                    spacer.className = 'timeline-spacer';
                    spacer.style.height = '40px'; 
                    container.appendChild(spacer);
                }
                
                const eraMarker = document.createElement('div');
                eraMarker.className = 'era-marker';
                eraMarker.dataset.era = currentEraIndex;
                
                eraMarker.innerHTML = `<div class="era-marker-content">${eras[currentEraIndex].label}</div>`;
                
                eraMarker.addEventListener('click', function() {
                    const eraIndex = this.dataset.era;
                    const eraData = eras[eraIndex];
                    showEraInfo(eraData);
                });
                
                container.appendChild(eraMarker);
                lastEraMarkerPosition = container.children.length;
                currentEraIndex++;
                itemsAfterEraMarker = 0;
                
             
                const spacerAfter = document.createElement('div');
                spacerAfter.className = 'timeline-spacer';
                spacerAfter.style.height = '20px'; 
                container.appendChild(spacerAfter);
            }
        }
        lastItemYear = year;
        itemsAfterEraMarker++; 
        
        const formattedDate = `${item.releaseDate.from} - ${item.releaseDate.to === 'present' ? 'danes' : item.releaseDate.to}`;
        
        let imagePath = '';
        try {
            if (item.imageUrl && item.imageUrl.startsWith('/Slike/')) {
                imagePath = '..' + item.imageUrl;
            } else {
                imagePath = item.imageUrl || '#';
            }
        } catch (e) {
            imagePath = '#';
        }
        
        timelineItem.innerHTML = `
            <div class="timeline-content-box">
                <div class="timeline-date">${formattedDate}</div>
                <div class="timeline-image">
                    <img src="${imagePath}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-img\\'>${item.name}</div>'">
                </div>
                <div class="timeline-name">${item.name}</div>
            </div>
        `;
        
        timelineItem.addEventListener('click', function() {
            document.querySelectorAll('.timeline-item').forEach(ti => ti.classList.remove('active'));
            
            this.classList.add('active');
            
            openDetailOverlay(item);
        });
        
        container.appendChild(timelineItem);
    });
    
    
    if (currentFilter !== 'current' || items.length > 15) {
        addTimelineNavigation(container, items);
    }
}

function addTimelineNavigation(container, items) {
    if (items.length < 10) return; 
    
    const navContainer = document.createElement('div');
    navContainer.className = 'timeline-navigation';
    
    const decades = [];
    let minYear = 3000, maxYear = 0;
    
    items.forEach(item => {
        const year = parseInt(item.releaseDate.from);
        if (year < minYear) minYear = year;
        if (year > maxYear) maxYear = year;
    });
    
    const startDecade = Math.floor(minYear / 10) * 10;
    const endDecade = Math.ceil(maxYear / 10) * 10;
    
    for (let decade = startDecade; decade <= endDecade; decade += 10) {
        if (decade >= minYear && decade <= maxYear) {
            decades.push(decade);
        }
    }
    
    decades.forEach(decade => {
        const dot = document.createElement('div');
        dot.className = 'timeline-nav-dot';
        dot.title = decade.toString();
        dot.dataset.year = decade;
        
        dot.addEventListener('click', function() {
            const items = document.querySelectorAll('.timeline-item');
            let targetItem = null;
            
            items.forEach(item => {
                const itemYear = parseInt(item.dataset.year);
                if (itemYear >= decade && itemYear < decade + 10) {
                    if (!targetItem) targetItem = item;
                }
            });
            
            if (targetItem) {
                targetItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                targetItem.classList.add('active');
                setTimeout(() => {
                    targetItem.classList.remove('active');
                }, 2000);
                
                document.querySelectorAll('.timeline-nav-dot').forEach(d => {
                    d.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
        
        navContainer.appendChild(dot);
    });
    
    const timelineContent = document.getElementById('timelineContent');
    if (timelineContent) {
        timelineContent.appendChild(navContainer);
    } else {
        container.parentElement.appendChild(navContainer);
    }
}

function setupFilters(data) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            


            const timelineSection = document.getElementById('timelineSection');
            const timelineHeader = document.querySelector('.timeline-header');
            if (timelineHeader) {
                timelineHeader.scrollIntoView({ behavior: 'smooth' });
            }
            
         
            setTimeout(() => {
                displayTimeline(data, filter);
            }, 300);
        });
    });
}


function displayTimelineByYearRange(data, startYear, endYear) {

    currentFilter = 'year-range';
    
    
    data.sort((a, b) => parseInt(a.releaseDate.from) - parseInt(b.releaseDate.from));
    
    const filteredData = data.filter(item => {
        const fromYear = parseInt(item.releaseDate.from);
        const toYear = item.releaseDate.to === 'present' ? new Date().getFullYear() : parseInt(item.releaseDate.to);
        
        return (fromYear >= parseInt(startYear) && fromYear <= parseInt(endYear)) || 
               (toYear >= parseInt(startYear) && toYear <= parseInt(endYear)) ||     
               (fromYear <= parseInt(startYear) && toYear >= parseInt(endYear));    
    });
    
    const container = document.querySelector('.vertical-timeline');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-results">Ni najdenih modelov za izbrano obdobje.</div>';
        return;
    }
    
    displayTimelineItems(filteredData, container);
}

function openDetailOverlay(item) {
    try {
        const overlay = document.getElementById('timelineDetailOverlay');
        if (!overlay) {
            console.error('Detail overlay element not found');
            return;
        }
        
        const dateRange = `${item.releaseDate.from} - ${item.releaseDate.to === 'present' ? 'danes' : item.releaseDate.to}`;
        
        let imagePath = '';
        try {
            if (item.imageUrl && item.imageUrl.startsWith('/Slike/')) {
                imagePath = '..' + item.imageUrl;
            } else {
                imagePath = item.imageUrl || '#';
            }
        } catch (e) {
            console.error('Error processing image path:', e);
            imagePath = '#';
        }
        
        const titleEl = document.getElementById('detail-title');
        if (titleEl) {
            titleEl.textContent = item.name;
        }
        
        const yearsEl = document.getElementById('detail-years');
        if (yearsEl) {
            yearsEl.textContent = dateRange;
        }
        
        const detailImage = overlay.querySelector('.detail-image');
        if (detailImage) {
            detailImage.innerHTML = `
                <img src="${imagePath}" alt="${item.name}" loading="eager" 
                     onload="console.log('Image loaded successfully:', this.src)" 
                     onerror="this.parentElement.innerHTML='<div class=\\'placeholder-img\\'><span>${item.name}</span></div>'">
            `;
        }
        
        const descEl = document.getElementById('detail-description');
        if (descEl) descEl.textContent = item.description;
        
        const displEl = document.getElementById('detail-displacement');
        if (displEl) displEl.textContent = item.specs.displacement;
        
        const powerEl = document.getElementById('detail-power');
        if (powerEl) powerEl.textContent = item.specs.maxPower;
        
        const speedEl = document.getElementById('detail-speed');
        if (speedEl) speedEl.textContent = item.specs.maxSpeed;
        
        const weightEl = document.getElementById('detail-weight');
        if (weightEl) weightEl.textContent = item.specs.dryWeight;
        
        const priceEl = document.getElementById('detail-price');
        if (priceEl) priceEl.textContent = item.price;
        
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error opening detail overlay:', error);
    }
}

function closeDetailOverlay() {
    const overlay = document.getElementById('timelineDetailOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('active');
    
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
}

function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    const timelineSection = document.getElementById('timelineSection');
    
    if (!backToTopButton || !timelineSection) return;
    
    window.addEventListener('scroll', function() {
        const timelinePosition = timelineSection.getBoundingClientRect().top;
        const scrollPosition = window.scrollY;
        
        if (timelinePosition < 0 && scrollPosition > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        timelineSection.scrollIntoView({ behavior: 'smooth' });
    });
}

function createEraInfoOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'eraInfoOverlay';
    overlay.className = 'era-info-overlay';
    overlay.innerHTML = `
        <div class="era-info-content">
            <div class="era-info-header">
                <h3 id="eraInfoTitle">Era Title</h3>
                <span class="era-info-close">&times;</span>
            </div>
            <div class="era-info-image" id="eraInfoImage"></div>
            <div class="era-info-body">
                <p id="eraInfoDescription"></p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.era-info-close');
    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            overlay.classList.remove('active');
        }
    });
}

function showEraInfo(eraData) {
    const overlay = document.getElementById('eraInfoOverlay');
    const titleEl = document.getElementById('eraInfoTitle');
    const imageEl = document.getElementById('eraInfoImage');
    const descEl = document.getElementById('eraInfoDescription');
    
    if (!overlay || !titleEl || !imageEl || !descEl) return;
    
    titleEl.textContent = eraData.title;
    descEl.textContent = eraData.description;
    
    if (eraData.image) {
        imageEl.style.backgroundImage = `url(${eraData.image})`;
        imageEl.style.display = 'block';
    } else {
        imageEl.style.display = 'none';
    }
    
    overlay.classList.add('active');
}

let map;
function initMap() {
    try {
        if (!window.google || !window.google.maps) {
            console.warn('Google Maps API not available');
            handleMapError();
            return;
        }
        
        const scriptElements = document.querySelectorAll('script');
        let apiKeyIssue = false;
        
        for (const script of scriptElements) {
            if (script.src && script.src.includes('maps.googleapis.com')) {
                if (script.src.includes('REPLACE_WITH_YOUR_ACTUAL_API_KEY') || 
                    script.src.includes('YOUR_API_KEY')) {
                    console.warn('Google Maps API key not provided. Using fallback display instead.');
                    apiKeyIssue = true;
                    break;
                }
            }
        }
        
        if (apiKeyIssue) {
            handleMapError();
            return;
        }
        
        const storeLocation = { lat: 46.054208, lng: 14.509716 };
        
        const mapElement = document.getElementById("interactive-map");
        if (!mapElement) {
            console.error('Map element not found');
            return;
        }
        
        map = new google.maps.Map(mapElement, {
            zoom: 16,
            center: storeLocation,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
        });

        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            const markerView = new google.maps.marker.AdvancedMarkerElement({
                map: map,
                position: storeLocation,
                title: "Max MotoSport"
            });
            
            const infoContent = `
                <div class="map-info-window">
                    <h3>Max MotoSport</h3>
                    <p>Uradni Ducati prodajalec</p>
                    <p><strong>Odpiralni čas:</strong><br>
                    Pon - Pet: 9:00 - 18:00<br>
                    Sob: 9:00 - 13:00</p>
                    <p><strong>Telefon:</strong> +386 1 234 5678</p>
                </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
            });
            
            markerView.addListener("click", () => {
                infoWindow.open(map, markerView);
            });
            
            infoWindow.open(map, markerView);
        } else {
            console.warn('AdvancedMarkerElement not available, falling back to deprecated Marker class');
            
            const marker = new google.maps.Marker({
                position: storeLocation,
                map: map,
                title: "Max MotoSport",
                animation: google.maps.Animation.DROP,
            });
            
            const infoContent = `
                <div class="map-info-window">
                    <h3>Max MotoSport</h3>
                    <p>Uradni Ducati prodajalec</p>
                    <p><strong>Odpiralni čas:</strong><br>
                    Pon - Pet: 9:00 - 18:00<br>
                    Sob: 9:00 - 13:00</p>
                    <p><strong>Telefon:</strong> +386 1 234 5678</p>
                </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
            });
            
            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });
            
            infoWindow.open(map, marker);
        }
    } catch (error) {
        console.error('Error initializing Google Map:', error);
        handleMapError();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const showContactBtn = document.getElementById('showContactForm');
    const cancelContactBtn = document.getElementById('cancelContactForm');
    const contactFormContainer = document.getElementById('contactFormContainer');
    const contactForm = document.getElementById('contactForm');
    
    if (showContactBtn && contactFormContainer) {
        showContactBtn.addEventListener('click', function() {
            contactFormContainer.classList.add('active');
            contactFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    
    if (cancelContactBtn && contactFormContainer) {
        cancelContactBtn.addEventListener('click', function() {
            contactFormContainer.classList.remove('active');
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Pošiljanje...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value
                };
                
                console.log('Form submitted:', formData);
                
                contactForm.innerHTML = `
                    <div class="form-success">
                        <i class="fas fa-check-circle"></i>
                        <h3>Hvala za vaše sporočilo!</h3>
                        <p>Odgovorili vam bomo v najkrajšem možnem času.</p>
                        <button type="button" class="close-success-btn">Zapri</button>
                    </div>
                `;
                
                const closeSuccessBtn = contactForm.querySelector('.close-success-btn');
                if (closeSuccessBtn) {
                    closeSuccessBtn.addEventListener('click', function() {
                        contactFormContainer.classList.remove('active');
                        setTimeout(() => {
                            contactForm.reset();
                            contactForm.innerHTML = originalContactForm;
                        }, 300);
                    });
                }
            }, 1500);
        });
        
        const originalContactForm = contactForm.innerHTML;
    }
});

function handleMapError() {
    const mapElement = document.getElementById('interactive-map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div class="map-fallback">
                <img src="../Slike/location-map.jpg" alt="Lokacija trgovine" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-img\\'>Zemljevid ni na voljo</div>'">
                <a href="https://goo.gl/maps/WZYpzSdEMDpES31S6" target="_blank" class="map-link">
                    <i class="fas fa-external-link-alt"></i> Odpri v Google Maps
                </a>
            </div>
        `;
    }
}


window.gm_authFailure = handleMapError;
