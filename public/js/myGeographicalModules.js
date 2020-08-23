function inRangeOfRect(rectangular, insertedPoint) { //returns true if a point is inside the given rectangular


    var i;
    for (i = 0; i < rectangular.length; i++) {
        if (rectangular[i]._northEastLat > insertedPoint.latitude && rectangular[i]._northEastLng > insertedPoint.longitude) {
            if (rectangular[i]._southWestLat < insertedPoint.latitude && rectangular[i]._southWestLng < insertedPoint.longitude) {
                return true;
            }
        }
    }
    return false;
}

function geopointToMyPoint(geopoint) {
    return mypoint = {
        latitude: geopoint.latitude(false),
        longitude: geopoint.longitude(false)
    }
}
module.exports = { inRangeOfRect, geopointToMyPoint };