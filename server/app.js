/**
 * Created by schwarz on 31/05/15.
 */
var service = require("./service");

function getStopsInArea(coordX, coordY, maxDistance, callback) {
    service.getStopsInArea(coordX, coordY, maxDistance, callback);
}

var exports = module.exports = {
    getStopsInArea: getStopsInArea
};