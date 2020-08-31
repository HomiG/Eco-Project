var ctx = document.getElementById('goodCanvas1').getContext('2d');
var datePicker = document.getElementById('datePicker');
var todayDate = new Date().toISOString().slice(0, 10); // get Today.
var label = document.getElementById('label');
let leaderboardNames;
let leaderboardData;
var myChart

datePicker.value = todayDate



// ---------------------- CHART FUNCTIONS ---------------------- //

// MY FUNCTION TO INITIATE A BAR CAHRT 
function createNewBarChart() {
    myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            datasets: [{
                label: '# of Votes',
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
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    return myChart;
}

// USE ABOVE FUNCTION TO INIATE IT
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
    var dateForm = new FormData();
    dateForm.append('todayMonth', datePicker.valueAsNumber)
    $.ajax({
        url: "/leaderboard",
        type: "post",
        cache: false,
        contentType: false,
        processData: false,
        data: dateForm,
        success: function (response) {
            if(response['names'].length == 0){
                label.innerHTML = "NO DATA AVAILABLE FOR SELECTED MONTH"
            }
            console.log(response)
            leaderboardNames = response['names']
            leaderboardData = response['scores']
            myChart = resetChart(myChart); // RESET THE CHART 
            for (var i in leaderboardNames) { // ADD NEW VALUES (THE ONES RETURNED FROM THE SERVER) TO THE CHART
                addData(myChart, leaderboardNames[i], leaderboardData[i])
            }

            myChart.update();
        }
    })
}