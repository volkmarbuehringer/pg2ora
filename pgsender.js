"use strict";

const debug = require("debug")("pgsender");
const pg = require("pg");
const pino = require("pino")(require("conf/config.js"));
const rp = require("request-promise-native");

const client = new pg.Client();

client.on("notification", dequeuer );

client.on("error", errer );

function errer(err) {
   pino.error(err);
     client.end;
     process.exit(1)   ;
 }


const notizer= ()=>client.query("select pg_notify('watchers' ,'wiederhol')");

let laufender = 0;

const timeouter = (p) => new Promise((resolve) => setTimeout(resolve, p));


function dequeuer() {

  //const committer = () => _(client.query("commit"));

//  const dequeuer = () => {
//    const    timeouter = setTimeout(errer, 1000,new Error("Unterbreche Query Dequeue") );
laufender++;
debug("hier notify",laufender );


return      client.query("begin")
    .then(() => client.query({
      name: "logger",
      text: "DELETE FROm logger  where seq in ( select seq from logger order by seq limit 100 ) returning *",
      values: []
    }))
    .then((res)=>{
      if (res.rows.length > 0){
        const options={
          method: "POST",
          uri: "http://localhost:7777/service/daten",
          body:res.rows,
          json:true
        };
        pino.info(res.rows,"lauf %d",laufender);
        return rp(options)
        .then(()=>client.query("commit"))
        .then(notizer);
      } else {
      return client.query("commit");
      }


    })
    .catch((err)=>{
      pino.error(err);
      return client.query("rollback")
      .then(()=>timeouter(60000))
      .then(notizer);
    });


}



Promise.resolve()
  .then(() => client.connect())
  .then(()=>client.query("LISTEN watchers"))
  .then(notizer)
  .then((x) => pino.info(x.rows,"nach init"))
  .catch(errer);
