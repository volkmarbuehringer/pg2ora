
set schema 'edv';


drop table if exists logger;
create table logger(
seq       serial primary key,
 id         integer ,
typ     varchar(1),
 tablename character varying(60) ,
 columnname character varying(60) ,
 rower json
 );


 create or replace view pk_select as SELECT
   tc.table_name,c.column_name
  FROM
  information_schema.table_constraints
  tc JOIN
  information_schema.constraint_column_usage
 AS
  ccu USING
 (constraint_schema,
  constraint_name)
 JOIN
  information_schema.columns
 AS
  c ON
  c.table_schema
 = tc.constraint_schema
 AND tc.table_name
 = c.table_name
 AND ccu.column_name
 = c.column_name
 where
  constraint_type =
 'PRIMARY KEY'
  and tc.table_schema ='public'
  and tc.table_name not in ( 'logger')
 ;



insert into tr_auszahlungsdaten
  select
  nextval('tr_gewinnstatus_tgs_id_seq'),
tad_adsid   ,
tad_ankid    ,
tad_name    ,
tad_vorname  ,
tad_str      ,
tad_hnr      ,
tad_plz      ,
tad_ort      ,
tad_land     ,
tad_mail     ,
tad_tel      ,
tad_mobil    ,
tad_iban     ,
tad_lag      ,
tad_cr_date  ,
tad_cr_uid   ,
tad_upd_date ,
tad_upd_uid
from tr_auszahlungsdaten limit 10;





SELECT
'CREATE or replace FUNCTION '||table_name||'_trigger() returns trigger AS $$'||chr(10)||
'BEGIN'||chr(10)||
'if current_user<>''replikant'' then '||chr(10)||
' insert into logger (id,typ,tablename,columnname,rower)values(NEW.'||column_name||',substring(tg_op from 1 for 1),TG_TABLE_NAME,'''||column_name||''', row_to_json(NEW) ) ; '||chr(10)||
' PERFORM pg_notify(''watchers'' ,'''');'||chr(10)||
'  end if;'||chr(10)||
' RETURN new;  END;'||chr(10)||
'  $$ LANGUAGE plpgsql;'||chr(10)
FROM
pk_select
\gexec


SELECT
'drop trigger if exists t_'||table_name||' on '||table_name||chr(10)||';'||
'CREATE TRIGGER t_'||table_name||' AFTER INSERT or update ON '||table_name||chr(10)||
' FOR EACH ROW EXECUTE PROCEDURE '||table_name||'_trigger();'||chr(10)
 FROM
 pk_select
\gexec
