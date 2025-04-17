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
                    '<div class="error">Sorry, there was an error loading the data.</div>';
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
                        <h3>Thank you for your message!</h3>
                        <p>We will respond as soon as possible.</p>
                        <button type="button" class="close-success-btn">Close</button>
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
                        <h3>Error sending message</h3>
                        <p>An error occurred. Please try again or contact us directly at maxmotosport.shop@gmail.com.</p>
                        <button type="button" class="close-success-btn">Close</button>
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
            toggleBtn.textContent = 'Expand timeline';
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            
            fetch('./timline.json')
                .then(response => response.json())
                .then(data => {
                    displayTimeline(data, filter);
                })
                .catch(() => {}); 
        } else {
            toggleBtn.textContent = 'Minimize timeline';
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
        
        skipBtn.textContent = 'Skipped!';
        setTimeout(() => {
            skipBtn.textContent = 'Skip timeline';
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
                alert('The starting year cannot be greater than the ending year.');
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
        container.innerHTML = '<div class="no-results">No models found for the selected filters.</div>';
        return;
    }
    
    displayTimelineItems(filteredData, container);
    
    if (filteredData.length > 5 && timelineContent && timelineContent.classList.contains('minimized')) {
        const showMoreContainer = document.createElement('div');
        showMoreContainer.className = 'timeline-show-more';
        showMoreContainer.innerHTML = `
            <button class="show-more-btn">Show all models</button>
        `;
        
        showMoreContainer.querySelector('.show-more-btn').addEventListener('click', function() {
            timelineContent.classList.remove('minimized');
            const toggleBtn = document.getElementById('toggleTimelineBtn');
            if (toggleBtn) toggleBtn.textContent = 'Minimize timeline';
            
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
            label: '1950s', 
            title: '1950s: The beginnings of Ducati motorcycles',
            description: "During this period, Ducati's small, lightweight motorcycles began to gain popularity after World War II. The company shifted from manufacturing radio components to producing motorcycles. In 1946, the first Ducati motorcycle, the Cucciolo (little boy), appeared - essentially a motorcycle that could be attached to a bicycle. The period was marked by the development of small single-cylinder engines and the establishment of Ducati as a manufacturer of quality motorcycles.",
            image: '../Slike/timeLine/cucciolo.jpg'
        },
        { 
            year: 1960, 
            label: '1960s', 
            title: '1960s: Development and expansion of models',
            description: 'In the 1960s, Ducati expanded its range with a variety of models, from small scooters to more powerful single-cylinder engines. In 1968, Ducati introduced the legendary 350cc Ducati Mark 3 Desmo, the first production motorcycle to feature the revolutionary Desmodromic valve system. The decade was also marked by the Ducati Apollo, an ambitious but never-completed project to create a 1260cc V4 motorcycle.',
            image: '../Slike/timeLine/desmo.jpg'
        },
        { 
            year: 1970, 
            label: '1970s', 
            title: '1970s: The Classic Era and L-twin Engines',
            description: 'The 1970s were a revolution for Ducati with the development of the legendary L-twin engines, with the cylinders arranged at an angle of 90 degrees. These engines provided better balance and became synonymous with the sound and feel of a true Ducati motorcycle. This period also saw the rise of the famous 750 GT brand, considered one of the most iconic classic motorcycles. This era was also marked by engineer Fabio Taglioni and his revolutionary desmodromic valve system.',
            image: '../Slike/timeLine/750.jpg'
        },
        { 
            year: 1990, 
            label: '1990s', 
            title: '1990s: The modern era and dominance in racing',
            description: "The 1990s saw Ducati's rise in the world of racing and design. In 1994, the revolutionary Ducati 916, designed by Massimo Tamburini and considered one of the most beautiful motorcycles of all time, appeared. During this time, Ducati began to dominate the World Superbike championships, cementing its reputation for superior performance and technological advancement. In 1993, the Monster model was also introduced, which became one of Ducati's most recognizable and best-selling models.",
            image: '../Slike/timeLine/916.jpg'
        },
        { 
            year: 2010, 
            label: '2010+', 
            title: '2010 and beyond: Modern Ducati',
            description: "The period after 2010 represents Ducati's rise under the leadership of Audi AG (since 2012), part of the Volkswagen Group. During this time, Ducati developed innovative models such as the Panigale V4 (the first production Ducati motorcycle with a V4 engine), the Multistrada V4, the Streetfighter V4 and others, which combine Italian design, technological advancement and racing DNA. Modern Ducati motorcycles are renowned for their exceptional performance, advanced electronics and distinctive character.",
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
        container.innerHTML = '<div class="no-results">No models found for the selected period.</div>';
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
