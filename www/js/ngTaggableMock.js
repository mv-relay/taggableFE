angular.module("taggableMock",["taggable"])
.constant("$beacons_refresh",2000)
.run(
	["$beacons","$interval","$beacons_refresh",function($beacons,$interval,$beacons_refresh)
	    {		
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