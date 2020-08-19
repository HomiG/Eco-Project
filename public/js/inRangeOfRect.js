function inRangeOfRect(northwestPoint, southeastPoint, insertedPoint) {

    if (northwestPoint.latitude > insertedPoint.latitude && northwestPoint.longitude > insertedPoint.longitude) {
        if (southeastPoint.latitude < insertedPoint.latitude && northwestPoint.longitude < insertedPoint.longitude) {
            return true;
        }
    }
    return false;


}
module.exports = inRangeOfRect;