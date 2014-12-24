angular.module("taggableCordova",["taggable","ngCordova"])
.config(["$provide",function($provide)
        {		
     	$provide.decorator("$beacons",["$delegate","$beaconsCordova",function($delegate, $beaconsCordova)	{
     		return $beaconsCordova.delegate($delegate);
     		}]);
     	}])
.service("$beaconsCordova",function()
	{	
	this.delegate = function($delegate)
		{
		$delegate.init=function()
			{						
			var delegate = new cordova.plugins.locationManager.Delegate();				
				delegate.didRangeBeaconsInRegion 	= function(param){$delegate.delegate.didRangeBeaconsInRegion(param);};
				delegate.didDetermineStateForRegion = function(param){$delegate.delegate.didDetermineStateForRegion(param);};
				delegate.didStartMonitoringForRegion= function(param){}
			
			cordova.plugins.locationManager.setDelegate(delegate);
			cordova.plugins.locationManager.requestWhenInUseAuthorization();
			
			$delegate.init=null;
			}
		$delegate.add=function(obj)
			{	
			if($delegate.init!=null) $delegate.init();
			this.list.push(obj);
			var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(obj.name, obj.uuid,obj.major,obj.minor);
						
			//if(obj.near!=null || obj.far!=null || obj.immediate!=null)
			
			cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion).fail(console.error).done();			
			if(obj.enter!=null || obj.exit!=null) cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion).fail(console.error).done();			
			}
		return $delegate;
		}
	})
.factory("gps",["$cordovaGeolocation","$q",function($cordovaGeolocation,$q)
    {
	var gps = 
		{
		latitude:null,
		longitude:null,
		follow:function()
			{
			return refresh();			    
			},
		refresh:function()
			{
			var deferred = $q.defer();
			return $cordovaGeolocation.getCurrentPosition().then(function(result)
				{
				var lat  = result.coords.latitude;
			    var long = result.coords.longitude;
			    gps.latitude=lat;
			    gps.longitude=long;
			    
				deferred.resolve(result);	
				});
			return deferred.promise;
			}
		}
	return gps;
    }])
.controller("shotController",["$scope","$cordovaCamera","uuid","items","$ionicLoading","$http",function($scope,$cordovaCamera,uuid,items,$ionicLoading,$http)
    {  	
	$scope.name="";	
  	$scope.files=[];
  	
  	$scope.upload =	function() 
  		{
  		$scope.files	=	[];	
  	    var options 	= 
  	    	{
  	        quality 			: 75,
      	    destinationType 	: Camera.DestinationType.DATA_URL,
          	sourceType 			: Camera.PictureSourceType.CAMERA,
  	        allowEdit 			: true,
      	    encodingType		: Camera.EncodingType.JPEG,
          	targetWidth			: 400,
  	        targetHeight		: 400,
      	    popoverOptions		: CameraPopoverOptions,
  	        saveToPhotoAlbum	: false,
  	        correctOrientation	: true,
  	        cameraDirection		: navigator.camera.Direction.BACK
      		};
  	    
  	    $ionicLoading.show();
      	$cordovaCamera.getPicture(options).then(function(imageData) 
      		{
  		    var img =  "data:image/jpeg;base64," + imageData;
  		    $ionicLoading.hide();
  		    $scope.files.push({url:img});  			
      		}, function(err) 
      		{
      		$ionicLoading.hide();
      		});
    	}
 
  	$scope.save	=	function()
		{	
  		var act = this;
  		$ionicLoading.show();  		
  		var obj = 
  			{
  			uuid		:	uuid.random(),
  			img			:	act.files[0].url,
  			name		:	act.name,
  			tags 		:	act.tags.tagging("getTags"),
  			description	:	act.description
  			}
		items.save(obj).success(function()
			{
			$ionicLoading.hide(); 
			window.location.href="#/tab/home"
			}).error(function(e)
			{
			$ionicLoading.hide();
			alert(JSON.stringify(e));
			});  		
		}
  	$scope.tags= $('#tags').tagging()[0];
  	$scope.upload();  	
    }])
.service("$notify",["$ionicLoading","$cordovaLocalNotification",function($ionicLoading,$cordovaLocalNotification)
		{
		this.show=function(title,msg,json)
			{
			$ionicLoading.show({
		        template: title,
		        noBackdrop: true,
		        duration: 1500
		    	});
			$cordovaLocalNotification.add({
			      id: 'some_notification_id',
			      title:title,
			      message:msg,
			      json:json
			    }).then(function () {
			      console.log('callback for adding background notification');
			    });
			}
		}])
 