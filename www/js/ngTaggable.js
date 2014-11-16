var style=[{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

angular.module("taggable",["ngResource","angularFileUpload","google-maps".ns()])
.constant("url","95.110.224.34:8080")
.factory("gps",[function()
    {
	var gps = 
		{
		latitude:null,
		longitude:null,
		follow:function()
			{
			act = this;
			refresh(function(){act.follow()})
			},
		refresh:function(callback)
			{
			var act = this;
			alert("gps..."+navigator.geolocation);
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
			return $http.post("http://"+url+"/relay-service-web/rest/land",item);
			},
		query:function()
			{
			alert("1");
			var deferred = $q.defer();			
			gps.refresh(function()
				{
				alert("2");
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
							var user = val.user;
							for(var m in val.forSales)
								{	
								var sale = val.forSales[m];
								result.push(
									{									
									owner:
										{
										id		:user.mail,
										name	:user.mail,
										avatar	:user.avatar							
										},
									id:			sale.id,
									name:		sale.name,
									date:		"",
									img:		sale.img,
									cat:		[],
									position:
										{
										lat:sale.position.lat,
										lng:sale.position.lng
										}
									})
								}				
							}
						deferred.resolve(result);			
						});
				})
			
			return deferred.promise;
			}
		}
    }])
.controller("mainController",["$scope","$images","user",function($scope,$images,user)
    {
	$scope.state = $images.state; 
	$scope.user=user;
    }])
.controller("loginController",["$scope","user",function($scope,user)
    {
	$scope.my=function(mail,name)
		{		
		user.mail=mail;
		user.name=name;
		window.location.href="#list";
		}	
    }])
.controller("shotController",["$scope","$upload","$images","items",function($scope,$upload,$images,around)
    {
	$scope.files=$scope.$root.files||[];
	
	$scope.upload=function(files)
		{		
		$scope.$root.files=[];				
		$images.adjust(files,400,200).progress(function(data)
			{			
			$scope.$root.files.push({url:data});
			document.location.href="#shot"
			})
		}
	$scope.save=function()
		{
		around.save($images.UUID(),$scope.files[0].url,$scope.name);
		window.location.href="#/list"
		}
    }])
.controller("itemController",[function()
    {
	
    }])
.controller("aroundmeController",["$scope","items",function($scope,items)
    {			
	alert("item loading");
	items.query().then(function(data)
		{
		alert("item loaded");
		alert(data);
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

	
	