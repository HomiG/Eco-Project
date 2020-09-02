function convertQuerryToHeatmapObject(query){

    var i;
    var locationsObject;
    var objectForHeatmap //This is a javascript object that HeatmapJs understands and translate it into colors
    var locationsObjectArr = [];
  
    for (i = 0; i < query.length; i++) {
      locationsObject = {
        lat: query[i].latitudeE7 * Math.pow(10, -7),
        lng: query[i].longitudeE7 * Math.pow(10, -7),
        count: 1
      }
      locationsObjectArr.push(locationsObject)
    }
  
     objectForHeatmap = {
      data: locationsObjectArr,
      max: locationsObjectArr.length
    }
  
    return objectForHeatmap;
  }

  module.exports = convertQuerryToHeatmapObject