angular.module("taggableCordova",["ngCordova","taggable"])
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
  		alert("saved");
		}
  	$scope.tags= $('#tags').tagging()[0];
  	$scope.upload();  	
    }])