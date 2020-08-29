 
   
    let ChartOfTransportations = document.getElementById('PieChartOfTransportations').getContext('2d');
    let BarLeaderBoard=document.getElementById('LeaderBoard').getContext('2d');
    // Global Options
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';
    let data=[50,40,60,80];

    let TransChart = new Chart(ChartOfTransportations, {
      type:'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data:{
        labels:['Walking', 'Bicycle', 'Other Means of Transportation'],
        datasets:[{
          label:'Ways Of Transportation',
          data:[
            data[0],
            data[1],
            data[3]
          ],
          //backgroundColor:'green',
          backgroundColor:[
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            '#777'
          ],
          borderWidth:1,
          borderColor:'#777',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        }]
      },
      options:{
        title:{
          display:true,
          text:'Your Transportations In The Last 12 Months',
          fontSize:25
        },
        legend:{
          display:true,
          position:'right',
          labels:{
            fontColor:'#000'
          }
        },
        layout:{
          padding:{
            left:0,
            right:0,
            bottom:0,
            top:0
          }
        },
        tooltips:{
          enabled:true
        }
      }
    });

   

    let LeaderChart = new Chart(BarLeaderBoard, {
      type:'horizontalBar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data:{
        labels:['1', '2', '3' ,'Your Score'],
        datasets:[{
          label:'Scores',
          data:[
           50,
           45,
           40,
           70
          ],
          //backgroundColor:'green',
          backgroundColor:[
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'            
          ],
          borderWidth:1,
          borderColor:'#777',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        }]
      },
      options:{
        title:{
          display:true,
          text:'Leaderboard of current month',
          fontSize:25
        },
        legend:{
          display:true,
          position:'right',
          labels:{
            fontColor:'#000'
          }
        },
        layout:{
          padding:{
            left:0,
            right:0,
            bottom:0,
            top:0
          }
        },
        tooltips:{
          enabled:true
        },
        scales: 
        {
           xAxes: 
           [{
             ticks:
              {
                min: 0,
              }
            }]
        }
      }
    });
    jay=y;
    $.ajax({
        url: "/ecocharts",
        type: "POST",
        cache: false,
        contentType: false,
        processData: false,
        data: jay,
        success: function (response) {
            console.log("Success");
        });