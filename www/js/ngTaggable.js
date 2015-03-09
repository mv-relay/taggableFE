var style=[{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

angular.module("taggable",["ngResource","ngCommunity","ngBase","uiGmapgoogle-maps"])
.constant("profile","museum")
.constant("url","95.110.224.34:8080")
.constant('$ionicLoadingConfig', {template: '<img src="img/icona.png" style="width:50%; -webkit-animation-iteration-count: infinite;" class="pulse animated"/>'})
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
		
			//Los Angeles
			var position ={"timestamp":1419368552972,"coords":{"speed":null,"heading":null,"altitudeAccuracy":null,"accuracy":37,"altitude":null,"longitude":-118.253804,"latitude":34.056915}};
				act.latitude=position.coords.latitude;
				act.longitude=position.coords.longitude;
				deferred.resolve(position);
			
			return deferred.promise;
			}
		}
	return gps;
    }])
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
		if(input==null) return "no like";
		if(input==0) return "no like";
		if(input==1) return "<i class='icon ion-thumbsup'></i> 1";
		return "<i class='icon ion-thumbsup'></i> "+input;
		}
    }])
.service("like",["$http","$q","$resource","url","user","popup","$state",function($http,$q,$resource,url,user,popup,$state)
   {
   var likes = $resource("http://"+url+"/relay-service-web/rest/land/Like/:id/:mail",{id:'@id',user:'@user'})
   this.add=function(id)
   		{	   	   
	    var deferred=$q.defer();
	   	if(!user.logged) {popup.show("Register","Sign in to like this one",
	   		[
	   		 {text:'Cancel'},
	   		 {text:'Login', type: 'button-positive',onTap:function(){$state.go('profile');}}
	   		]); return deferred.promise;}
	   	$http.post("http://"+url+"/relay-service-web/rest/land/Like",
	   		{
	   		id:id,
	   		user:user.mail
	   		}).then(function(){deferred.resolve();})
	    	    
	    return deferred.promise;
   		}
   this.remove=function(id)
   		{
	    var deferred=$q.defer();
	    likes.delete({id:id,user:user.mail},function(){deferred.resolve();})
		return deferred.promise;
   		}
   }])
.service("filter",["gps","like","single","base64","url",function(gps,like,single,base64,url)
    {
	this.item= function(data)
		{			
		var result = 
			{									
			owner:		null,
			id:			data.id,
			name:		data.name,
			description:data.description,
			type:		data.type,
			date:		"",			
			img:		data.img,
			cat:		[],
			beacon:		data.beacon,				
			likes:		{count:0,my:false},
			like:		function()
				{								
				if(this.likes.my) 
					{					
					like.delete(this.id).then(function()
						{
						this.likes.count--;
						this.likes.my=false;
						});
					}
				else
					{					
					like.add(this.id).then(function()
						{
						this.likes.count++;
						this.likes.my=true;	
						});
					}
				return false;
				},
			onClick:	function()
				{
				debugger;
				single[this.type](this.id);				
				},
			addLike:function()
				{
				like.add(this.id);
				this.like++;
				},
			addComment:function()
				{
				alert("comment");
				},
			share:function()
				{
				alert("share");
				},
			audio:
				{
				open:false,
				file:null,
				toggle:function()
					{
					if(this.open) 	this.pause();
					else		this.play();
					},
				play:function()
					{
					this.open=true; 
					$('#audio audio').attr("src",this.file);
					$('#audio audio')[0].play();
					},
				pause:function()
					{
					this.open=false; 
					$('#audio audio')[0].pause();
					}
				},
			video:
				{
				open:false,
				file:null,
				toggle:function()
					{
					if(this.open) 	this.pause();
					else		this.play();
					},
				play:function()
					{
					this.open=true; 
					$('#video video')[0].play();
					},
				pause:function()
					{
					this.open=false; 
					$('#video video')[0].pause();
					}
				}
			};		
		
		if(data.img.match("95.110.224.34")!=null)			
			result.img = "http://"+url+"/relay-service-web/rest/land/media/THUMB/"+data.id+".jpg";
		
		
		for(i in data.medias)
			{
			if(data.medias[i].type=="mp3")
				result.audio.file=data.medias[i].path;
			}		
		
		try	{
			result.route=[]
			for(var i in data.route.routes)
				{
				var tag = data.route.routes[i].taggable
				result.route.push(
					{
					id			:		tag.id,
					img			:		tag.img,
					name		:		tag.name,
					description	:		tag.description,
					type		:		tag.type,
					onClick		:		function()
						{
						single[this.type](this.id);	
						}
					})				
				}			
			}
		catch(e){}
		if(data.likes!=null)
			result.likes=
				{
				count:data.likes.count,
				my:data.likes.myLike
				}
		if(data.optional!=null)
			{
			result.option = JSON.parse(data.optional);
			result.museum = result.option.museum;
			if(result.museum==result.option.originalid) result.museum=null;
			}
		if(data.position!=null)
			{
			result.position=
				{				
				lat:data.position.lat,
				lng:data.position.lng				
				}
			try	{
				result.position.distance=google.maps.geometry.spherical.computeDistanceBetween(
						new google.maps.LatLng(data.position.lat, data.position.lng),
						new google.maps.LatLng(gps.latitude,gps.longitude)),
				result.position.direction=google.maps.geometry.spherical.computeHeading(
						new google.maps.LatLng(gps.latitude,gps.longitude),
						new google.maps.LatLng(data.position.lat, data.position.lng))
				}catch(e){}
			}
		
		return result;		
		}
    }])
