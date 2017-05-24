"use strict";
const express = require("express");
const logger = require("./conf/config.js").logger;
const pino = require("pino")();
//const webtokens = require("./conf/webtokens.js");
//const db = require("./conf/db.js");

const app = express();

// auch bei nur einem Byte Unterschied einen neuen etag generieren.
app.set("etag", "strong");
app.enable("trust proxy");
app.disable("x-powered-by");
// Nur wenn AJAX-Anfragen von einem anderen Server gemacht werden
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Token");
  next();
});
app.use(logger);


app.use("/service/daten", require("./routes/pg2oraget.js"));

const listener = app.listen(process.env.PORT || 7777, function () {
  pino.info(process.argv[1] + " listening on port %d", listener.address().port);
});
