var ctx = document.getElementById('myChart').getContext('2d');
var startDate = document.getElementById('startDate');
var endDate = document.getElementById('endDate');
var label = document.getElementById('label');
let leaderboardNames;
let leaderboardData=[];
var myChart
function createNewBarChart() {
    myChart = new Chart(ctx, {
        type: 'radar',
        data: {
            datasets: [{
                data: [],
                label: 'Vehicle',
                backgroundColor: 
                    'rgba(255, 99, 132, 0.2)'
                   ,
                
            }, {
                data: [],
                label: 'Walking',
                backgroundColor: 
                    'rgba(54, 162, 235, 0.2)',
                    
                },
                {
                    data: [],
                    label: 'Bicycle',
                    backgroundColor: 
                        'rgba(255, 206, 86, 0.2)',
                                      
                    
                },{
                    data: [],
                    label: 'Still',
                    backgroundColor:
                        'rgba(153, 102, 255, 0.2)',
                    
                    
                },{
                    data: [],
                    label: 'Tilting',
                    backgroundColor: 
                        'rgba(255, 159, 64, 0.2)',
                      
                
                },{
                    data: [],
                    label: 'Unknown',
                    backgroundColor: [
                       
                    ],
                    
                }
            ]
    }
    ,    options: {
            title: {
                display: true,
                text: 'Your Transportations per Day of the Week or Hour of the Day',
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
    var i, j;
    for (j = 0; j < data.length; j++) {
        for (i = 0; i < data[j].length; i++) {
            chart.data.datasets[j].data.push(data[j][i]);
        }
    };

    for (i = 0; i < label.length; i++) {

        chart.data.labels.push(label[i]);
    }


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



    $.ajax({
        url: "/radarRangeDates",
        type: "POST",
        cache: false,
        contentType: false,
        processData: false,
        data: dateForm,
        success: function (response) {
            if (response.length == 0) {
                label.innerHTML = "NO DATA AVAILABLE FOR SELECTED MONTH"
            }
            date='hours';
            leaderboardNames = Object.keys(response['vehicle'][date]);
            //leaderboardData = [Object.values(response['vehicle']['date']), Object.values(response['foot']['date'])];
            leaderboardData.push(Object.values(response['vehicle'][date]));
            leaderboardData.push(Object.values(response['foot'][date]));
            leaderboardData.push(Object.values(response['bicycle'][date]));
            leaderboardData.push(Object.values(response['still'][date]));
            leaderboardData.push(Object.values(response['tilting'][date]));
            leaderboardData.push(Object.values(response['unknown'][date]));
            console.log(response)
            myChart = resetChart(myChart); // RESET THE CHART
            var i = 0;


            // ADD NEW VALUES (THE ONES RETURNED FROM THE SERVER) TO THE CHART
            addData(myChart, leaderboardNames, leaderboardData)

            myChart.update();
        }
    })

}

