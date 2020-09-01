const makeDb = require("../config/db");

async function drawHeatmap(){
    let date = new Date(1479167372634)

    console.log(date.getFullYear())
    console.log(date.getMonth() + 1)


    var db = makeDb();
  
    var locationTimestampData = await db.query('SELECT latitudeE7, longitudeE7, timestampMs FROM `entry` ');
  
    console.log(locationTimestampData[0])
  
  }

  drawHeatmap();