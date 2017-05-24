"use strict";
//const util = require("util");
//const debuglog = util.debuglog("transport");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
/*eslint-disable */
const yields = require("express-yields");
/*eslint-enable */

const log = require("../conf/config.js").log;
const db = require("../conf/db.js");

const router = express.Router();

// middleware that is specific to this router

router.use(bodyParser.json());

router.post("/?", function* (req, res) {


  let resulter = {};
  let status = 200;
  let con;
  try {
    con = yield db.getPool().getConnection();
    yield con.execute(`alter session set nls_date_format='rrrr-mm-dd"T"hh24:mi:ss'`, []);
    yield con.execute(`alter session set nls_timestamp_format='rrrr-mm-dd"T"hh24:mi:ssxff'`, []);
    for (let i = 0; i < req.body.length; i++) {
      const {
        tablename,
        columnname,
        id,
        rower,
        typ
      } = req.body[i];
      let sql;
      const keys = Object.keys(rower);
      const val = _.values(rower).map((x, i) => {
        if (keys[i].endsWith("_date") && typeof x === "string" && x) {
          return x.substr(0, 19);
        } else {
          return x;
        }
      });
      if (typ === "U") {
        const bind = keys.map((x, i) => x + "=:" + (i + 1));
        sql = `update edv.${tablename} set  ${bind.join(",")} where ${columnname} = ${id}`;
      } else {
        const bind = keys.map((x, i) => ":" + (i + 1));
        sql = `insert into edv.${tablename}( ${keys.join(",")}) values (${bind.join(",")})`;
      }

      yield con.execute(sql, val);
    }
    yield con.commit();
    yield con.close();

    log.info(req.body);

  } catch (err) {
    if (con) {
      yield con.close();
    }
    let errobj = err;
    if (!("ec" in err)) {
      errobj = {
        "ec": "n-2",
        "um": "Fehler aufgetreten",
        "dm": err.message
      };
      status = 500;
    }

    log.error(errobj, "Fehler aufgetreten", req.body);
    res.status(status).json(errobj);

    return;
  }
  res.status(status).json(resulter);
});

module.exports = router;
