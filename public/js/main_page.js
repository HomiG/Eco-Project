


function uploadFile() {

  window.location.href = "/upload"

}

function logout(){
   $.ajax({
    url: "/logout",
    type: "post",
    cache: false,
    contentType: false,
    processData: false,
    data: false,
    success:function(){
      console.log("Logged out")
      window.location.href = "/"

    }})
 
}



function runOnload() {
  var ecoscoreTag = document.getElementById('ecoscoreTag');
  var allData;
  let dtst = [];
  function calculate() {

    console.log("TRST DONE")
    $.ajax({
      url: "/ecocharts",
      type: "POST",
      cache: false,
      contentType: false,

      processData: false,
      success: function (response) {
        console.log("RESPONSED")
        console.log(response)
        allData = response;
        ecoscoreTag.innerHTML = 'Your ecoscore is: ' + allData.ecoscore + " % <br> The dates you have uploaded are between " + allData['firstdate'].slice(0, 10)
          + ' and ' + allData.lastdate.slice(0, 10) + " <br> Last file uploaded: " + new Date(parseInt(allData.lastFileUpload)).toISOString().slice(0, 10);;
        dtst = [JSON.stringify(allData.walking), JSON.stringify(allData.bicycle), JSON.stringify(allData.vehicle)];;




        let ChartOfTransportations = document.getElementById('PieChartOfTransportations').getContext('2d');

        // Global Options
        Chart.defaults.global.defaultFontFamily = 'Lato';
        Chart.defaults.global.defaultFontSize = 18;
        Chart.defaults.global.defaultFontColor = '#777';


        let TransChart = new Chart(ChartOfTransportations, {
          type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
          data: {

            labels: ['Walking', 'Bicycle', 'Vehicle'],
            datasets: [{
              label: 'Ways Of Transportation',
              data: dtst,
              //backgroundColor:'green',
              backgroundColor: [
                'rgba(76, 239, 35, 0.6)',
                'rgba(47, 234, 238, 0.6)',
                'rgba(238, 131, 16,0.6)'
              ],
              borderWidth: 1,
              borderColor: '#777',
              hoverBorderWidth: 3,
              hoverBorderColor: '#000'
            }]
          },
          options: {
            visible: false,
            title: {
              display: true,
              text: 'Your Transportations In The Last 12 Months',
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
                left: 0,
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
    });




  }


  calculate();
}


//for navbar
let mainNav = document.getElementById("js-menu");
let navBarToggle = document.getElementById("js-navbar-toggle");

navBarToggle.addEventListener("click", function() {
  mainNav.classList.toggle("active");
});



window.onscroll = function() {myFunction()};

var navbar = document.getElementById("navigationbar");
var sticky = navbar.offsetTop;

function myFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}
//


function scrollToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}