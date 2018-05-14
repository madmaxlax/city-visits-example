var express = require('express');
var router = express.Router();
const util = require('util');


//bonus endpoint
//just grab all users
router.route('/') 
    .all(function (request, response) {
        console.log('all users request');
        var query = 'SELECT * FROM Users';
        global.db.all(query, function(err, rows) {
          if (err) {
            console.error('Error with query ' + err.message);
            response.status(400).json({Error: err.message});
          }
          else{
            if(rows.length > 0){
               response.json(rows.slice(0,global.MAX_RETURN_VALS)); 
              }
              else
              {
                response.status(400).json({Error: 'No users found'});
              }
          }
        });
    });


//getting and posting user visits
router.route('/:userid/visits')
  .get(function(request, response){
    var userID = request.params.userid;
    var query ='SELECT Users.FirstName FirstName, Users.LastName LastName, City.name CityName, State.Name StateName, State.Abbreviation StateAbbreviation, City.Latitude Latitude, City.Longitude Longitude, Visits.DateTimeVisited VisitTime, Visits.visit_id visit_id '+
    'FROM City INNER JOIN Visits ON Visits.city_id = City.city_id '+
        'INNER JOIN Users ON Visits.user_id = Users.user_id '+
        'INNER JOIN State ON State.state_id = City.StateID WHERE Users.user_id = ?';
    global.db.all(query, [userID], function(err, rows) {
      if (err) {
            console.error('Error with query ' + err.message);
            response.status(400).json({Error: err.message});
          }
          else{
            if(rows.length > 0){
               response.json(rows.slice(0,global.MAX_RETURN_VALS)); 
              }
              else //no visits found, check if user exists
              {
                checkUserExists(userID, function(user){
                  if(user === false){
                    response.status(400).json({Error: "user "+userID+" not found"});
                  }
                  else
                  {
                    //user exists, but no visits
                    response.json([]); 
                  }
                });
              }
          }
    });
  })
  .post(function(request, response){
    //new visit posting
    console.log(util.inspect(request.body, false, null));
    
    //first check that the correct body was sent with city/state of visit
    if(request.body.city != null && request.body.state != null){
      
      var userID = request.params.userid;
      checkUserExists(userID, function(user){
        if(user === false){
          response.status(400).json({Error: "user "+userID+" not found"});
        }
        else
        {
          //user exists
          //now check that city is valid
          //if there's time, also check if state is valid...for now assume it's okay if the city exists
          var query = 'SELECT City.Name CityName, State.Name State, State.Abbreviation Abbreviation, City.city_id FROM City INNER JOIN State ON State.state_id = City.StateID WHERE CityName LIKE ?';
          global.db.get(query, [request.body.city], function(err, row) {
            if (err) {
              console.error('Error with query ' + err.message);
              response.status(400).json({Error: err.message});
            }
            else{
              if(row != null){
                //console.log("City found "+ util.inspect(row, false, null));
                //check if the state is correct
                var givenState = request.body.state;
                if(row.State !== givenState && row.Abbreviation !== givenState)
                {
                  //user gave a valid city name but the wrong state!
                  response.status(400).json({Error: "City "+request.body.city+" does not belong to " + givenState + ". It should be "+row.State +" please correct it and try request again"});
                }
                else{
                  //now we can actually create the visit!
                  var cityID = row.city_id;
                  //console.log(util.inspect(row, false, null));
                  var query = 'INSERT INTO Visits (city_id, user_id, DateTimeVisited, DateAdded, DateTimeAdded, LastUpdated)' +
                      'VALUES (?, ?, datetime("now"), datetime("now"), datetime("now"), datetime("now")) ';
                  //console.log(query,cityID);
                  global.db.run(query,[cityID,userID], function(err) {
                    if (err) {
                      console.error('Error inserting visit ' +err.message);
                      response.status(400).json({Error: err.message});
                    }
                    else{
                      console.log(`Inserted visit! ${cityID} ${userID} Row(s) updated: ${this.changes}`);

                      //201 status means "Created"
                      response.status(201).json({Result:"Succesfully created new visit"});
                    }
                   });
                }
              }
                else
                {
                  console.log("City "+request.body.city+" not found");
                  response.status(400).json({Error: "City "+request.body.city+" not found"});
                }
              }
          });
          
        }
      });  
    }
    else{
   //improper body sent
      response.status(400).json({Error: "your request "+util.inspect(request.body, false, null)+" was not set up properly, see example of what's required. (note: it needs to be POST'ed as x-www-form-urlencoded data)", RequiredBody:{
        "city": "ExampleCity",
        "state": "ST"
      }});
  }
});

//getting user visits by state
router.route('/:userid/visits/states')
  .get(function(request, response){
  //can just leverage the query we have already for getting all city visits, and group by states
    var userID = request.params.userid;
    var query ='SELECT State.Name StateName, State.Abbreviation StateAbbreviation, Visits.DateTimeVisited VisitTime '+
    'FROM City INNER JOIN Visits ON Visits.city_id = City.city_id '+
        'INNER JOIN Users ON Visits.user_id = Users.user_id '+
        'INNER JOIN State ON State.state_id = City.StateID '+
        'WHERE Users.user_id = ? GROUP BY State.Name ';
    global.db.all(query, [userID], function(err, rows) {
      if (err) {
            console.error('Error with query ' + err.message);
            response.status(400).json({Error: err.message});
          }
          else{
            if(rows.length > 0){
               response.json(rows.slice(0,global.MAX_RETURN_VALS)); 
              }
              else //no visits found, check if user exists
              {
                checkUserExists(userID, function(user){
                  if(user === false){
                    response.status(400).json({Error: "user "+userID+" not found"});
                  }
                  else
                  {
                    //user exists, but no visits
                    response.json([]); 
                  }
                });
              }
          }
    });

  });

//deleting a user visit
router.route('/:userid/visit/:visitid')
  .delete(function(request, response){
    var userID = request.params.userid;
    var visitID = request.params.visitid;
    checkUserExists(userID, function(user){
      if(user === false){
        response.status(400).json({Error: "user "+userID+" not found, can't delete any visits"});
      }
      else
      {
        //user exists, go ahead and try delete
        var query = 'DELETE FROM Visits WHERE user_id = ? AND visit_id = ? ';
        global.db.run(query,[userID, visitID], function(err) {
          if (err) {
            console.error('Error deleting visit ' +err.message);
            response.status(400).json({Error: err.message});
          }
          else{
            if(this.changes === 0){
              response.status(400).json({Error: "Attempted to delete visit# "+visitID + " for user# " +userID+", but no matching visit was found"});
            }
            else if (this.changes === 1){
              console.log(`Deleted! Row(s) updated: ${this.changes}`);
              //204 status means success but no content (used for DELETEs)
              response.status(204).json({Result:"Succesfully created new visit"});
            }
          }
       });
      }
    });

});

function checkUserExists(userID, callBack){
  var query ='SELECT * FROM Users WHERE user_id = ?';
  var returnVal;
  global.db.get(query, [userID], function(err, row) {
    if (err) {
      console.error('Error with query ' + err.message);
      callBack(false);
    }
    else{
      if(row != null){
        //console.log("user found");
        callBack(row);
      }
      else
      {
        console.log("user "+userID+" not found");
        callBack(false);
      }
    }
  });
}

module.exports = router;