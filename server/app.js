/**
 * This file implements the app layer of the server.
 *
 * The server application is structures in three layers:
 *
 * +--------------------+
 * |      endpoint      |   Receives and decodes REST/JSON messages from the client
 * +--------------------+
 *           |
 * +====================+
 * |        app         |   Handled caching and business logic (if any is added) of the application
 * +====================+
 *           |
 * +--------------------+
 * |       service      |   Implements the communication with Rejseplanen
 * +--------------------+
 *
 *
 * Created by schwarz on 31/05/15.
 */
var service = require("./service");

var nextDeparturesCache = {};
var stopsInAreaCache = {};

/**
 * Retrieves a possibly cached list  of the stops in the area from Rejseplanen. Invokes hte given callback
 *
 * @param coordX The current latitute in millionths of degrees
 * @param coordY The current longitute in millionths of degrees
 * @param maxDistance The maximum distance of stops to return
 * @param callback The callback to invoke when Rejseplanen returns a result
 */

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

/**
 * Retrieves a possibly cached list of the next departures from a given stop from Rejseplanen.
 *
 * @param departureBoardId The ID of the departure board to list depatures for (possibly get this from getStopsInArea)
 * @param callback The callback to invoke when Rejseplanen returns a result
 */
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