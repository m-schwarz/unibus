/**
 * Created by schwarz on 31/05/15.
 */
var service = require("./service");

var nextDeparturesCache = {};
var stopsInAreaCache = {};

function getStopsInArea(coordX, coordY, maxDistance, callback) {
    var cachedStopsInArea = stopsInAreaCache[coordX + " " + coordY];
    if (!cachedStopsInArea) {
        service.getStopsInArea(coordX, coordY, maxDistance, function(stopsInArea) {
            stopsInAreaCache[coordX + " " + coordY] = stopsInArea;
            setTimeout(function () {
                stopsInAreaCache[coordX + " " + coordY]= undefined;
            }, 10 * 60 * 1000);
            callback(stopsInArea);
        });
    } else {
        callback(cachedStopsInArea);
    }
}

function getNextDepartures(departureBoardId, callback) {
    var cachedNextDepartures = nextDeparturesCache[departureBoardId];
    if (!cachedNextDepartures) {
        service.getNextDepartures(departureBoardId, function (nextDepartures) {
            nextDeparturesCache[departureBoardId] = nextDepartures;
            setTimeout(function () {
                nextDeparturesCache[departureBoardId] = undefined;
            }, 60 * 1000);
            callback(nextDepartures);
        });
    }
    else {
        callback(cachedNextDepartures);
    }
}

var exports = module.exports = {
    getStopsInArea: getStopsInArea,
    getNextDepartures: getNextDepartures
};