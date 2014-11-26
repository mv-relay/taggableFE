var style=[{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

angular.module("taggable",["ngResource","uiGmapgoogle-maps"])
.constant("url","95.110.224.34:8080")
.factory("uuid",function()
	{
	var UUID = function()
		{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
			{
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
			});
		}
	return {random:UUID}
	})
.factory("gps",["$q",function($q)
    {
	var gps = 
		{
		latitude:null,
		longitude:null,
		follow:function()
			{
			var deferred = $q.defer();
			act = this;
			this.refresh(function()
				{				
				deferred.notify({latitude:act.latitude,longitude:act.longitude})
				act.follow();
				})
			return deferred.promise;
			},
		refresh:function(callback)
			{
			var act = this;
			if (navigator.geolocation) 
				navigator.geolocation.getCurrentPosition(function(position)
					{        										
					try{clearTimeout(time);}catch(e){}						
					act.latitude=position.coords.latitude;
					act.longitude=position.coords.longitude;
					if(callback) callback();
					});
			}
		}
	return gps;
    }])
.factory("user",function()
	{
	return {
		mail:"massimiliano.regis@gmail.com",
		name:"Max"
		}
	})
.factory("items",["$resource","url","gps","$q","$http","user",function($resource,url,gps,$q,$http,user)
    {	
	return {
		save:function(uid,img, name)
			{
				
			var item=
				{
				user:
					{
					mail:		user.mail,
					firstName:	user.first_name,
					secondName:	user.second_name,
					avatar:		user.avatar
					},
				taggables:null,
				taggable:
					{
				    id: 		uid,
				    name: 		name,				    
				    stream: 	img,
				    description: "test",
				    tags: null,
				    position: 
				    	{
				      	lat: gps.latitude,
				      	lng: gps.longitude
				    	}
					}
				};
			console.log(JSON.stringify(item));
			return $http.post("http://"+url+"/relay-service-web/rest/land",item);
			},
		query:function()
			{			
			var deferred = $q.defer();				
			gps.refresh().then(function()
				{						
				$http.get("http://"+url+"/relay-service-web/rest/land",
						{params:
							{						
							lat:gps.latitude,
							lng:gps.longitude,
							user:user.mail
							}
						}).success(
						function(data)
						{
							
						var result=[];						
						for(var i in data.entities)
							{							
							var val = data.entities[i].attributes;													
							result.push(
								{									
								owner:		null,
								id:			val.id,
								name:		val.name,
								date:		"",
								img:		val.img,
								cat:		[],
								position:
									{
									lat:val.position.lat,
									lng:val.position.lng
									}
								})
											
							}
						deferred.resolve(result);			
						});
				})
			
			return deferred.promise;
			}
		}
    }])

.controller("loginController",["$cordovaVibration","$scope","user",function($cordovaVibration,$scope,user)
    {
	$scope.my=function(mail,name)
		{		
		$cordovaVibration.vibrate(100);
		user.mail=mail;
		user.name=name;
		window.location.href="#list";
		}	
    }])
.controller('mapCtrl', ["$scope","gps","items","$ionicLoading",function($scope,gps,items,$ionicLoading) 
    {
	var stylecolor = [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}];
	var bounds = new google.maps.LatLngBounds();
	
	$ionicLoading.show();
	items.query().then(function(data)
			{					
			for(var i in data)
				{
				var lat = data[i].position.lat;
				var lng = data[i].position.lng;
				bounds.extend(new google.maps.LatLng(lat, lng));
				
				$scope.markers.push({id:data[i].id,latitude:lat,longitude:lng});				
				}
			$scope.map.center=
				{
				latitude:bounds.getCenter().lat(),
				longitude:bounds.getCenter().lng()
				};
			
			$scope.map.bounds={
				northeast:
				{
				latitude:bounds.getNorthEast().lat(),
				longitude:bounds.getNorthEast().lng()
				}, 
				southwest:
				{
				latitude:bounds.getSouthWest().lat(),
				longitude:bounds.getSouthWest().lng()
				}}		
			$ionicLoading.hide();
			})	
	//gps.follow().then(null,null,function(data){$scope.map.center=data});
	
	$scope.map = {center: gps, zoom: 9, bounds: {}, options:{styles: stylecolor,streetViewControl:false,zoomControl:false,scaleControl:false,mapTypeControl:false}};	
	$scope.markers = 
	    	[   
				{			
				id:22,
				latitude: 40.1451,
				longitude: -99.6680
				}
	    	];
    }])
   
.controller("shotController",["$scope","uuid","items",function($scope,uuid,items)
    {	
	$scope.name="test";
	$scope.files=[];
	$scope.upload = function() 
		{		
	    
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
		
		items.save(uuid.random(),$scope.files[0].url,$scope.name).then(function(){window.location.href="#/tab/home"});		
		}
		
    }])
    
.controller("itemController",[function()
    {
	
    }])
.controller("aroundmeController",["$scope","items","$ionicLoading",function($scope,items,$ionicLoading)
    {				
	 $ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		  });
	
	items.query().then(function(data)
		{	
		$ionicLoading.hide();
		$scope.aroundme=data;
		})	
    }])
.controller("taggableCtrl",["$scope","gps",function($scope,gps)
	{
	
	
	$scope.map = {center: {latitude: 45.3560454, longitude: 9.1603807 }, zoom: 8, bounds: {}, options:{styles: style}};
    $scope.options = {scrollwheel: false,styles: style};
    
	$scope.position=gps;
	$scope.around=[]
		
	$scope.data={		
		};
	$scope.salva=function()
		{
		$scope.data.id=Math.random();
		$scope.data.latitude=gps.latitude;
		$scope.data.longitude=gps.longitude;
		$scope.aroundme.push($scope.data);
		$scope.data={view:$scope.data.view};
		}
	$scope.type="photo";
	$scope.img="";
	
	$scope.types=
		[
		 {"name":"photo","href":"edit/photo.html"},
		 {"name":"movie","href":"edit/movie.html"},
		 {"name":"picture"}
		 ]
	$scope.users=
		[
		 {"mail":"massimiliano.regis@gmail.com","name":"massimiliano"},
		 {"mail":"valerio.artusi@gmail.com","name":"valerio"}
		 ];
	$scope.aroundme=
		[
		 	{img:"images/pictures/1ww.jpg",name:"Swing near the ocean"}
		 ];
	
	gps.refresh();
	}])


	
	