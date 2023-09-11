// Initialize the map
var map = L.map('map').setView([-10, 140.8444], 4); // Set initial view and zoom level

// Add a tile layer (you can choose a different basemap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define a function to style earthquake markers
function style(feature) {
    return {
        radius: feature.properties.mag * 5, // Adjust the multiplier for appropriate sizing
        fillColor: getColor(feature.geometry.coordinates[2]), // Depth
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Define a function to assign colors based on depth
function getColor(depth) {
    if (depth < 10) return '#00FF00'; // Green
    else if (depth < 30) return '#FFFF00'; // Yellow
    else if (depth < 50) return '#FFA500'; // Orange
    else return '#FF0000'; // Red
}

// Define a function for popups
function onEachFeature(feature, layer) {
    layer.bindPopup( "[Longitude,Latitude] : [" + feature.geometry.coordinates[0]+","+feature.geometry.coordinates[1]+"]"
    + "<br>Depth: " + feature.geometry.coordinates[2] + " km" 
    + "<br> Magnitude: " + feature.properties.mag);
}

// Load the GeoJSON data and add it to the map
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng);
            },
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    });

// Create a legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depths = [0, 10, 30, 50];
    var labels = [];

    div.style.backgroundColor = 'white';
    // Add the legend title
    div.innerHTML = '<h4>Depth (km)</h4>';

    // Loop through depth intervals and generate legend items
    for (var i = 0; i < depths.length; i++) {
        var from = depths[i];
        var to = depths[i + 1];
        var color = getColor(from + 1);

        // Create a colored box and label for each interval
        labels.push(
            '<i style="background-color:' + color + '"></i> ' +
            from + (to ? '&ndash;' + to : '+') + ' km');
    }

    div.innerHTML += labels.join('<br>'); // Combine legend items with line breaks
    return div;
};

legend.addTo(map);

