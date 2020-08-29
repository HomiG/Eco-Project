
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
            ecoscoreTag.innerHTML = 'Your ecoscore is: ' + allData.ecoscore + " %"
            dtst = [JSON.stringify( allData.walking), JSON.stringify(allData.bicycle), JSON.stringify(allData.vehicle)];;

        }
    });

    let ChartOfTransportations = document.getElementById('PieChartOfTransportations').getContext('2d');
    let BarLeaderBoard = document.getElementById('LeaderBoard').getContext('2d');
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
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            '#777'
          ],
          borderWidth: 1,
          borderColor: '#777',
          hoverBorderWidth: 3,
          hoverBorderColor: '#000'
        }]
      },
      options: {
        visible:false,
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