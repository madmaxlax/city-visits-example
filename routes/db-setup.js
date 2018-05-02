// init sqlite db
var fs = require('fs');
const util = require('util');
var parse = require('csv-parse');
var dbFile = './.data/sqlite.db';
var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var router = express.Router();

function dbExists(){return fs.existsSync(dbFile)}
if(dbExists()){
    //console.log('db file exists at the start');
    setDBFile();
}
else{
  setDBFileAndCreate();
}

function setDBFile(){
  global.db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
      console.log('Connected to the local sqlite database.');
      //setUpTables();
    }
  });
}
function setDBFileAndCreate(){
  global.db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error("Error initializing db file "+err.message);
    }
    else{
      console.log('Connected to the local sqlite database.');
      setUpTables();
    }
  });
}

//clearDB();
//setDBFile();
//setUpTables(); 

function clearDB(){
  if(dbExists()){
   fs.unlink(dbFile, (err) => {
      if (err) throw err;
      console.log(dbFile + ' was deleted');
      setDBFileAndCreate();
    }); 
  }
}
function setUpTables(){
// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
global.db.serialize(function(){
  if (dbExists()) {
    console.log('DB exists before tables');
  }
    global.db.run('CREATE TABLE State ('+
                  'state_id integer PRIMARY KEY,'+
                  'Name text NOT NULL,'+
                  'Abbreviation text NOT NULL,'+
                  'DateAdded text NOT NULL,'+
                  'DateTimeAdded text NOT NULL,'+
                  'LastUpdated text NOT NULL'+
                 ')', function(err) {
          if (err) {
            return console.error('Error creating table State'  + err.message);
          }
      
          else{
            console.log('New table State created!');
            // console.log(`Row(s) updated: ${this.changes}`);
          }
    });
    global.db.run('CREATE TABLE Users ('+
                  'user_id integer PRIMARY KEY,'+
                  'FirstName text NOT NULL,'+
                  'LastName text NOT NULL,'+
                  'DateAdded text NOT NULL,'+
                  'DateTimeAdded text NOT NULL,'+
                  'LastUpdated text NOT NULL'+
                 ')', function(err) {
          if (err) {
            return console.error('Error creating table Users ' + err.message);
          }
      
          else{
            console.log('New table Users created!');
          }
    });
    
    global.db.run('CREATE TABLE  City ('+
                  'city_id integer PRIMARY KEY,'+
                  'Name text NOT NULL,'+
                  'StateID integer,'+
                  'Status text NOT NULL,'+
                  'Latitude real NOT NULL,'+
                  'Longitude real NOT NULL,'+
                  'DateAdded text NOT NULL,'+
                  'DateTimeAdded text NOT NULL,'+
                  'LastUpdated text NOT NULL,'+
                  'FOREIGN KEY (StateID) REFERENCES State (state_id) ON DELETE CASCADE ON UPDATE NO ACTION'+
                 ')', function(err) {
          if (err) {
            return console.error('Error creating table City ' + err.message);
          }
      
          else{
            console.log('New table City created!');
          }
    });
    
    global.db.run('CREATE TABLE Visits ('+
                  'visit_id integer PRIMARY KEY,'+
                  'city_id integer,'+
                  'user_id integer,'+
                  'DateTimeVisited text NOT NULL,'+
                  'DateAdded text NOT NULL,'+
                  'DateTimeAdded text NOT NULL,'+
                  'LastUpdated text NOT NULL,'+
                  'FOREIGN KEY (city_id) REFERENCES City (city_id) ON DELETE CASCADE ON UPDATE NO ACTION,'+
                  'FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE ON UPDATE NO ACTION'+
                 ')', function(err) {
          if (err) {
            return console.error('Error creating table Visits ' + err.message);
          }
      
          else{
            console.log('New table Visits created!');
          }
    });
    insertStarterDataFromCSV();
  //   }
  // else {
    // console.log('Database ready to go!');
    // global.db.each('SELECT * FROM State', function(err, row) {
    //    if (err) {
    //     console.error('select test didnt work '+err.message);
    //   }
    //   if ( row ) {
    //     console.log('record:', row);
    //   }
    // });
  // }
});
}
    
    // insert test 
    
