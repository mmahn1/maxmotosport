/**
 * Super Fast Google Maps - Load only when needed
 */

let mapLoaded = false;

// Ultra simple map initialization
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 46.0569, lng: 14.5058 },
        zoom: 15
    });
    
    new google.maps.Marker({
        position: { lat: 46.0569, lng: 14.5058 },
        map: map,
        title: 'MaX Motosport'
    });
}

// Load map only when user scrolls near it
function loadMapWhenVisible() {
    if (mapLoaded) return;
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Check if map is visible on screen
    const rect = mapContainer.getBoundingClientRect();
    const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
    
    if (isVisible) {
        mapLoaded = true;
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDjQjGwU0QXo_VxQfuGvYJvHsuUgPbaqsU&callback=initMap';
        document.head.appendChild(script);
        
        // Remove scroll listener to avoid multiple loads
        window.removeEventListener('scroll', loadMapWhenVisible);
    }
}

// Start watching for map visibility after page loads
window.addEventListener('load', function() {
    // Try immediate load first
    setTimeout(loadMapWhenVisible, 1000);
    
    // Also watch scroll events
    window.addEventListener('scroll', loadMapWhenVisible);
});

// Fallback: load map when user clicks the map area
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.addEventListener('click', function() {
            if (!mapLoaded) {
                loadMapWhenVisible();
            }
        });
    }
});