.factory("items",["$resource","url","gps","$q","$http","user","filter","loading","popup",function($resource,url,gps,$q,$http,user,filter,loading,popup)
    {	
	var userMail="";
	return {
		singles:{},
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
			
			if(act.singles[item.id])
				deferred.resolve(act.singles[item.id]);					

			loading.show();
			$http.get("http://"+url+"/relay-service-web/rest/land/"+item.id).success(function(data)
				{				
				var obj = filter.item(data.attributes);
				act[obj.id]=obj;
				deferred.resolve(obj);
				loading.hide();
				},function()
				{
				popup.alert({title:"Error",msg:"sorry! we've a problem"})
				loading:hide();
				})					
			return deferred.promise;
			},
		preferred:function()
			{
			var act = this;
			var deferred = $q.defer();			
			userMail=user.mail;
			gps.refresh().then(function()
				{						
				$http.get("http://"+url+"/relay-service-web/rest/land/TaggableLike/"+user.mail).
					success(
						function(data)
						{							
						var result=[];						
						for(var i in data.entities)
							{							
							var val = data.entities[i].attributes;							
							result.push(filter.item(val))									
							}						
						
						deferred.resolve(result);			
						});
				})
			
			return deferred.promise;
			},		
		query:function()
			{
			var deferred 	= $q.defer();
			var act			= this;
			if(act.list!=null && act.userMail==user.mail)
				{
				deferred.resolve(act.list);
				return deferred.promise;
				}
			act.userMail=user.mail;
			
			loading.show();
			gps.refresh().then(function()
				{				
				$http.get("http://"+url+"/relay-service-web/rest/land",
					{
					//timeout: deferred.promise,
					params:
						{						
						lat:gps.latitude,
						lng:gps.longitude,
						mail:user.mail
						}
					})
				.then(
					function(data)
						{						
						var result=[];
						data=data.data;
								
						for(var i in data.entities)
							{							
							var val = data.entities[i].attributes;							
							result.push(filter.item(val))									
							}
						for(var i in user.taggables)
							{													
							var tag = filter.item(user.taggables[i]);
							result.unshift(tag);								
							act.singles[tag.id]=tag;
							}
						act.list=result;
								
						deferred.resolve(result);
						loading.hide();
						},
					function()
						{							
						popup.alert("Error","I'm sorry. we have a problem")
						loading.hide();						
						}
					);
				})	
			return deferred.promise;
			},
		queryX:function(opt)
			{						
			var deferred 	=	$q.defer();
			var act 		= 	this;
			var actSize 	= 	opt.actSize;
			var pageSize 	= 	opt.pageSize;
			
			this.queryHttp()
				.then(function(data)
					{					
					
					if(pageSize==null)	{deferred.resolve(data); return;}					
					deferred.resolve(data.slice(actSize,pageSize+actSize));										
					});
			
			return deferred.promise;			
			}
		}
    }])
//.controller("loginController",["$cordovaVibration","$scope","user",function($cordovaVibration,$scope,user)
//    {
//	$scope.my=function(mail,name)
//		{		
//		$cordovaVibration.vibrate(100);
//		user.mail=mail;
//		user.name=name;
//		window.location.href="#list";
//		}	
//    }])
.controller('mapController', ["$scope","gps","items","$ionicLoading","$ionicModal","single","filter","$state",function($scope,gps,items,$ionicLoading,$ionicModal,single,filter,$state) 
    {
	var stylecolor = [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}];
	$ionicLoading.show();	
	$scope.map = {center: gps,zoom:9, options:{styles: stylecolor,streetViewControl:false,zoomControl:false,scaleControl:false,mapTypeControl:false}};
	$scope.to 	= function(state){$state.go(state)}		
	$scope.markers = null;	
	$scope.onClick	= function(id)
		{		
		single[id.control.type](id.control.id);
		}	
	items.query().then(function(data)
			{					
			var bounds = new google.maps.LatLngBounds();
			$scope.markers=data;
			
			for(var i in data)						
				bounds.extend(new google.maps.LatLng(data[i].position.lat, data[i].position.lng));				
			
			
			$scope.me=
				{
				icon:'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',
				id:"me",
				name:"",
				position:
					{
					latitude:gps.latitude,
					longitude:gps.longitude	
					}
				}			
			bounds.extend(new google.maps.LatLng(gps.latitude, gps.longitude));
			
			
			setTimeout(function()
				{				
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
					$scope.map.center={latitude:bounds.getCenter().lat(),longitude:bounds.getCenter().lng()};
				},0);
						
			$ionicLoading.hide();
			})	
	//gps.follow().then(null,null,function(data){$scope.map.center=data});	
    }])
