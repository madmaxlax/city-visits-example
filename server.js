// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


//routes and route files
var dbSetup = require('./routes/db-setup.js');
var userRequests = require('./routes/user.js');
var stateRoute = require('./routes/state.js');
app.use('/resettables', dbSetup);
app.use('/user', userRequests);
app.use('/state', stateRoute);

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  console.log('home page');
  response.sendFile(__dirname + '/views/index.html');
});



//for debugging...
app.get('/quicktest/:name', function(request, response) {
  var name = escape(request.params.name);
  
  var query ='SELECT City.Name, State.Abbreviation FROM State INNER JOIN City ON State.state_id = City.StateID WHERE State.Abbreviation LIKE "'+name+'"';
  //var query ='SELECT * FROM State';
 
  console.log(query);
  global.db.all(query, function(err, rows) {
    if (err) {
      return console.error('Error with query ' + err.message);
      response.status(400).json({Error: err.message});
    }

    else{
      console.log('Got some rows ' + rows.length);
      response.json(rows);
    }
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

  
