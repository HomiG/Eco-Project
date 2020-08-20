function inRangeOfRect(rectangular, insertedPoint) { //returns true if a point is inside the given rectangular

    if (rectangular._northEastLat > insertedPoint.latitude && rectangular._northEastLng > insertedPoint.longitude) {
        if (rectangular._southWestLat < insertedPoint.latitude && rectangular._southWestLng < insertedPoint.longitude) {
            return true;
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