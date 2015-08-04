"use strict";

var express    = require('express'),
    _          = require('underscore'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser'), // for POST 
    app        = express(),
    connpool   = mysql.createPool({
      host     : process.env.HOST,
      user     : process.env.USER,
      password : process.env.PASS,
      database : "heroku_06f18f6ca1aa44d"
    }); 

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }));

///////////////////////////////////////////////////////////////////////////////
/// Utility functions
///////////////////////////////////////////////////////////////////////////////

var MYSQL_EMPTY_RESULT = "{}";

function _error(e) { console.error('x error:', e); }

function _warning(w) { console.error('! warning:', w); }

function _debug(m) { console.log('> debug: ', m); }

function _successMsg(msg) { return "{status: 1, response: "+msg+"}" }

function _errorMsg(msg) { return "{status: -1, response: "+msg+"}" }

///////////////////////////////////////////////////////////////////////////////
/// Error handlers
///////////////////////////////////////////////////////////////////////////////

function handleMysqlConnErr(err, res) {
  _error(err);
  res.status(503);
  res.type('json');
  res.send({text: '', error: err});
}

function handleMysqlQueryErr(err, res) {
  _error(err);
  res.status(500);
  res.type('json');
  res.send({text: '', error: err});
}

///////////////////////////////////////////////////////////////////////////////
/// Test methods
///////////////////////////////////////////////////////////////////////////////

app.get('/mysql/connected', function(req, res) { 
  connpool.getConnection(function(err, conn) {
    if (err) {
      handleMysqlConnErr(err, res);
    } else {
      res.status(200);
      res.type('json');
      res.send("{'connected':'true'}");
    }
  })
});

app.get('/json/test', function(req, res) {
  connpool.getConnection(function(err, conn) {
    if (err) {
      handleMysqlConnErr(err, res);
    } else {
      res.status(200);
      res.type('json');
      res.send("{'fname':'kendal', 'lname':'harland', 'age':'21'}");
    }
  })
});

app.put('/json/test', function(req, res) {
  connpool.getConnection(function(err, conn) {
    if (err) {
      handleMysqlConnErr(err, res);
    } else {
      res.status(200);
      res.type('json');
      res.send("{'fname':'kendal', 'lname':'harland', 'age':'21'}");
    }
  })
});

app.delete('/json/test', function(req, res) {
  connpool.getConnection(function(err, conn) {
    if (err) {
      handleMysqlConnErr(err, res);
    } else {
      res.status(200);
      res.type('json');
      res.send("{'fname':'kendal', 'lname':'harland', 'age':'21'}");
    }
  })
});

app.post('/json/test', function(req, res) {
  connpool.getConnection(function(err, conn) {
    if (err) {
      handleMysqlConnErr(err, res);
    } else {
      res.status(200);
      res.type('json');
      res.send(JSON.stringify(req.body));
    }
  })
});

///////////////////////////////////////////////////////////////////////////////
/// Server paths
///////////////////////////////////////////////////////////////////////////////

function handleRequest(query, args, req, res, callback) {
  console.log("ROUTE:", req._parsedUrl.path);
  connpool.getConnection(function(err, conn) {
    if (err) {
      handleMysqlConnErr(err, res);
    } else {
      conn.query(query, args, function(err, resp) {
        conn.release();
        if (err) {
          handleMysqlQueryErr(err, res);
        } else {
          res.status(200);
          res.type('json');
          callback(resp);
        }
      });
    }
  });
}

app.post('/user', function(req, res) {
  var query = "\
    INSERT INTO users(username, password, address, licenseNumber, \
    type, firstname, lastname, email, phoneNumber, birthdate) \
    VALUES(?,?,?,?,?,?,?,?,?,?);";
  var args = [
    req.body.username, req.body.password, req.body.address, 
    req.body.licenseNumber, req.body.userType, req.body.firstname, 
    req.body.lastname, req.body.email, req.body.phoneNumber, req.body.birthdate
  ];
  handleRequest(query, args, req, res, function(result) {
    res.send(JSON.stringify(result.affectedRows));
  });
});

