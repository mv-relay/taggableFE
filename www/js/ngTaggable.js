var style=[{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

angular.module("taggable",["ngResource","uiGmapgoogle-maps"])
.constant("url","95.110.224.34:8080")
.constant('$ionicLoadingConfig', {template: '<i class="icon ion-loading-a"></i>'})
.service("uuid",function()
	{
	this.random = function()
		{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
			{
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
			});
		}	
	})
.filter('distance', function () 
	{
	return function (input) 
		{
		if(input==null) return;
	    if (input >= 1000) {
	        return (input/1000).toFixed(2) + 'km';
	    } else {
	        return input.toFixed(0) + 'm';
	    }
		}
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
			var deferred = $q.defer();
			var act = this;
		
			var time=setTimeout(function()
				{			
				var position ={"timestamp":1419368552972,"coords":{"speed":null,"heading":null,"altitudeAccuracy":null,"accuracy":37,"altitude":null,"longitude":8.0055436,"latitude":45.5643368}};
				act.latitude=position.coords.latitude;
				act.longitude=position.coords.longitude;
				deferred.resolve(position);
				},5000)
			if (navigator.geolocation) 
				navigator.geolocation.getCurrentPosition(function(position)
					{
					clearTimeout(time);
					try{clearTimeout(time);}catch(e){}						
					act.latitude=position.coords.latitude;
					act.longitude=position.coords.longitude;
					if(callback) callback();
					
					deferred.resolve(position);						
					});
			return deferred.promise;
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
.service("$beacons",["$q","$interval",function($q,$interval)
    {
	var that			= this;
	this.deferredMonitor= $q.defer();
	this.deferredRanging= $q.defer();
	this.deferredChange = $q.defer();
	this.regions	=	[];
	this.list		=	[];
	this.inside		=	[];
	this.immediate	=	[];
	this.near		=	[];
	this.far		=	[];	
	this.getRegion	= function(uuid)
		{
		for(var i in this.regions)
			if(this.regions[i].uuid==uuid)
				return this.regions[i];
		return {uuid:uuid,beacons:0};
		}
	this.monitoring=function()
			{
			return this.deferredMonitor.promise;
			};
	this.ranging=function()
			{
			return this.deferredRanging.promise;
			};
	this.change=function()
			{
			return this.deferredChange.promise;
			};	
	this.get=function(uuid,minor,major)
		{		
		for(var i in this.list)
			{
			var uid 	= this.list[i].uuid;
			var min 	= this.list[i].minor;
			var maj 	= this.list[i].major;
			if(uuid==uid && min==minor && maj==major)				
				return this.list[i];				
			}
		}
	this.delegate=
			{											
			didRangeBeaconsInRegion :function(pluginResult) 
				{									
				//console.log("didRangeBeaconsInRegion:---->"+JSON.stringify(pluginResult));
				that.inside 	= that.list;
				that.immediate	= [];
				that.near		= [];
				that.far		= [];				
				for(var i in pluginResult.beacons)
					{					
					var beacon = pluginResult.beacons[i];
					var oldBeacon = that.get(beacon.uuid, beacon.minor,beacon.major);
					
					if(beacon.proximity=="ProximityImmediate" && oldBeacon.proximity=="ProximityNear") 										
						try{oldBeacon.immediate();}catch(e){}									
						
					if(beacon.proximity=="ProximityNear" && oldBeacon.proximity=="ProximityFar")						
						try{oldBeacon.near();}catch(e){}						
						
					if(beacon.proximity=="ProximityFar" && oldBeacon.proximity=="ProximityUnknow")													
						try{oldBeacon.far();}catch(e){}						
						
					try{oldBeacon.change();}catch(e){}		
					oldBeacon.proximity=beacon.proximity;
					oldBeacon.accuracy=beacon.accuracy;
					}
				for(var i in that.inside)
					{
					var beacon = that.inside[i];
					if(beacon.proximity=="ProximityImmediate") 	 that.immediate.push(beacon);
					if(beacon.proximity=="ProximityNear")		 that.near.push(beacon);
					if(beacon.proximity=="ProximityFar")		 that.far.push(beacon);
					}
				console.log("didRangeBeaconsInRegion:---->"+JSON.stringify(that.near));
				that.deferredRanging.notify(pluginResult);
				that.deferredChange.notify(that);
				},
			didDetermineStateForRegion :function(pluginResult) 
				{												
				var beacon = pluginResult.region;
				var oldBeacon = that.get(beacon.uuid, beacon.minor,beacon.major);
				if(pluginResult.state=="CLRegionStateInside")
					{					
					//var region = this.getRegion(obj.uuid);
					try{oldBeacon.enter();}catch(e){}
					}
				if(pluginResult.state=="CLRegionStateOutside")
					{
					try{oldBeacon.exit();}catch(e){}
					}
				that.deferredMonitor.notify(pluginResult);
				},
			didStartMonitoringForRegion :function(pluginResult) 
				{
			
				}
			
			};
	this.add=function(obj)
		{								
		this.list.push(obj);			
		}
	
    }])
.filter("like",[function()
    {
	return function(input)
		{
		if(input==0) return "no like";
		if(input==1) return "1 like";
		return input+" likes";
		}
    }])
.service("like",["$http","url","user",function($http,url,user)
   {
   this.add=function(id)
   		{
	    $http.post("http://"+url+"/relay-service-web/rest/land/Like",{id:id,user:user.mail}).then(function()
	    	{
	    	
	    	})
   		}
   this.remove=function(id)
   		{
	   	alert("nolike");
   		}
   }])
.service("filter",["gps","single",function(gps,single)
    {
	this.item= function(data)
		{		
		var result = 
			{									
			owner:		null,
			id:			data.id,
			name:		data.name,
			description:data.description,
			type:		"photo",
			date:		"",
			img:		data.img,
			cat:		[],
			beacon:		data.beacon,
			like:		0,
			onClick:	function()
				{
				single[this.type](this.id);				
				}	
			};		
		if(data.like!=null)
			result.like=data.like;
		if(data.optional!=null)
			{
			result.option = JSON.parse(data.optional);
			result.museum = result.option.museum;
			if(result.museum==result.option.originalid) result.museum=null;
			}
		if(data.position!=null)
			result.position=
				{				
				lat:data.position.lat,
				lng:data.position.lng,
				distance: google.maps.geometry.spherical.computeDistanceBetween(
						new google.maps.LatLng(data.position.lat, data.position.lng),
						new google.maps.LatLng(gps.latitude,gps.longitude)),
				direction: google.maps.geometry.spherical.computeHeading(
						new google.maps.LatLng(gps.latitude,gps.longitude),
						new google.maps.LatLng(data.position.lat, data.position.lng))
				}
		
		return result;		
		}
    }])
.factory("items",["$resource","url","gps","$q","$http","user","filter",function($resource,url,gps,$q,$http,user,filter)
    {	
	return {
		save:function(obj)
			{				
			var item=
				{
				user:
					{
					mail:		user.mail
					},				
				taggable:
					{
				    id: 			obj.uuid,
				    name: 			obj.name,					    
				    stream: 		obj.img,
				    description: 	obj.description,
				    tags: 			obj.tags,
				    position: 
				    	{
				      	lat: gps.latitude,
				      	lng: gps.longitude
				    	},
					like:null
					}
				};			
						
			return $http.post("http://"+url+"/relay-service-web/rest/land",item);
			},
		get:function(item)
			{
			var act = this;			
			var deferred = $q.defer();
			for(var i in act.list)
				{
				if(act.list[i].id==item.id)
					{					
					deferred.resolve(act.list[i]);					
					return deferred.promise;
					}
				}
			$http.get("http://"+url+"/relay-service-web/rest/land/"+item.id).success(function(data)
				{				
				deferred.resolve(filter.item(data.attributes));
				})					
			return deferred.promise;
			},
		query:function()
			{					
			var act = this;
			var deferred = $q.defer();
			if(this.list!=null)
				deferred.resolve(this.list);
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
							result.push(filter.item(val))									
							}
						act.list=result;
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
.controller('mapController', ["$scope","gps","items","$ionicLoading","$ionicModal","single","filter","$state",function($scope,gps,items,$ionicLoading,$ionicModal,single,filter,$state) 
    {
	var stylecolor = [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}];
	
		
	$scope.toList = function(){$state.go("tabs.museumList")}
	$ionicLoading.show();
	items.query().then(function(data)
			{		
			var bounds = new google.maps.LatLngBounds();
			for(var i in data)
				{
				var lat = data[i].position.lat;
				var lng = data[i].position.lng;
				var type = data[i].type;
				var id = data[i].id;
				
				$scope.markers.push(
					{
					id:data[i].id,
					latitude:lat,
					longitude:lng,
					position:
						{
						latitude:lat,
						longitude:lng	
						},						
					type:type,
					onClick:function(obj)
						{		
						single[type](obj.key);						
						},
					single:function(obj)
						{										
						single[type](obj.idKey)											
						}
					});
				bounds.extend(new google.maps.LatLng(lat, lng));
				}
			
			$scope.me=
				{
				icon:'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',
				id:"me",
				position:
					{
					latitude:gps.latitude,
					longitude:gps.longitude	
					}
				}			
			bounds.extend(new google.maps.LatLng(gps.latitude, gps.longitude));
			$scope.map = {center: gps, zoom: 9, bounds: {}, options:{styles: stylecolor,streetViewControl:false,zoomControl:false,scaleControl:false,mapTypeControl:false}};
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
		
		items.save(
			{
			uuid		:uuid.random(),
			img			:$scope.files[0].url,
			name		:$scope.name,
			description :$scope.description}).then(function(){window.location.href="#/tab/home"});		
		}
		
    }])
.service("single",["$rootScope","$state",function($rootScope,$state)
    {	
	this.photo=function(uid)
		{
		$rootScope.$broadcast('singleTaggable',{id:uid});	
		}
	this.museum=function(uid)
		{
		$state.go("tabs.singleMuseum",{id:uid});
		}
	this.tour=function(uid)
		{
		$state.go("tabs.singleTour",{id:uid});
		}
    }])

.controller("appController",["items","$stateParams","$scope","$ionicModal","$state",function(items, $stateParams,$scope,$ionicModal,$state)
    {	
	$ionicModal.fromTemplateUrl('single.html', function($ionicModal) 
		{		
	    $scope.modal = $ionicModal;
		}, 
		{        
	    scope: $scope,        
	    animation: 'slide-in-up'
		});  
	
	
	$scope.$on("singleTaggable",function(e,obj)
		{
		items.get({id:obj.id}).then(function(data)
			{			
			$scope.obj=data;			
			$scope.modal.show();
			});
		})
    }])
.controller("museumListController",["$scope","items","$ionicLoading","$ionicModal","$stateParams","$rootScope","single",function($scope,items,$ionicLoading,$ionicModal,$stateParams,$rootScope,single)
    {				
	$ionicLoading.show();
	$scope.title='Collections';
	$scope.filter={type:'museum'};
	items.query().then(function(data)
		{	
		$ionicLoading.hide();		
		$scope.aroundme=data;
		
		if($stateParams.uid!=null)
			single.open($stateParams.uid);
		})			
    }])   
.controller("tourListController",["$scope","items","$ionicLoading","$ionicModal","$stateParams","$rootScope","single",function($scope,items,$ionicLoading,$ionicModal,$stateParams,$rootScope,single)
    {				
	$ionicLoading.show();	
	$scope.title='Tours';
	$scope.filter={type:'tour'};
	items.query().then(function(data)
		{	
		$ionicLoading.hide();		
		$scope.aroundme=data;
		
		if($stateParams.uid!=null)
			single.open($stateParams.uid);
		})			
    }])   
.filter("inArray",function()
	{
	return function(items,search)
		{
		return items.filter(function(item, index, array) 
			{			
		    return $.inArray(item.id,search)>=0;
	    	})		
		}
	})
.controller("aroundmeController",["$scope","items","$ionicLoading","$ionicModal","$stateParams","$rootScope","single","$state",function($scope,items,$ionicLoading,$ionicModal,$stateParams,$rootScope,single,$state)
    {				
	$ionicLoading.show();	
	$scope.toMap = function(){$state.go("tabs.museumMap")}	
	$scope.title='Taggables';
	$scope.filter={type:'photo'};	
	items.query().then(function(data)
		{	
		$ionicLoading.hide();
		$scope.aroundme=data;		
		
		if($stateParams.uid!=null)
			single.open($stateParams.uid);
		})			
    }])
.controller("singleTaggableController",["items","$stateParams","$scope","$ionicScrollDelegate","$ionicNavBarDelegate",function(items,$stateParams,$scope,$ionicScrollDelegate,$ionicNavBarDelegate)
    {
	$scope.like=function()
		{
		alert("like")
		}
	$scope.close=function()
		{
		$ionicNavBarDelegate.back();
		}
	$scope.background=
		{
		h:140,
		x:0
		}	
	$scope.scrolling=function(e,y)
		{				
		this.y=y;
		$scope.background.h=140-y/4;
		$scope.background.x=y/4;
		this.$apply();
		}
	
	items.get({id:$stateParams.id}).then(function(data)
		{		
		angular.extend($scope,data);		
		});
    }])
.controller("audioController",["$scope","$cordovaCapture","$cordovaMedia",function($scope,$cordovaCapture,$cordovaMedia)
    {
	debugger;
	$scope.data=null
	$scope.capture=function()
		{
		var options = { limit: 3, duration: 10 };
		$cordovaCapture.captureAudio(options).then(function(audioData)
			{			
			$scope.data = audioData[0].fullPath;			
			})
		}
	$scope.play=function()
		{
		var source = $cordovaMedia.newMedia($scope.data);		
		$cordovaMedia.play(source.media);
		}
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

.service("$notify",["$ionicLoading",function($ionicLoading)
		{
		this.show=function(title)
			{
			$ionicLoading.show({
		        template: title,
		        noBackdrop: true,
		        duration: 1500
		    	});
			}
		}])


	
	