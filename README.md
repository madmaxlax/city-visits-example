City Visits API Assignment
=================

Quick little app I made as an assignment, was kind of fun. 
Making an API backend with a little angularJS front end
uses NodeJS, Express, SQLite, AngularJS
Hosted by Glitch

### [https://github.com/RedVentures22/rest-api-project-madmaxlax](https://github.com/RedVentures22/rest-api-project-madmaxlax)

**Extra Endpoints**

 - `ANY /user`
   - gets all users 
 - `ANY /resettables`
   - resets the databases for Users, Cities, States and empties the visits table


------

# RV Coding Challenge

A new client wants to build a small API to allow users to pin areas they've visited and potentially share them with other users. The client included a set of sample data in `User.csv`, `City.csv`, and `State.csv`. Please implement a few basic operations on the data provided, including the following.

 - Listing the cities in a given state
 - Registering a visit to a particular city by a user
 - Removing a visit to a city
 - Listing cities visited by a user
 - Listing states visited by a user.  

You may use whatever language or tools you wish to complete the exercise.  Keep in mind that you may be asked to extend your solution in an on-site interview.


**Required endpoints**

1. List all cities in a state

	`GET /state/{state}/cities`
 
2. Allow to create rows of data to indicate they have visited a particular city.

	`POST /user/{user}/visits`

	```
	{
		"city": "Chicago",
		"state": "IL"
	}
	```
	
3. Allow a user to remove an improperly pinned visit.

	`DEL /user/{user}/visit/{visit}`

4. Return a list of cities the user has visited

	`GET /user/{user}/visits`
	
5. Return a list of states the user has visited

	`GET /user/{user}/visits/states`


## Things To Consider

- How should you deal with invalid or improperly formed requests?
- How should you handle requests that result in large data sets?


## Deliverables

- The source code for your solution.
- The database schema you use to implement your solution.
- Any additional documentation you feel is necessary to explain how your application works, or describe your thought process and design decisions.


## Bonus Points

- Handle authentication of users prior to allowing changes to their visits
- Make use of the lat/long data for cities in a creative way that provides additional functionality for the client


