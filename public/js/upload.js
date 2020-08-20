


// Create Heatmap Instance
var heatmapLayer = new HeatmapOverlay(cfg);
var sensitiveRect;
var div = document.getElementById('areaSelected')

// Declaer the baseLayer
baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFuZG9tbmFtZWdyIiwiYSI6ImNrZHJwaWdkbDBiNXYyeW83NmQ1aDU2bDkifQ.TAMboxLmOiUsmRbljrplEQ',
  {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
  })



//Iniate map 
var map = L.map('mapid', {
  selectArea: true, // will enable it by default
  center: patrasLatLng,
  zoom: 13,
  layers: [baseLayer, heatmapLayer]
});


heatmapLayer.setData(testData);


// Add ta marker in Given Cetner Of Patras 
var marker = L.marker(patrasLatLng).addTo(map);

//Patras Circle Range
var circle = L.circle(patrasLatLng, {
  color: 'green',
  fillColor: '#3388ff',
  fillOpacity: 0.01,
  radius: 10000 //10KM
}).addTo(map);



map.selectArea.enable();
var testVar = map.on('areaselected', (e) => {
  div.innerHTML = "\nArea Selected: NorthEast: lat " + e.bounds._northEast.lat + ", lng " + e.bounds._northEast.lng +
    " \nSouthWest: lat " + e.bounds._southWest.lat + ", lng " + e.bounds._southWest.lng;
  console.log(e.bounds.toBBoxString()); // lon, lat, lon, lat

  sensitiveRect = {
    _northEastLat: e.bounds._northEast.lat,
    _northEastLng: e.bounds._northEast.lng,
    _southWestLat: e.bounds._southWest.lat,
    _southWestLng: e.bounds._southWest.lng
  }
  
  

});

function uploadJSONFiltered() {
  
  $.ajax({
    url: "/troll",
    type:'POST',
    data: sensitiveRect,
    success: function (result) {
      console.log("SUCCESS!@")
    }
  });

}