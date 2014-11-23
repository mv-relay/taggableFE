angular.module("taggableCordova",["ngCordova","taggable"])
.controller("shotController",["$scope","$cordovaCamera",function($scope,$cordovaCamera)
    {  	
	
  	$scope.files=$scope.$root.files||[];
  	$scope.upload = function() 
  		{
  		$scope.$root.files=[];	
  	    var options = 
  	    	{
  	        quality : 75,
      	    destinationType : Camera.DestinationType.DATA_URL,
          	sourceType : Camera.PictureSourceType.CAMERA,
  	        allowEdit : true,
      	    encodingType: Camera.EncodingType.JPEG,
          	targetWidth: 400,
  	        targetHeight: 400,
      	    popoverOptions: CameraPopoverOptions,
  	        saveToPhotoAlbum: false,
  	        correctOrientation:true,
  	        cameraDirection:navigator.camera.Direction.FRONT
      		};

      	$cordovaCamera.getPicture(options).then(function(imageData) 
      		{
  		    var img =  "data:image/jpeg;base64," + imageData;
  		    $scope.files.push({url:img});  			
      		}, function(err) 
      		{
  	      	// An error occured. Show a message to the user
      		});
    	}
  	/*
  	
  	$scope.upload=function(files)
  		{		
  		$scope.$root.files=[];				
  		$images.adjust(files,400,200).progress(function(data)
  			{			
  			$scope.$root.files.push({url:data});
  			document.location.href="#shot"
  			})
  		}*/
  	$scope.save=function()
  		{
  		around.save($images.UUID(),$scope.files[0].url,$scope.name);
  		window.location.href="#/tabs/list"
  		}
  	$scope.upload();
      }])