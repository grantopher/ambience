"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
var port = 3000;
app.get('/', function (request, response) {
    response.send('ITS WORKING, ITS WORKING');
});
var server = app.listen(port, function () {
    console.log("  App is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
