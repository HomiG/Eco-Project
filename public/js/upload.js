//const { end } = require("../../config/database");




// Create Heatmap Instance
var heatmapLayer = new HeatmapOverlay(cfg);
var sensitiveRect;
var counter = 1;
var sensitiveRectArr = [];
var sensitiveRectCord = document.getElementById('areaSelected')

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



map.selectArea.enable();
map.on('areaselected', (e) => {
  sensitiveRectCord.innerHTML = counter++ + ") Area(s) Selected: NorthEast: lat " + e.bounds._northEast.lat + ", lng " + e.bounds._northEast.lng +
    " \nSouthWest: lat " + e.bounds._southWest.lat + ", lng " + e.bounds._southWest.lng;
  //  console.log(e.bounds.toBBoxString()); // lon, lat, lon, lat

  sensitiveRect = {
    _northEastLat: e.bounds._northEast.lat,
    _northEastLng: e.bounds._northEast.lng,
    _southWestLat: e.bounds._southWest.lat,
    _southWestLng: e.bounds._southWest.lng
  }

  sensitiveRectArr.push(sensitiveRect)
  console.log(sensitiveRectArr)

  // console.log(sensitiveRectArr)
});

function uploadJSONFiltered() {

  var statusDiv = document.getElementById('status')
  var docPicker = document.getElementById('docpicker');
  //console.log(docPicker.files[0])



  var file = docPicker.files[0];
  var formFile = new FormData(); // Create a form (it's like an array) where you put all the data you want to send via post. Accepts strings and files.
  var formSensitiveAreas = new FormData();

  formFile.append('file', file);

  formSensitiveAreas.append("areas", JSON.stringify(sensitiveRectArr))


  $.ajax({
    url: "/uploadJson",
    type: "POST",
    cache: false,
    contentType: false,
    processData: false,
    data: formFile,
    success: function (response) {
      statusDiv.innerHTML = 'File uplaoding to the database... Please wait'
      console.log("Uploaded File Successfully!")
      $.ajax({
        url: "/test",
        type: "POST",
        cache: false,
        contentType: false,
        processData: false,
        data: formSensitiveAreas,
        success: function (response) {
          statusDiv.innerHTML = 'File Uploaded Succesfully!'
          alert("Passed Into Database")
          //console.log(response);
        }
      })
    }
  });

}

function showFullHeatmap() {
  $.ajax({
    url: "/getHeatmap",
    type: "POST",
    cache: false,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log(response)
      heatmapLayer.setData(response)

    }
  })


}


function submitDates() {
  startDate = document.getElementById('startDate');
  endDate = document.getElementById('endDate');

  var dateForm = new FormData();
  dateForm.append('since', startDate.valueAsNumber)
  dateForm.append('until', endDate.valueAsNumber);


  var generalData;

  $.ajax({
    url: "/rangeDates",
    type: "POST",
    cache: false,
    contentType: false,
    processData: false,
    data: dateForm,
    success: function (response) {
      console.log(response)
      heatmapLayer.setData(response.objectForHeatmap)
      generalData = response.finalObject;
    }
  })
  // Global Options
  Chart.defaults.global.defaultFontFamily = 'Lato';
  Chart.defaults.global.defaultFontSize = 18;
  Chart.defaults.global.defaultFontColor = '#777';
  let myChart = document.getElementById('myChart').getContext('2d');

  function getKeyWithMaxValue(object) { 
    var maxObjectsValue = Math.max(...Object.values(test))
    return Object.keys(object).find(key => object[key] === maxObjectsValue); 
}

  let massPopChart = new Chart(myChart, {
    type: 'radar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data: {
      labels: ['00:00', '01:00',  '02:00', '03:00','04:00','05:00',  '06:00', '07:00',
      '08:00','09:00',  '10:00', '11:00','12:00','13:00', '14:00', '15:00',  '16:00',
      '17:00','18:00', '19:00', '20:00', '21:00', '22:00',  '23:00'],
      datasets: [{
        label: 'Vehicle',
        data: [
         JSON.stringify(generalData['vehicle']['hour']),
          ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)'],
        borderWidth: 1,
        borderColor: '#777',
        hoverBorderWidth: 3,
        hoverBorderColor: '#000'
      }, {
        label: 'Running',
        data: [
          JSON.stringify( generalData['running']['hour']),
         
        ],

        borderWidth: 1,
        borderColor: '#777',
        hoverBorderWidth: 3,
        hoverBorderColor: '#000'
      }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Statistics',
        fontSize: 25
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          fontColor: '#000'
        }
      },
      layout: {
        padding: {
          left: 50,
          right: 0,
          bottom: 0,
          top: 0
        }
      },
      tooltips: {
        enabled: true
      }
    }
  });



}

