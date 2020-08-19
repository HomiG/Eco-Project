var GeoPoint = require('geopoint')



point1 = new GeoPoint(38.246034, 21.731404);
point2 = new GeoPoint(38.269623, 21.746004);
var distance = point1.distanceTo(point2, true)//output in kilometers

console.log(distance)