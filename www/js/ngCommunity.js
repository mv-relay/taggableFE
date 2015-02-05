angular.module("ngCommunity",[])
.constant("views",{
	profile:"communityProfile",
	register:"communityRegister",
	login:"communityLogin",
	lost:"communityLost",
	confirm:"communityConfirm"
	})
.value("user",{logged:false})
.config(function($stateProvider, $urlRouterProvider,$httpProvider) 
	{
	$httpProvider.defaults.headers.common["X-Requested-With"]="valore";
	$stateProvider
	 .state('communityConfirm', 
		{			
		templateUrl: "confirm.html",
		params:["mail","psw"],
		controller:"confirmController"
		})
	 .state('communityLost', 
		{			
		templateUrl: "resetPsw.html",
		controller:"lostController"
		})
	  .state('communityLogin', 
		{			
		templateUrl: "login.html",
		controller:"loginController"
		})
	 .state('communityRegister', 
		{
		url: "/register",
		controller:"registerController",
		templateUrl: "register.html"
		})
	.state('communityProfile', 
		{			
		templateUrl: "profile.html",
		controller:"profileController"
		})
	})
.factory("community",["$resource","user","$state",function($resource,user,$state)
	{				
	var community = $resource(
			"http://localhost:8080/community/user/:id",{id:"@id"},
			{
			login:
				{
				method:'GET',
				params:{mail:'',psw:''},
				url:'http://localhost:8080/community/login',
				responseType:'json',
				transformResponse:function(data)
					{				
					data.background='http://www.italyluxurytours.com/italy-guide/images/art.jpg';
					data.img = 'https://lh5.googleusercontent.com/-tgoExjOkcX0/AAAAAAAAAAI/AAAAAAAAAAA/wEyTqkqK-T8/photo.jpg';
					angular.extend(user,data);
					
					localStorage.setItem("jwt", user.jwt);
					user.logged=true;
					}
				},
			register:
				{
				method:'POST',
				url:'http://localhost:8080/community/register',
				responseType:'json'				
				},
			sendPsw:
				{
				method:'GET',
				url:'http://localhost:8080/community/:mail/sendPsw',
				params:{mail:''},
				responseType:'json'
				}
			});
	community.autoLogin=function()
		{
		var jwt = localStorage.getItem("jwt");
		$.get("http://localhost:8080/community/jwt",{jwt:jwt}).then(function(data)
			{	
			angular.extend(user,JSON.parse(data));
			user.background='http://www.italyluxurytours.com/italy-guide/images/art.jpg';
			user.img = 'https://lh5.googleusercontent.com/-tgoExjOkcX0/AAAAAAAAAAI/AAAAAAAAAAA/wEyTqkqK-T8/photo.jpg';
			user.logged=true;
			
			$state.go($state.current, {}, {reload: true});			
			});
		};
	return community;
	}])
.controller("registerController",["$scope","user","$state","views","community","loading",function($scope,user,$state,views,community,loading)
    {
	$scope.mail=user.mail;	
	$scope.register=function()
		{	
		var act = this;
		loading.show();
		community.register(
			{
			mail:this.mail,
			psw: this.psw,
			first_name:this.name,
			last_name:this.surname			
			},function()
			{			
			loading.hide();
			$state.go(views.confirm,{mail:act.mail,psw:act.psw})
			});		
		}
	$scope.login=function()
		{		
		$state.go(views.login);
		}
    }])
.controller("lostController",["$scope","$state","user","views","community",function($scope,$state,user,views,community)
    {
	$scope.mail=user.mail;
	$scope.lost=function()
		{		
		community.sendPsw({mail:this.mail});
		}
	$scope.register=function()
		{
		$state.go(views.register);
		}
	$scope.login=function()
		{		
		$state.go(views.login);
		}
    }])
.controller("profileController",["$scope","$state","user","views","upload",function($scope,$state,user,views,upload)
    {
	angular.extend($scope,user);
	$scope.changeBackground=function()
		{				
		upload.upload().then(null,null,function(e)
			{
			user.background=e;
			$scope.background=e;
			});		
		}
	$scope.changeAvatar=function()
		{		
		upload.upload().then(null,null,function(e)
			{			
			user.img=e;
			$scope.img=e;
			});				
		}
	$scope.logout=function()
		{
		user.logged=false;
		user.mail=null;
		$state.go(views.login);
		}
	$scope.register=function()
		{
		$state.go(views.register);
		}
	$scope.login=function()
		{		
		$state.go(views.login);
		}
    }])
.controller("confirmController",["$scope","$state","user","views","community",function($scope,$state,user,views,community)
    {	
	$scope.confirm=function()
		{				
		community.login({mail:$state.params.mail,psw: $state.params.psw},function(data)
			{			
			$state.go(views.profile)
			});
		}
	$scope.register=function()
		{
		$state.go(views.register);
		}
	$scope.login=function()
		{		
		$state.go(views.login);
		}
    }])
.controller("loginController",["$scope","$state","user","views","community","loading",function($scope,$state,user,views,community,loading)
	{		
	$scope.lost=function()
		{		
		user.mail=$scope.mail;
		$state.go(views.lost)
		}
	$scope.register=function()
		{
		user.mail=$scope.mail;
		$state.go(views.register)
		}
	$scope.login=function()
		{
		loading.show();
		community.login({mail:this.mail,psw: this.psw},function(data)
			{			
			loading.hide();
			$state.go(views.profile)
			});		
		}
	}])
.run(["community",function(community)
    {
	community.autoLogin();
	//debugger;
    }])
	/*
.directive('equals', function() {
	  return {
	    restrict: 'A', // only activate on element attribute
	    require: '?ngModel', // get a hold of NgModelController
	    link: function(scope, elem, attrs, ngModel) {
	      if(!ngModel) return; // do nothing if no ng-model

	      // watch own value and re-validate on change
	      scope.$watch(attrs.ngModel, function() {
	        validate();
	      });

	      // observe the other value and re-validate on change
	      attrs.$observe('equals', function (val) {
	        validate();
	      });

	      var validate = function() {
	        // values
	        var val1 = ngModel.$viewValue;
	        var val2 = attrs.equals;
	        // set validity
	        ngModel.$setValidity('equals', ! val1 || ! val2 || val1 === val2);
	      };
	    }
	  }
	});*/
