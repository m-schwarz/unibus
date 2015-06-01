/**
 * Created by schwarz on 31/05/15.
 */
var http = require('http');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var baseHost = "xmlopen.rejseplanen.dk";
var basePath = "/bin/rest.exe/";

function getStopsInArea(coordX, coordY, maxDistance, callback) {
    http.get({
            host: baseHost,
            path: basePath + "stopsNearby?coordX=" + coordX + "&coordY=" + coordY + "&maxRadius=" + maxDistance + "&maxNumber=30"
        }, function (response) {
            //Collectes the full response body in a single string
            var receivedData = "";

            response.on("data", function (chunk) {
                receivedData += chunk;
            });

            response.on("end", function () {
                var doc = new dom().parseFromString(receivedData);
                var nodes = xpath.select("//LocationList/StopLocation", doc);
                var locations = [];
                nodes.forEach(function (node) {
                    locations.push({
                        id: node.getAttribute("id"),
                        name: node.getAttribute("name"),
                        coordX: node.getAttribute("x"),
                        coordY: node.getAttribute("y"),
                        distance: node.getAttribute("distance")
                    });
                });
                callback(locations);
            });

        }
    );
}

var exports = module.exports = {
    getStopsInArea: getStopsInArea
};