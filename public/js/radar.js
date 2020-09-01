var ctx = document.getElementById('myChart').getContext('2d');
var startDate = document.getElementById('startDate');
var endDate = document.getElementById('endDate');
var label = document.getElementById('label');
let leaderboardNames;
let leaderboardData;
var myChart
function createNewBarChart() {
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Vehicle',
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderColor: '#777',
                hoverBorderWidth: 3,
                hoverBorderColor: '#000'
            },{label: 'walking',
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
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
    return myChart;
}
myChart = createNewBarChart();

// ADD DATA TO A CHART 
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}


// DELETE ALL DATA OF THE CHART PASSED INTO
function resetChart(chart) {
    chart.destroy();

    return newChart = createNewBarChart();
}
// ---------------------- CHART FUNCTIONS ---------------------- //




// EXECUTES WHEN Datepicker LOSES FOCUS
function dateChoosed(event) {
    // if (event.keyCode === 13) {
    //     submitCurrentMonth()
    //     return;
    // }

    submitCurrentMonth()

}

// FUNCTION EXECUTES WHEN THE WHOLE BODY IS LOADED
function onloadBody() {

}




function submitCurrentMonth() {
  submitDates();
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
          if(response['finalObject'].length==0){
            label.innerHTML = "NO DATA AVAILABLE FOR SELECTED MONTH"
          }
       
        leaderboardNames =Object.keys(response['finalObject']['vehicle']['date']);
        leaderboardData=Object.values(response['finalObject']['vehicle']['date']);
        //leaderboardData.push([Object.values(response['finalObject']['walking']['date'])]);
        console.log(response.finalObject)
        myChart = resetChart(myChart); // RESET THE CHART
        var i=0; 
       
        
        for ( i in leaderboardNames) { // ADD NEW VALUES (THE ONES RETURNED FROM THE SERVER) TO THE CHART
            addData(myChart, leaderboardNames[i], leaderboardData[i])
        }
        myChart.update();
      }
    })
    
}  

