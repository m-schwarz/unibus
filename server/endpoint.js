/**
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


module.exports = router;
