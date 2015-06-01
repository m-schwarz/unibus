/**
 * Created by schwarz on 31/05/15.
 */
var http = require('http');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var url = require('url');

var baseHost = "xmlopen.rejseplanen.dk";
var basePath = "/bin/rest.exe/";

function getStopsInArea(coordX, coordY, maxDistance, callback) {
    http.get({
            host: baseHost,
            path: basePath + "stopsNearby?coordX=" + coordX + "&coordY=" + coordY + "&maxRadius=" + maxDistance + "&maxNumber=30"
        }, function (response) {
            //Collects the full response body in a single string
            var receivedData = "";

            response.on("data", function (chunk) {
                receivedData += chunk;
            });

            response.on("end", function () {
                var doc = new dom().parseFromString(receivedData);
                var nodes = xpath.select("//LocationList/StopLocation", doc);
                var locations = [];
                // According to http://xmlopen.rejseplanen.dk/xml/rest/hafasRestStopsNearby.xsd, coordX, coordY and distance are ints.
                // Parse them accordingly and create a JSON object
                nodes.forEach(function (node) {
                    locations.push({
                        id: node.getAttribute("id"),
                        name: node.getAttribute("name"),
                        coordX: parseInt(node.getAttribute("x")),
                        coordY: parseInt(node.getAttribute("y")),
                        distance: parseInt(node.getAttribute("distance"))
                    });
                });
                callback(locations);
            });

        }
    );
}

function getNextDepartures(departureBoardId, callback) {
    http.get({
        host: baseHost,
        path: basePath + "departureBoard?id=" + departureBoardId
    }, function (response) {
        //Collects the full response body in a single string
        var receivedData = "";

        response.on("data", function (chunk) {
            receivedData += chunk;
        });

        response.on("end", function () {
            var doc = new dom().parseFromString(receivedData);
            var departures = [];
            var nodes = xpath.select("//DepartureBoard/Departure", doc);
            nodes.forEach(function(node) {
                var journeyDetail = xpath.select("JourneyDetailRef", node)[0];
                departures.push({
                    date : node.getAttribute("date"),
                    time : node.getAttribute("time"),
                    name : node.getAttribute("name"),
                    direction : node.getAttribute("direction"),
                    cancelled : !!node.getAttribute("cancelled"),
                    finalStop : node.getAttribute("finalStop"),
                    stop : node.getAttribute("stop"),
                    detailsId : journeyDetail.getAttribute("ref")
                });
            });
            callback(departures);
        });
    });
}

function getJourneyDetails(journeyDetailsId, callback) {
    //At Rejseplanen, the ID happens to be a URL
    var parsedUrl = url.parse(journeyDetailsId);
    http.get({
        host: parsedUrl.host,
        path: parsedUrl.pathname + "?" + parsedUrl.query
    }, function (response) {
        //Collects the full response body in a single string
        var receivedData = "";

        response.on("data", function (chunk) {
            receivedData += chunk;
        });

        response.on("end", function () {
            var doc = new dom().parseFromString(receivedData);
            var stops = [];
            var nodes = xpath.select("//JourneyDetail/Stop", doc);
            nodes.forEach(function(node) {
                stops.push({
                    name : node.getAttribute("name"),
                    depTime : node.getAttribute("depTime"),
                    depDate : node.getAttribute("depDate"),
                    arrTime : node.getAttribute("arrTime"),
                    arrDate : node.getAttribute("arrDate"),
                    coordX: parseInt(node.getAttribute("x")),
                    coordY: parseInt(node.getAttribute("y"))
                });
            });
            callback(stops);
        });
    });
}

var exports = module.exports = {
    getStopsInArea: getStopsInArea,
    getNextDepartures: getNextDepartures,
    getJourneyDetails: getJourneyDetails
};