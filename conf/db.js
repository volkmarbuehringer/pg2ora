"use strict";

const oracledb = require("oracledb");
const simpler=require("simple-oracledb");
simpler.extend(oracledb);
const pino = require("pino")();



//oracledb.queueRequests=false;
oracledb.stmtCacheSize=50;

oracledb.createPool({
  connectString: process.env.PU_ORA_CONNECT_STRING,
  "user": process.env.PU_ORA_USER,
  "password": process.env.PU_ORA_PASSWORD,
//  externalAuth: true,
  poolIncrement: 4,
  poolMax: 30,
  poolMin: 4,
  // nicht benutzte Connection wird geschlossen nach Sekunde
  poolTimeout: 600,
  // Timeout max auf neue Connection warten in Millisekunden
  queueTimeout: 10000

})
.then( ()=>oracledb.getPool())
.then( pool=>pool.run(con=>con.query("select * from dual")))
.then( ()=> pino.info("db ist ok"))
.catch( (err)=>{
  pino.error(err,"Fehler bei db");
});

module.exports = oracledb;
