var ststChrt = document.getElementById('statChart').getContext('2d');
var data = ['type', 'user', 'hour', 'day', 'month', 'year'];
var thischart = data[0];
var chrt;
function createChart(vlabel) {
    var y="bar"
    if(vlabel=='type'){
        y="pie";
    }
    pieChart = new Chart(ststChrt, {
        type: y,
        data: {
            datasets: [{
                data: [],
                label: vlabel,
                backgroundColor: [
                    'rgba(0, 0, 0, 0.6)',
                    'rgba(138, 76, 5, 0.6)',
                    'rgba(245, 0, 208, 0.6)',
                    'rgba(245, 0, 0, 0.6)',
                    'rgba(245, 78, 0, 0.6)',
                    'rgba(245, 175, 0, 0.6)',
                    'rgba(118, 245, 0, 0.6)',
                    'rgba(0, 245, 188, 0.6)',
                    'rgba(0, 24, 245, 0.6)',
                    'rgba(135, 0, 245, 0.6)',
                    'rgba(0, 0, 0, 0.6)',
                    'rgba(138, 76, 5, 0.6)',
                    'rgba(245, 0, 208, 0.6)',
                    'rgba(245, 0, 0, 0.6)',
                    'rgba(245, 78, 0, 0.6)',
                    'rgba(245, 175, 0, 0.6)',
                    'rgba(118, 245, 0, 0.6)',
                    'rgba(0, 245, 188, 0.6)',
                    'rgba(0, 24, 245, 0.6)',
                    'rgba(135, 0, 245, 0.6)',
                    'rgba(0, 0, 0, 0.6)',
                    'rgba(138, 76, 5, 0.6)',
                    'rgba(245, 0, 208, 0.6)',
                    'rgba(245, 0, 0, 0.6)',
                    'rgba(245, 78, 0, 0.6)',
                    'rgba(245, 175, 0, 0.6)',
                    'rgba(118, 245, 0, 0.6)',
                    'rgba(0, 245, 188, 0.6)',
                    'rgba(0, 24, 245, 0.6)',
                    'rgba(135, 0, 245, 0.6)'

                ],
                borderColor: []

            }]
        }, options: {
            title: {
                display: true,
                text: 'The distribution of your types of transportation',
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
chrt = createChart(thischart);
function onloadBody() {
    submitObject();
}
function addStats(chart, label, Bdata) {

    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(Bdata);
    });
}

function statResetChart(chart, label) {
    chart.destroy();

    return newChart = createChart(label);
}

function changeChart(){
var x= document.getElementById('chartpicker').value;
console.log(x)
thischart=x;
submitObject();
}

function submitObject() {
    let statLabels = [];
    let statData = [];

    $.ajax({
        url: "/statistics",
        type: "post",
        cache: false,
        contentType: false,
        processData: false,
        data: false,
        success: function (response) {
            console.log(response)
            var data = response;
            var i = 0;
            switch (thischart) {
                case 'type':
                    for (i = 0; i < Object.values(data.type).length; i++) {

                        statLabels.push(Object.keys(data['type'])[i]);
                        statData.push(Object.values(data['type'])[i]);
                    }
                    break;
                case 'user':
                    for (i = 0; i < Object.values(data.users).length; i++) {

                        statLabels.push(Object.values(data['users'])[i].username);
                        statData.push(Object.values(data['users'])[i].count);
                    }
                    break;
                case 'hour':
                    for (i = 0; i < Object.values(data.hours).length; i++) {

                        statLabels.push(Object.keys(data['hours'])[i]);
                        statData.push(Object.values(data['hours'])[i]);
                    }
                    break;
                case 'day':
                    for (i = 0; i < Object.values(data.days).length; i++) {

                        statLabels.push(Object.keys(data['days'])[i]);
                        statData.push(Object.values(data['days'])[i]);
                    }
                    break;
                case 'month':
                    for (i = 0; i < Object.values(data.months).length; i++) {

                        statLabels.push(Object.keys(data['months'])[i]);
                        statData.push(Object.values(data['months'])[i]);
                    }
                    break;
                    case 'year':
                        for (i = 0; i < Object.values(data.years).length; i++) {
    
                            statLabels.push(Object.keys(data['years'])[i]);
                            statData.push(Object.values(data['years'])[i]);
                        }
                        break;

            }


            chrt = statResetChart(chrt, thischart);
            for (i = 0; i < statData.length; i++) {
                addStats(chrt, statLabels[i], statData[i])
            }
            chrt.update();
        }
    })
}