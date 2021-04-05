//. settings.js
var cloudantlib = require( '@cloudant/cloudant' );

var db_apikey = '';
var db_url = '';
var db_username = '';
var db_password = '';

//. settings for CORS
exports.cors = [ '' ];

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.cloudantNoSQLDB ){
    db_apikey = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.apikey;
    db_url = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.url;
    db_username = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username;
    db_password = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password;
  }
}

if( process.env.db_username ){
  db_username = process.env.db_username;
}
if( process.env.db_password ){
  db_password = process.env.db_password;
}
if( process.env.db_apikey ){
  db_apikey = process.env.db_apikey;
}
if( process.env.db_url ){
  db_url = process.env.db_url;
}
if( process.env.cors ){
  try{
    exports.cors = JSON.parse( process.env.cors );
  }catch( e ){
  }
}

exports.cloudant = null;
if( db_url && db_username && db_password ){
  exports.cloudant = cloudantlib( { url: db_url, username: db_username, password: db_password } );
}