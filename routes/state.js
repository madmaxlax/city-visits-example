var express = require('express');
var router = express.Router();




//simple cities request right here

router.route('/:state/cities').get(function(request, response) {
  var state = request.params.state;
  if(state.length == 0){
    response.send(JSON.stringify({}));
  }
  var query = '';
  if(state.length == 2){
    query ='SELECT City.Name, State.Abbreviation as ST FROM City INNER JOIN State ON State.state_id = City.StateID WHERE State.Abbreviation LIKE ?';
  }
  else{
   query = 'SELECT City.Name, State.Abbreviation  FROM City INNER JOIN State ON State.state_id = City.StateID WHERE State.Name LIKE ?'; 
  }
  
  //console.log(query);
  global.db.all(query, [state], function(err, rows) {
    if (err) {
      return console.error('Error with query ' + err.message);
      response.status(400).json({Error: err.message});
    }

    else{
      if(rows.length > 0){
         response.json(rows.slice(0,global.MAX_RETURN_VALS)); 
        }
        else
        {
          response.status(400).json({Error: 'No cities found for ' + state + ' Note: cities have only been set up for Alabama, Alaska, Arizona ¯|_(ツ)_/¯' });
        }
    }
  });
});




module.exports = router;