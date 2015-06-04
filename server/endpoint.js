/**
 *
 * This file implements the endpoint layer of the server.
 *
 * The server application is structures in three layers:
 *
 * +====================+
 * |      endpoint      |   Receives and decodes REST/JSON messages from the client
 * +====================+
 *           |
 * +--------------------+
 * |        app         |   Handled caching and business logic (if any is added) of the application
 * +--------------------+
 *           |
 * +--------------------+
 * |       service      |   Implements the communication with Rejseplanen
 * +--------------------+
 *
 * Created by schwarz on 31/05/15.
 */

var express = require('express');
var router = express.Router();
var app = require("./app");

router.get('/', function (req, res) {
    res.send("Unibus service");
});

router.get("/stopsInArea", function (req, res) {
    var coordX = req.query.coordX;
    var coordY = req.query.coordY;
    var distance = req.query.distance || 1000;
    app.getStopsInArea(coordX, coordY, distance, function (locations) {
        res.send(JSON.stringify(locations));
    });
});

router.get("/nextDepartures", function (req, res) {
    var departureBoardId = req.query.departureBoardId;
    app.getNextDepartures(departureBoardId, function (nextDepartures) {
        res.send(JSON.stringify(nextDepartures));
    });
});

module.exports = router;
