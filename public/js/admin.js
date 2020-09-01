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

// document.getElementById('import').onclick = function() 
// {
//   var files = document.getElementById('selectFiles').files;
//   console.log(files);
//   if (files.length <= 0) {
//     return false;
//   }

//   var fr = new FileReader();

//   fr.onload = function(e) { 
//   console.log(e);
//     var result = JSON.parse(e.target.result);
//     var formatted = JSON.stringify(result, null, 2);
//         document.getElementById('result').value = formatted;
//   }

//   fr.readAsText(files.item(0));
// };

// const uploadForm = document.querySelector('.upload')
// uploadForm.addEventListener('submit', function(e) {
//   e.preventDefault()
//   let file = e.target.uploadFile.files[0]
// })

// fetch('http://localhost:3000/users', {
//    method: "POST",
//    headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json"
//    },
//    body: JSON.stringify({
//       name: name,
//    })
// })
// .then(resp => resp.json())
// .then(data => {
//    // do something here
// })

// const uploadForm = document.querySelector('.upload')
// uploadForm.addEventListener('submit', function(e) {
//   e.preventDefault()
//   let file = e.target.uploadFile.files[0]   
//   let formData = new FormData()
//   formData.append('file', file)
// })
