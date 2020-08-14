


// Create Heatmap Instance
var heatmapLayer = new HeatmapOverlay(cfg);


// Declaer the baseLayer
baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFuZG9tbmFtZWdyIiwiYSI6ImNrZHJwaWdkbDBiNXYyeW83NmQ1aDU2bDkifQ.TAMboxLmOiUsmRbljrplEQ', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
})



//Iniate map 
var mymap = L.map('mapid', {
  center: patrasLatLng,
  zoom: 13,
  layers: [baseLayer, heatmapLayer]
});


heatmapLayer.setData(testData);


// Add ta marker in Given Cetner Of Patras 
var marker = L.marker(patrasLatLng).addTo(mymap); 

//Patras Circle Range
var circle = L.circle(patrasLatLng, {
    color: 'green',
    fillColor: '#3388ff',
    fillOpacity: 0.01   ,
    radius: 10000 //10KM
}).addTo(mymap);



var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

var but = document.getElementById('button1')

but.addEventListener('click', event => {
  heatmapLayer.addData({lat:38.249995780478734, lng: 21.73734389646722, count: 5});
});