//     console.log('Trying Insert');
//     global.db.run('INSERT INTO State (Name, Abbreviation, DateAdded, DateTimeAdded, LastUpdated)'+
//                   'VALUES ("Alabama", "AL", "2015-03-01", "2015-03-01", "2015-03-01"),'+
//                   '("Alaska", "AK", "2015-03-01", "2015-03-01", "2015-03-01")', function(err) {
//           if (err) {
//             return console.error(err.message);
//           }
//       else{
        
//         console.log('Inserted! trying select');
//           console.log(`Row(s) updated: ${this.changes}`);
//             }
//        });
//     global.db.each('SELECT * from State', function(err, row) {
//        if (err) {
//         console.error(err.message);
//       }
//       if ( row ) {
//         console.log('record:', row);
//       }
//     });
function insertStarterDataFromCSV(){
    //Inserting Users
    console.log('reading Users file');
    
    fs.createReadStream('./data/Users.csv').pipe(parse({delimiter: ','}, function (err, data) {
      if(err){
        console.log('Error with reading file ' +err);
      }
      else{
        console.log(util.inspect(data, false, null));
        var usersString = '';
        for(var i = 1; i< data.length; i++){
          if(i>1){
            usersString += ',';
          }
          usersString += '("'+data[i][0]+'",'+'"'+data[i][1]+'",'+'"'+data[i][2]+'",'+'"'+data[i][3]+'", datetime("now"))';
        }
        //console.log(usersString);
        global.db.serialize(function(){
            global.db.run('INSERT INTO Users (FirstName, LastName, DateAdded, DateTimeAdded, LastUpdated)'+
                  'VALUES '+usersString, function(err) {
                if (err) {
                  return console.error('Error inserting users ' +err.message);
                }
            else{

              console.log('Inserted!');
                console.log(`Row(s) updated: ${this.changes}`);
                  }
             });
        });
      }
    }));
  
  //Inserting City
    console.log('reading City file');
    
    fs.createReadStream('./data/City.csv').pipe(parse({delimiter: ','}, function (err, data) {
      if(err){
        console.log('Error with reading file ' +err);
      }
      else{
        //console.log(util.inspect(data, false, null));
        var CityString = '';
        for(var i = 1; i< data.length; i++){
          if(i>1){
            CityString += ',';
          }
          CityString += '("'+data[i][0]+'",'+'"'+data[i][1]+'",'+'"'+data[i][2]+'",'+'"'+data[i][3]+'",'+'"'+data[i][4]+'",'+'"'+data[i][5]+'",'+'"'+data[i][6]+'",'+
		  ' datetime("now"))';
        }
        //console.log(CityString);
        global.db.serialize(function(){
            global.db.run('INSERT INTO City (Name, StateID, Status, Latitude, Longitude, DateAdded, DateTimeAdded, LastUpdated)'+
                  'VALUES '+CityString, function(err) {
                if (err) {
                  return console.error('Error inserting City ' +err.message);
                }
            else{

              console.log('Inserted!');
                console.log(`Row(s) updated: ${this.changes}`);
                  }
             });
        });
      }
    }));
  
  //Inserting State
    console.log('reading State file');
    
    fs.createReadStream('./data/State.csv').pipe(parse({delimiter: ','}, function (err, data) {
      if(err){
        console.log('Error with reading file ' +err);
      }
      else{
        //console.log(util.inspect(data, false, null));
        var StateString = '';
        for(var i = 1; i< data.length; i++){
          if(i>1){
            StateString += ',';
          }
          StateString += '("'+data[i][0]+'",'+'"'+data[i][1]+'",'+'"'+data[i][2]+'",'+'"'+data[i][3]+'",'+
		  ' datetime("now"))';
        }
        //console.log(StateString);
        global.db.serialize(function(){
            global.db.run('INSERT INTO State (Name, Abbreviation, DateAdded, DateTimeAdded, LastUpdated)'+
                  'VALUES '+StateString, function(err) {
                if (err) {
                  return console.error('Error inserting State ' +err.message);
                }
            else{

              console.log('Inserted!');
                console.log(`Row(s) updated: ${this.changes}`);
                  }
             });
        });
      }
    }));
}
    

router.route('/')
    .all(function (request, response) {
        console.log('delete request'+request);
        clearDB();
        response.json("table reset and setup was successful");
    });

module.exports = router;