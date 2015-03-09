angular.module("taggableMock",["taggable"])
.constant("$beacons_refresh",2000)
/*
.service("items",["$q","gps","$http","user","filter",function($q,gps,$http,user,filter)
    {
	this.get=function(item)
		{
		var act = this;
		var deferred = $q.defer();
		for(var i in act.list)
			if(act.list[i].id==item.id)
				{
				deferred.resolve(act.list[i]);
				return deferred.promise;
				}							
		return deferred.promise;
		};
	this.query=function()
		{
		var act = this;
		var deferred = $q.defer();
		if(this.list!=null)
			deferred.resolve(this.list);
		gps.refresh().then(function()
			{			
			$http.get("/data/items.json",
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
			});
		return deferred.promise;
		};
    }])*/
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
		
		
		/*if($.inArray(data.id,type.museum)>=0)
			result.type="museum";
		if(data.id=="f3f51937-0ee1-4008-8a9b-da6ac2632484")
			result.type="museum";
		if(data.id=="76d2ac2e-ebba-46cf-9416-46dcf5410af3")
			result.type="museum";
		*/
		if(data.id=="1d62a565-5cd9-4ad3-b432-dc85221f559a")			
			$beacons.add(
				{
				uuid:"ACFD065E-C3C0-11E3-9BBE-1A514932AC01",
				minor:0,
				major:1,
				taggable:result,
				name:"Ulisse",
				change:function(data)
					{
					this.taggable.position.distance=this.accuracy;
					}
				});	
		if(data.id=="59ab41d4-a1b9-482a-af93-9712e8235f8d")
			$beacons.add(
				{
				uuid:"ACFD065E-C3C0-11E3-9BBE-1A514932AC01",
				minor:0,
				major:0,
				taggable:result,
				name:"Paperone",
				change:function(data)
					{
					this.taggable.position.distance=this.accuracy;
					}
				});
		
		
		
		return result;		
		}
    }])
.run(
	["$beacons","$interval","$beacons_refresh",function($beacons,$interval,$beacons_refresh)
	    {		
		console.log("run TaggableMOCK");
		
		if(true)return;
		$interval(function()
			{
			if($beacons.delegate.didRangeBeaconsInRegion==null) return;
			var beacons = []
			for(i in $beacons.list)
				{				
				var beacon=angular.extend({},$beacons.list[i])
				if(beacon.accuracy==null) beacon.accuracy=0;
				beacon.accuracy=Math.abs(beacon.accuracy+Math.random()-.5);
				
				if(beacon.accuracy<5) 
					{
					if(beacon.proximity==null) $beacons.delegate.didDetermineStateForRegion({state:"CLRegionStateInside",region:beacon});
					beacon.proximity = "ProximityFar";
					}
				if(beacon.accuracy<2) 
					{
					if(beacon.proximity==null) $beacons.delegate.didDetermineStateForRegion({state:"CLRegionStateInside",region:beacon});
					beacon.proximity = "ProximityNear";
					}
				if(beacon.accuracy<1) 
					{
					if(beacon.proximity==null) $beacons.delegate.didDetermineStateForRegion({state:"CLRegionStateInside",region:beacon});
					beacon.proximity = "ProximityImmediate";
					}
				if(beacon.accuracy>5)
					{
					if(beacon.proximity!=null) $beacons.delegate.didDetermineStateForRegion({state:"CLRegionStateOutside",region:beacon});						
					beacon.proximity = null;
					}
				beacons.push(beacon);
				}
			$beacons.delegate.didRangeBeaconsInRegion(
					{
					beacons:beacons
					}); 
			},$beacons_refresh)
    }]);