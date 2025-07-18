/**
 * Google Maps Configuration
 * Handles different API keys for development and production
 */

// Check if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');

const isProduction = window.location.hostname === 'maxmotosport.eu' ||
                    window.location.hostname.includes('maxmotosport.eu');

// Configuration object
const GoogleMapsConfig = {
    // Single API Key for both development and production
    apiKey: 'AIzaSyDjQjGwU0QXo_VxQfuGvYJvHsuUgPbaqsU', // Replace with your FULL API key from Google Cloud Console
    
    // Get the API key (same for both environments now)
    getApiKey: function() {
        return this.apiKey;
    },
    
    // Get the current environment
    getEnvironment: function() {
        if (isDevelopment) return 'development';
        if (isProduction) return 'production';
        return 'unknown';
    },
    
    // Map configuration
    mapOptions: {
        // Max MotoSport location in Ljubljana
        center: { lat: 46.0569, lng: 14.5058 }, // Ljubljana coordinates
        zoom: 15,
        mapTypeId: 'roadmap'
    }
};

// Initialize Google Maps
function initMap() {
    try {
        const map = new google.maps.Map(document.getElementById('map'), GoogleMapsConfig.mapOptions);
        
        // Add marker for Max MotoSport
        const marker = new google.maps.Marker({
            position: GoogleMapsConfig.mapOptions.center,
            map: map,
            title: 'MaX Motosport - Ducati Dealer',
            icon: {
                url: '/Slike/Ducati_red_logo.svg.png',
                scaledSize: new google.maps.Size(40, 40)
            }
        });
        
        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; color: #e00;">MaX Motosport</h3>
                    <p style="margin: 0; font-size: 14px;">
                        <strong>Official Ducati Dealer</strong><br>
                        Kotnikova ulica 5<br>
                        1000 Ljubljana, Slovenia
                    </p>
                </div>
            `
        });
        
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
        
        console.log(`Maps loaded successfully in ${GoogleMapsConfig.getEnvironment()} mode`);
        
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
        handleMapError();
    }
}

// Handle map loading errors
function handleMapError() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="
                padding: 20px; 
                text-align: center; 
                background: #f5f5f5; 
                border-radius: 10px;
                color: #666;
            ">
                <i class="fas fa-map-marker-alt" style="font-size: 48px; color: #e00; margin-bottom: 10px;"></i>
                <h3>Map Currently Unavailable</h3>
                <p>Visit us at: Kotnikova ulica 5, 1000 Ljubljana</p>
            </div>
        `;
    }
}

// Load Google Maps script dynamically
function loadGoogleMaps() {
    const apiKey = GoogleMapsConfig.getApiKey();
    
    if (!apiKey || apiKey.includes('YOUR_API_KEY_HERE')) {
        console.warn('Google Maps API key not configured properly');
        handleMapError();
        return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = handleMapError;
    
    document.head.appendChild(script);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleMapsConfig;
}
