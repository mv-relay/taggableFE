angular.module("taggableMock",["taggable"])
.constant("$beacons_refresh",2000)
.constant("type",{
	museum:["-1247508489","1920937446","-456054142"]})
.service("filter",["gps","type",function(gps,type)
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
			beacon:		data.beacon
			};
		if(data.optional!=null)
			{
			var option = JSON.parse(data.optional);
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
.run(
	["$beacons","$interval","$beacons_refresh",function($beacons,$interval,$beacons_refresh)
	    {		if(true)return;
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