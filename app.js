//. app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    app = express();

var settings = require( './settings' );

var cloudantlib = require( '@cloudant/cloudant' );
var cloudant = null;
if( settings.db_url && settings.db_username && settings.db_password ){
  cloudant = cloudantlib( { url: settings.db_url, username: settings.db_username, password: settings.db_password } );
}

app.use( express.static( __dirname + '/public' ) );
app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.json() );

//. CORS(#1)
if( settings && settings.cors && settings.cors.length && settings.cors[0] ){
  var cors = require( 'cors' );
  var option = {
    origin: settings.cors,
    optionSuccessStatus: 200
  };
  app.use( cors( option ) );
}

app.get( '/', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  if( cloudant ){
    cloudant.db.list( function( err, dbs ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err } ) );
        res.end();
      }else{
        var result = { status: true, dbs: dbs };
        res.write( JSON.stringify( result ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.post( '/:db', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  if( cloudant ){
    cloudant.db.create( param_db, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, error: err } ) );
        res.end();
      }else{
        res.write( JSON.stringify( { status: true } ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.get( '/:db', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  if( cloudant ){
    var db = cloudant.db.use( param_db );
    db.list( { include_docs: true }, function( err, body ){
      if( err ){
       res.status( 400 );
       res.write( JSON.stringify( { status: false, message: err } ) );
       res.end();
      }else{
        var docs = [];
        body.rows.forEach( function( doc ){
          docs.push( doc.doc );
        });
  
        var result = { status: true, docs: docs };
        res.write( JSON.stringify( result ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.delete( '/:db', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  if( cloudant ){
    cloudant.db.destroy( param_db, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, error: err } ) );
        res.end();
      }else{
        res.write( JSON.stringify( { status: true } ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.post( '/:db/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  var param_id = req.params.id;
  if( cloudant ){
    var db = cloudant.db.use( param_db );
    if( !db ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
      res.end();
    }else{
      var doc = req.body;
      doc._id = param_id;
      var ts = ( new Date() ).getTime();
      doc.created = ts;
      doc.updated = ts;

      db.insert( doc, function( err, body ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err } ) );
          res.end();
        }else{
          res.write( JSON.stringify( { status: true, doc: body } ) );
          res.end();
        }
      });
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.get( '/:db/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  var param_id = req.params.id;
  if( cloudant ){
    var db = cloudant.db.use( param_db );
    if( !db ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
      res.end();
    }else{
      db.get( param_id, { include_docs: true }, function( err, body ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
          res.end();
        }else{
          res.write( JSON.stringify( { status: true, doc: body } ) );
          res.end();
        }
      });
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.put( '/:db/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  var param_id = req.params.id;
  if( cloudant ){
    var db = cloudant.db.use( param_db );
    if( !db ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
      res.end();
    }else{
      db.get( param_id, { include_docs: true }, function( err, data ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err } ) );
          res.end();
        }else{
          var doc = req.body;
          doc._id = param_id;
          doc._rev = data._rev;
          doc.created = data.created;
          doc.updated = ( new Date() ).getTime();

          db.insert( doc, function( err, body ){
            if( err ){
              res.status( 400 );
              res.write( JSON.stringify( { status: false, message: err } ) );
              res.end();
            }else{
              res.write( JSON.stringify( { status: true, doc: body, message: 'document is created.' } ) );
              res.end();
            }
          });
        }
      });
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});

app.delete( '/:db/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var param_db = req.params.db;
  var param_id = req.params.id;
  if( cloudant ){
    var db = cloudant.db.use( param_db );
    if( !db ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
      res.end();
    }else{
      db.get( param_id, { include_docs: true }, function( err, data ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err } ) );
          res.end();
        }else{
          db.destroy( param_id, data._rev, function( err, body ){
            if( err ){
              res.status( 400 );
              res.write( JSON.stringify( { status: false, message: err } ) );
              res.end();
            }else{
              res.write( JSON.stringify( { status: true } ) );
              res.end();
            }
          });
        }
      });
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'db not readly.' } ) );
    res.end();
  }
});



var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );
