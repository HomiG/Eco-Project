// var testData = {
//   max: 20,
//   data: [{lat: 38.241457 , lng:21.729826, count: 50},{lat: 38.23834911449784, lng:21.731457215382072, count: 5}, {lat:38.22206317426216, lng: 21.726693612171623, count: 4}]
// };



var patrasLatLng = [38.230462, 21.753150];

var cfg = {

    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    "radius": 0.0004,
    "maxOpacity": .8,
    // scales the radius based on map zoom
    "scaleRadius": true,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": true,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lng"
    lngField: 'lng',
    // which field name in your data represents the data value - default "value"
    valueField: 'count'
  };



  function bulkInsert(connection, table, objectArray, callback) {
    let keys = Object.keys(objectArray[0]);
    let values = objectArray.map( obj => keys.map( key => obj[key]));
    let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
    connection.query(sql, [values], function (error, results, fields) {
      if (error) callback(error);
      callback(null, results);
    });
  }
  