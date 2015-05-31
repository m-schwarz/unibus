var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./server/endpoint');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

app.use('/service', routes);

// If no other handlers have finished replying to the request, use this handler to create a 404 and forward to error handler below
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Generic error handler. This will write the status code and error message (but not the stack trace!) to the HTTP response
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.status + " " + err.message);
});


module.exports = app;
