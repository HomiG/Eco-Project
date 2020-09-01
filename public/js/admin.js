
var fromDate = document.getElementById('fromDate');
var untilDate = document.getElementById('untilDate');
var fromDay = document.getElementById('fromDay');
var untilDay = document.getElementById('untilDay');
var fromTime = document.getElementById('fromTime');
var untilTime = document.getElementById('untilTime');

var locationTimestampObject = {
  latitude: 1,
  longitude: 1,
  timestamp: 1
}




// ---------------- MAP ---------------- // 

// Create Heatmap Instance
var heatmapLayer = new HeatmapOverlay(cfg);

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


//heatmapLayer.setData(testData);


// Add ta marker in Given Cetner Of Patras 
var marker = L.marker(patrasLatLng).addTo(map);

//Patras Circle Range
var circle = L.circle(patrasLatLng, {
  color: 'green',
  fillColor: '#3388ff',
  fillOpacity: 0.01,
  radius: 10000 //10KM
}).addTo(map);

// ---------------- MAP ---------------- //




// Database Delete All Data, by sending post



function deleteAllData() {
  $.ajax({
    url: "/deleteData",
    type: "post",
    cache: false,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log('All data Deleted!')
    }
  })
}



function drawHeatmap(){

  var db = makeDb();

  var locationTimestampData = db.query('SELECT latitudeE7, longitudeE7, timestampMs FROM `entry` ');

  console.long(locationTimestampData)

}





// When the user scrolls down 5px from the top of the document,we will show the button
window.onscroll = function () {
  if (document.body.scrollTop > 5 || document.documentElement.scrollTop > 5) {
    document.getElementById("myBtn").style.display = "block";
  }
  else {
    document.getElementById("myBtn").style.display = "none";
  }
};
function scrollToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
function openNav() {
  document.getElementById("mySidenav").style.width = "200px";
}
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}



