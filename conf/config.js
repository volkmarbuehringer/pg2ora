"use strict";
const pino = require("pino")();
const expressPino = require("express-pino-logger")({
  logger: pino,
  extreme:true
});
module.exports = {
  log: pino,
  logger: expressPino
};
