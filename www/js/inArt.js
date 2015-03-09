var app=null;
	if(window.cordova!=null)				
		app=angular.module('app', ['ionic','ngBase','taggableCordova']);						
	else		
		app=angular.module('app', ['ionic','ngBase','taggableMock','imagenie']);	
	
	
app.run(["$ionicPlatform","$beacons","$notify","$state","$ionicModal","$rootScope","single",function($ionicPlatform,$beacons,$notify,$state,$ionicModal,$rootScope,single) {
	$ionicPlatform.ready(function() {
		console.log("inArt run-->");
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}

		$("#tagBox").tagging();
		
		
		$beacons.change().then(null,null,function(data)
			{				
			if(data.near.length>0) 
				{
				if(data.view==data.near[0].taggable.id) return;
				data.view = data.near[0].taggable.id;					
				single.open(data.near[0].taggable.id);
				}
			});
		console.log("<--inArt run");
	});
}])
.config(function($stateProvider, $urlRouterProvider) {
	console.log("inArt config-->");
	$stateProvider
	.state('tabs', 
		{
	    url: "/tab",
	    abstract: true,
	    templateUrl: "tabs.html"
	    })	 
	 .state('profile', 
		{
		url: "/profile",						
		controller:["user","$scope","$state",function(user,$scope,$state)
			{				
			if(!user.logged) 		$state.go("communityLogin");
			else				 	$state.go("communityProfile");
			}]
		})
		
	.state('intro', 
		{
		url: "",		
		controller:"introController",
		templateUrl: "views/intro.html"
		})
	
	.state('artwork', 
		{
	    url: "/artwork",	  	    
	    templateUrl: "views/layout.html"	  
	    })	
	.state('artwork.lista', 
		{
		url : '/lista',		
		data:	{title:"Artworks"},		
		templateUrl: "views/photo/list.html",		
		controller: 'aroundmeController',
		parent:"artwork"
		})
	.state('artwork.mappa', 
		{			
		url : '/mappa',		
		templateUrl: "views/photo/map.html",
		controller: 'mapController',
		parent:"artwork"
		})
	.state('artwork.single', 
		{			
		url : '/single',		
		templateUrl: "views/photo/single.html",
		controller: 'singleTaggableController'
		})
		
		
	.state('museum', 
		{
	    url: "/museum",	  	    
	    templateUrl: "views/layout.html"
	    })	
	.state('museum.lista', 
		{			
		url : '/lista',		
		templateUrl: "views/museum/list.html",
		data:	{title:"Collections"},
		controller: 'aroundmeController'
		})
	.state('museum.mappa', 
		{			
		url : '/mappa',		
		templateUrl: "views/museum/map.html",
		controller: 'mapController'
		})
	.state('museum.single', 
		{			
		url : '/single',		
		templateUrl: "views/museum/single.html",
		controller: 'singleTaggableController'
		})
		
	.state('tour', 
		{
	    url: "/tour",	  	    
	    templateUrl: "views/layout.html"
	    })	
	.state('tour.lista', 
		{			
		url : '/lista',		
		templateUrl: "views/tour/list.html",
		data:	{title:"Tour"},
		controller: 'aroundmeController'
		})
	.state('tour.mappa', 
		{			
		url : '/mappa',		
		templateUrl: "views/tour/map.html",
		controller: 'mapController'
		})
	.state('tour.single', 
		{			
		url : '/single',		
		templateUrl: "views/tour/single.html",
		controller: 'singleTaggableController'
		})
		
	.state('preferred', 
		{
	    url: "/preferred",	  	    
	    templateUrl: "views/layout.html"
	    })	
	.state('preferred.lista', 
		{			
		url : '/lista',		
		templateUrl: "views/preferred/list.html",
		controller: 'aroundmePreferredController'
		})
	.state('preferred.mappa', 
		{			
		url : '/mappa',		
		templateUrl: "views/preferred/map.html",
		controller: 'mapController'
		});
	
	console.log("<--inArt config");
	})
	.directive('gridImage', function() 
		{	
		return function($scope, element, attrs) 
			{
			var url = attrs.gridImage;
			element.css({
				'background-image' : 'url(' + url + ')',
				});
			}
		})
		
	.directive('hideTabs', function($rootScope) 
		{
		return {
			restrict: 'A',
			link: function($scope, $el) 
				{        	
				$rootScope.hideTabs = true;
				$scope.$on('$destroy', function() 
					{
					$rootScope.hideTabs = false;
					});
				}
			};
		})
	.controller("museumController",["$scope","$ionicNavBarDelegate","$state",function($scope,$ionicNavBarDelegate,$state)
	    {		
		$scope.close=function()
			{					
			alert("close");
			$ionicNavBarDelegate.back();
			//$state.go("tabs.list");
			}
	    }])
	.controller("notificationController",["$scope","$cordovaLocalNotification",function($scope,$cordovaLocalNotification)
		{
		$scope.start=function(){
			alert("invio...");
			alert(window.plugin.notification.local);
			
			window.plugin.notification.local.add({message: 'Attenzione dietro di te un beacon'},function(){alert("sent")},$scope);
				
			}
		}])	
	.controller("beaconController", [ "$scope","$beacons","$notify", function($scope,$beacons,$notify) 
	    {		
			$beacons.change().then(function(){},function(){},function(data)
				{								
				$scope.near		= $beacons.near;
				$scope.far		= $beacons.far;
				$scope.immediate= $beacons.immediate;				
				})
		}])
	.controller("scanController", [ "$scope", function($scope) {
		
	} ])
	.controller("introController",["$scope",function($scope)
	    {
		console.log("intro");
		$scope.change=function(index)
			{
			$(".slider").css("background-position-x",-(index*400)+"px");		
			}
		$scope.start=function()
			{
			$(".slider").css("transition-duration","2s");
			$(".slider").css("opacity",0);
			setTimeout(function()
				{
				document.location.href='#/tab/list';
				},2000)
			
			}
	    }]);