app.post('/user/login', function(req, res) {
  var query = "SELECT * FROM users WHERE username=? AND password=?;";
  var args = [req.body.username, req.body.password];
  handleRequest(query, args, req, res, function(result) {
    if (result.length == 0) {
      res.send(MYSQL_EMPTY_RESULT);
    } else {
      res.send(resp[0]);
    }
  });
});

app.get('/user/reservations/:customerId', function(req, res) {
  var query = "SELECT * FROM reservations WHERE customerId = ?;";
  var args = [req.params.customerId];
  handleRequest(query, args, req, res, function(result) {
    // convert all properties to string
    for (var i=0; i<result.length; i++)
      for (var key in result[i])
        result[i][key] = result[i][key].toString();
    res.send(result);
  });
});

app.get('/location/vehicles/:locationId', function(req, res) {
  var query = "SELECT * FROM vehicles WHERE locationId=?;";
  var args = [req.params.locationId];
  handleRequest(query, args, req, res, function(result) {
    res.send(result);
  });
});

app.get('/location/reservations/class/count/:locationId/:startDate/:endDate', 
  function(req, res) {
    var query = "\
      SELECT DISTINCT vehicleClass as class, COUNT(vehicleClass) as count \
      FROM reservations WHERE locationId = ? \
        AND startDate <= ? AND endDate >= ? \
      GROUP BY vehicleClass;";
    var args = [parseInt(req.params.locationId), req.params.startDate,
      req.params.endDate];
    handleRequest(query, args, req, res, function(result) {
      res.send(result);
    });
});

app.get('/location/vehicles/class/count/:locationId', function(req, res) {
  var query = "\
    SELECT DISTINCT class, COUNT(class) as count FROM vehicles WHERE \
    locationId = ? GROUP BY class;";
  var args = [parseInt(req.params.locationId), req.params.startDate, 
    req.params.endDate];
  handleRequest(query, args, req, res, function(result) {
    res.send(result);
  });
});

app.get('/location/taxRate/:locationId', function (req, res) {
  var query = "SELECT rate FROM location WHERE locationId = ?";
  var args = [parseInt(req.params.locationId)];
  handleRequest(query, args, req, res, function(result) {
    res.send(result[0]);
  });
});

app.get('/vehicles', function (req, res) {
  var query = "SELECT * FROM vehicles";
  var args = [];
  handleRequest(query, args, req, res, function(result) {
    res.send(result);
  });
});

app.get('/vehicle/class/rates/:vehicleClass', function (req, res) {
  var query = "SELECT * FROM vehicleclass WHERE name = ?";
  var args = [decodeURI(req.params.vehicleClass)];
  handleRequest(query, args, req, res, function(result) {
    res.send(result[0]);
  });
});


app.get('/reservations', function (req, res) {
  var query = "SELECT * FROM reservations";
  handleRequest(query, null, req, res, function(result) {
    res.send(result);
  });
});

app.post('/reservation', function(req, res) {
  var fields = _.unzip(_.pairs(req.body));  
  var q = "?,?,?,?,?,?,?,?,?,?,?,?,?,?";
  var query = "\
    INSERT INTO reservations(startDate, waiver, totalCost, \
    accident, locationId, endDate, childSeat, roadside, ktag, customerId, \
    ccn, vehicleClass, gps, salesrepId) VALUES("+q+");";
  var args = fields[1];
  handleRequest(query, args, req, res, function(result) {
    res.send(JSON.stringify(result.affectedRows));
  });
});

app.get('/equipment', function(req, res) {
  var query = "SELECT * FROM equipment";
  handleRequest(query, null, req, res, function(result) {
    res.send(result);
  });
});

app.get('/equipment/counts', function(req, res) {
  var query = "SELECT `type`, `total`, `out` FROM equipment";
  handleRequest(query, null, req, res, function(result) {
    res.send(result);
  });
});

app.listen(app.get('port'));
console.log("server running on port:", app.get('port'));