.service("upload",["$q",function($q)
    {
	var act=this;
	this.input=null;
	
	
	
	
	this.upload=function()
		{				
		var deferred = $q.defer();
		
		var form = $("<FORM/>",{style:"position:absolute;z-index:200",id:'shot',action:""});
		var file = $("<INPUT/>",{type:"file",name:"xx"});			
			form.append(file);			
			$("BODY").append(form);
			form.hide();
		act.input=file;
		
		act.input.click();		
		act.input.change(function(e)
			{
			var files= e.target.files;
			form.remove();
			angular.forEach(files,function(file)
				{				
				var reader = new FileReader();
				reader.onload = function(e) 	
					{					
					deferred.notify(reader.result);
					}				
				reader.readAsDataURL(file);
				})
			})
		return deferred.promise;
		}
    }])
.controller("shotController",["$scope","uuid","items","shot",function($scope,uuid,items,shot)
    {	
	$scope.name="test";
	$scope.files=[];
	$scope.upload = shot.upload;
	
	
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
		$rootScope.$broadcast('artwork.single',{id:uid});	
		}
	this.museum=function(uid)
		{
		$state.go("museum.single",{id:uid});
		}
	this.tour=function(uid)
		{
		$state.go("tour.single",{id:uid});
		}
    }])
.controller("appController",["items","$stateParams","$scope","$ionicModal","$state","profile","config",function(items, $stateParams,$scope,$ionicModal,$state,profile,config)
    {	
	$scope.stateType="lista"	
		
	$scope.$on('$stateChangeStart', function (evt, toState) 
		{	
		console.log("start change state:"+toState.name);
		if(!toState.name.match("lista") && !toState.name.match("mappa"))
			{					
			var state =toState.name+"."+$scope.stateType; 			
			if($state.get(state)!=null)
				{
				console.log("-- change state:"+toState.name);
				evt.preventDefault();
				$state.go(state);				
				}
			}
		});
	$scope.$on('$stateChangeSuccess', function (evt, toState) 
		{			
		console.log("-- $stateChangeSuccess:"+toState.name);
	    if (toState.name.match("lista")!=null) 	$scope.stateType = "lista";
	    if (toState.name.match("mappa")!=null) 	$scope.stateType = "mappa";		    	
		});
	
	$scope.filter=
		{
		toggle:function()
			{			
			this.show=!this.show;
			},
		show:false,
		value:""
		}	
	
	$scope.config=config;
	
	$ionicModal.fromTemplateUrl('/views/photo/single.html', function($ionicModal) 
		{		
	    $scope.modal = $ionicModal;
		}, 
		{        
	    scope: $scope,        
	    animation: 'slide-in-up'
		});  
	
	
	$scope.$root.$on("artwork.single",function(e,obj)
		{
		items.get({id:obj.id}).then(function(data)
			{			
			$scope.obj=data;			
			$scope.modal.show();
			});
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
	
.controller("aroundmePreferredController",["$scope","items","$ionicLoading","$ionicModal","$stateParams","$rootScope","single","$state","popup","user",function($scope,items,$ionicLoading,$ionicModal,$stateParams,$rootScope,single,$state,popup,user)
    {		
	if(!user.logged)
		{
		popup.alert("Login","You must log in before");
		$state.go("profile");
		}
	$ionicLoading.show();	
	$scope.to 	= function(state){$state.go(state)}	
	
	items.preferred().then(function(data)
		{	
		$ionicLoading.hide();
		$scope.aroundme=data;		
		
		if($stateParams.uid!=null)
			single.open($stateParams.uid);
		})			
    }])
.controller("aroundmeController",["$scope","items","$ionicLoading","$ionicModal","$stateParams","$rootScope","single","$state",function($scope,items,$ionicLoading,$ionicModal,$stateParams,$rootScope,single,$state)
    {			
	console.log("aroundmeController...");
	try{$scope.title	=	$state.current.data.title;}catch(e){}
	$scope.aroundme = 	null;		
	$scope.pageSize	= 	10;
	$scope.size		= 	null;	
	$scope.moreData	=	true;
	$scope.refresh	=	function()	
		{		
		$scope.aroundme = null;
		$scope.loadData();		
		}	
	$scope.loadData	=	function()
		{		
		console.log("loadData...");
		
		if($scope.aroundme!=null)
			{
			$scope.size+=$scope.pageSize;			
			$scope.moreData=$scope.aroundme.length>$scope.size;
			
			$scope.$broadcast('scroll.infiniteScrollComplete');
			$scope.$broadcast('scroll.refreshComplete');
			return;
			}
	
		$scope.aroundme	= []
		$scope.size		= 0;
		items.query().then(function(data)	
			{						
			$scope.aroundme=data; 			
			$scope.loadData();
			})
		console.log("...loadData");
		}	
	
	if($state.current.name=="tabs.list") 
		{
		$scope.pageSize=10;
		}
	$scope.loadData();
	console.log("...aroundmeController");
	//if($stateParams.uid!=null)
	//single.open($stateParams.uid);
	
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
.run(["config",function(config)
   {
	console.log("run Taggable");
   }])

	
	