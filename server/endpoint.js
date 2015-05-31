/**
 * Created by schwarz on 31/05/15.
 */

var express = require('express');
var router = express.Router();
var app = require("./app");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send("Unibus");
});

module.exports = router;
