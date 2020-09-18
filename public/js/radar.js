
var radarctx = document.getElementById('myRadar').getContext('2d');
var pie = document.getElementById('pieChart').getContext('2d');
var startDate = document.getElementById('startDate');
var endDate = document.getElementById('endDate');
//var label = document.getElementById('label');
var date='date'

var myRadar
var pieChart
function createNewPieChart() {
    pieChart=new Chart(pie,{
        type:'doughnut',
        data:{
            datasets:[{
                data:[],
                label:'type',
                backgroundColor:[
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(16, 238, 131, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(165, 160, 160, 0.6)',
                    'rgba(153,51,0,0.6)',
                    'rgba(102,0,102,0.6)'
                ],
                borderColor:[
                    'rgba(54, 162, 235, 1)',
                    'rgba(16, 238, 131, 1)' ,
                    'rgba(255, 206, 86, 1)',
                    'rgba(165, 160, 160, 1)',
                    'rgba(153,51,0,1)',
                    'rgba(102,0,102,1)'
                ]
            }]
        },options: {
            title: {
                display: true,
                text: 'The distribution of your types of transportation (%)',
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
    return pieChart;
}
    
function radracreateNewBarChart() {
    myRadar = new Chart(radarctx, {
        type: 'bar',
        data: {
            datasets: [{
                data: [],
                label: 'Vehicle',
                backgroundColor:
                'rgba(54, 162, 235, 0.6)',
                    
               
                borderColor:
                'rgba(54, 162, 235, 1)',
            
            }, {
                data: [],
                label: 'Walking',
                backgroundColor:
                     'rgba(16, 238, 131, 0.6)',
                     
                borderColor:
                'rgba(16, 238, 131, 1)'        
                        ,
            },
            {
                data: [],
                label: 'Bicycle',
                backgroundColor:
                    'rgba(255, 206, 86, 0.6)',
                borderColor:
                'rgba(255, 206, 86, 1)'

            }, {
                data: [],
                label: 'Still',
                backgroundColor:
                'rgba(165, 160, 160, 0.6)',
                
                   
                borderColor:
                'rgba(165, 160, 160, 1)',
            }, {
                data: [],
                label: 'Tilting',
                backgroundColor:
                   'rgba(153,51,0,0.6)'
                    ,
                borderColor:
                'rgba(153,51,0, 1)'

            }, {
                data: [],
                label: 'Unknown',
                backgroundColor: 'rgba(102,0,102,0.6)',
                borderColor:'rgba(102,0,102,1)'
                

            }
            ]
        }
        , options: {
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
    return myRadar;
}
myRadar = radracreateNewBarChart();
pieChart=createNewPieChart();

// ADD DATA TO A CHART 
function addPie(chart,label,Bdata) {
    
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(Bdata);
    });

    // for (i = 0; i < label.length; i++) {
    //     chart.data.datasets.push(Bdata[i]);
    //     chart.data.labels.push(label[i]);
    // }
    chart.update();

}
function radarAddData(chart, label, newData) {
    var i = 0, j = 0;
    i = 0; j = 0;
    for (j = 0; j < newData.length; j++) {
        for (i = 0; i < newData[j].length; i++) {
            chart.data.datasets[j].data.push(newData[j][i]);
        }
    };

    for (i = 0; i < label.length; i++) {

        chart.data.labels.push(label[i]);
    }


    chart.update();
}
function resetPie(chart){
    chart.destroy();
    return newChart=createNewPieChart();
}

// DELETE ALL DATA OF THE CHART PASSED INTO
function radarResetChart(chart) {
    chart.destroy();

    return newChart = radracreateNewBarChart();
}
// ---------------------- CHART FUNCTIONS ---------------------- //



// EXECUTES WHEN Datepicker LOSES FOCUS
function dateChoosedforCharts(event) {
    // if (event.keyCode === 13) {
    //     submitCurrentMonth()
    //     return;
    // }

    sradarSubmitDates();

}

// FUNCTION EXECUTES WHEN THE WHOLE BODY IS LOADED
function onloadBody() {

}

function radarToggleChart(){
    var checkbox=document.getElementById('cheese');
    if (checkbox.checked){
        date='hours';
    }
    else{
        date='date'
    }
    sradarSubmitDates();
}



function sradarSubmitDates() {
    let radarNames;
    let radarData = [];
    let pieData=[];
    startDate = document.getElementById('startDate');
    endDate = document.getElementById('endDate');
    // var myRadar
    // var pieChart


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
            // if (response.length == 0) {
            //     label.innerHTML = "NO DATA AVAILABLE FOR SELECTED MONTH"
            // }
            //date = 'hours';
            radarNames = Object.keys(response['vehicle'][date]);
            //radarData = [Object.values(response['vehicle']['date']), Object.values(response['foot']['date'])];
            radarData.push(Object.values(response['vehicle'][date]));
            radarData.push(Object.values(response['foot'][date]));
            radarData.push(Object.values(response['bicycle'][date]));
            radarData.push(Object.values(response['still'][date]));
            radarData.push(Object.values(response['tilting'][date]));
            radarData.push(Object.values(response['unknown'][date]));
            let sum=response.vehicle.type+response.foot.type+response.bicycle.type+response.still.type+response.tilting.type+response.unknown.type;
            pieData.push((response.vehicle.type*100/sum).toFixed(3));
            pieData.push((response.foot.type*100/sum).toFixed(3));
            pieData.push((response.bicycle.type*100/sum).toFixed(3));
            pieData.push((response.still.type*100/sum).toFixed(3));
            pieData.push((response.tilting.type*100/sum).toFixed(3));
            pieData.push((response.unknown.type*100/sum).toFixed(3));
            console.log(response)
            console.log(pieData)
            myRadar = radarResetChart(myRadar); // RESET THE CHART
            pieChart=resetPie(pieChart);
            names=['Vehicle','Walking','Bicycle','Still','Tilting', 'Unknown']
            var i = 0;
            for(i=0; i<pieData.length;i++){
            addPie(pieChart,names[i],pieData[i])}
            
            // console.log(radarData);
            // ADD NEW VALUES (THE ONES RETURNED FROM THE SERVER) TO THE CHART
            radarAddData(myRadar, radarNames, radarData)
            pieChart.update();
            myRadar.update();
        }
    })

}

