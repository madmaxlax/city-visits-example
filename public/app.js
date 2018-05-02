/// <reference path="C:\Apps\Dropbox\Dev\typings\angularjs\angular.d.ts" />

//quick enhancement to add the length to objects, not just arrays
// Object.prototype._length = function () {
//   return Object.keys(this).length;
// };
function deleteVisit(userID, visitID){
  if(confirm("Are you sure you want to delete this visit?"))
    {
      angular.injector(["ng"]).get("$http").delete('./user/'+userID+'/visit/'+visitID).
        then(function(data, status, headers, config) {
          console.log(data);
          alert('Visit was deleted, refreshing page...');
          location.reload();
        }).catch(function(data, status, headers, config) {
        console.log("Error deleting visit " + status+ ' ' +data);
      });
    }
}

(function () {
    var app = angular.module('myapp', ['ngResource', 'ngMaterial']);
    angular.module('myapp').config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
          //choose colors at https://material.angularjs.org/1.1.4/demo/colors
          .primaryPalette('light-green')
          .accentPalette('deep-orange');
      });
    angular.module('myapp').controller('appController', ['$scope', '$http', '$window', '$resource', '$filter', '$mdSidenav', '$mdDialog', '$mdToast', function ($scope, $http, $window, $resource, $filter, $mdSidenav, $mdDialog, $mdToast) 
    {
        $scope.toggleLeft = function () {
            $mdSidenav('left').toggle();
        };
      
      //$scope.allStates = {'AL':[],'AK':[],'AZ':[],'AR':[],'CA':[],'CO':[],'CT':[],'DE':[],'FL':[],'GA':[],'HI':[],'ID':[],'IL':[],'IN':[],'IA':[],'KS':[],'KY':[],'LA':[],'ME':[],'MD':[],'MA':[],'MI':[],'MN':[],'MS':[],'MO':[],'MT':[],'NE':[],'NV':[],'NH':[],'NJ':[],'NM':[],'NY':[],'NC':[],'ND':[],'OH':[],'OK':[],'OR':[],'PA':[],'RI':[],'SC':[],'SD':[],'TN':[],'TX':[],'UT':[],'VT':[],'VA':[],'WA':[],'WV':[],'WI':[],'WY':[],'DC':[]};
      $scope.allStates = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']
      
      $scope.stateSelected = function(){
        $http.get('./state/'+$scope.currentSelectedState+'/cities').
        then(function(data, status, headers, config) {
          //console.log(data);
          $scope.currentCities = data.data;
          if($scope.currentCities.length === 0)
          {
             alert('no cities available for '+$scope.currentSelectedState+ ' ...only 3 states are set up right now'); 
          }

        }).catch(function(data, status, headers, config) {
        console.log("Error getting cities ", status, data);
          $scope.currentCities =  [];
      });
      }
      
      //get users
      $http.get('./user/').
        then(function(data, status, headers, config) {
          //console.log(data);
          $scope.allUsers = data.data;

        }).catch(function(data, status, headers, config) {
        console.log("Error getting users " + status);
      });
      
      $scope.locationMarkers = [];
      
      $scope.newUserSelected = function(){
        if($scope.locationMarkers != null && $scope.locationMarkers.length>0){
          $scope.locationMarkers.forEach(function(marker){
            marker.setMap(null);
          });
          $scope.locationMarkers = [];
        }
        //get the number of states visited
        $http.get('./user/'+$scope.currentSelectedUser.user_id+'/visits/states').
          then(function(data, status, headers, config) {
            console.log(data);
            $scope.currentSelectedUser.StatesVisited = data.data;
            

          }).catch(function(data, status, headers, config) {
          console.log("Error getting states visited " + status);
        });
        
        //get the actual visits
        $http.get('./user/'+$scope.currentSelectedUser.user_id+'/visits').
          then(function(data, status, headers, config) {
            console.log(data);
            $scope.currentSelectedUser.Visits = data.data;
            $scope.currentSelectedUser.Visits.forEach(function (visit) {
                //set up the marker
                var marker = new google.maps.Marker({
                    position: { lat: visit.Latitude, lng: visit.Longitude },
                    map: $scope.googleMap,
                    title: visit.CityName+ ' visit'
                });
                $scope.locationMarkers.push(marker);
                //set up the info window 
                var infoWindow = new google.maps.InfoWindow({
                    content: '<h4>' + visit.CityName+ ' visit' + '</h4>' +
                    visit.FirstName + ' visited ' + visit.CityName+ ' on '+ visit.VisitTime+
                    '<br /> <button onclick="deleteVisit('+$scope.currentSelectedUser.user_id+','+visit.visit_id+')" >Delete This Visit</button>'
                });

                //make the info window open when clicked 
                //how to close?
                marker.addListener('click', function () {
                    if ($scope.googleMap.prev_infoWindow) {
                        $scope.googleMap.prev_infoWindow.close();
                    }

                    $scope.googleMap.prev_infoWindow = infoWindow;
                    infoWindow.open($scope.googleMap.map, marker);
                });
            });
          }).catch(function(data, status, headers, config) {
          console.log("Error getting visits " + status);
        });
      };
      
      $scope.createVisit = function(userid,city,ST){
        $http({
            method: 'POST',
            url: './user/'+userid+'/visits',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {city:city,state:ST}
        }).
        //$http.post(, {city:city,state:ST}).
        then(function(data, status, headers, config) {
          //console.log(data);
          $scope.newUserSelected();

        }).catch(function(data, status, headers, config) {
        console.log("Error creating visit ", data);
      });
      };
      
      $scope.googleMap = {};
      var googleWatcher;
      $scope.initiateGoogleMap = function(){
        $scope.googleMap = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 49, lng: -115 },//[52.3665982, 4.8851904]
            zoom: 3
        });
      };
      if (typeof (google) != 'undefined' && google != null) {
          //optionally automatically re-center map based on IP Address
          //pass true
          $scope.initiateGoogleMap();
        } else {
      console.log("google not ready yet");
          //set up a watch
          googleWatcher = $scope.$watch(function () {
              return $window.google;
          }, function (newVal, oldVal) {
              if (typeof (google) != 'undefined' && google != null) {
                  // FB API loaded, make calls
                  console.log("google is ready");
                  //set up map
                  //optionally automatically re-center map based on IP Address
                  //pass true
                  $scope.initiateGoogleMap();

                  //close the watcher
                  googleWatcher();
              }
          });
        }
    }]);
})();