angular.module("ngCommunity",[])
.constant("views",{
	profile:"communityProfile",
	register:"communityRegister",
	login:"communityLogin",
	lost:"communityLost",
	confirm:"communityConfirm"
	})
.value("community_url","localhost:8080")
.value("user",{logged:false})
.config(function($stateProvider, $urlRouterProvider,$httpProvider) 
	{
	$httpProvider.defaults.headers.common["X-Requested-With"]="valore";
	$stateProvider
	 .state('communityConfirm', 
		{			
		templateUrl: "/views/community/confirm.html",
		params:["mail","psw"],
		controller:"confirmController"
		})
	 .state('communityLost', 
		{			
		templateUrl: "/views/community/resetPsw.html",
		controller:"lostController"
		})
	  .state('communityLogin', 
		{			
		templateUrl: "/views/community/login.html",
		controller:"loginController"
		})
	 .state('communityRegister', 
		{
		url: "/register",
		templateUrl: "/views/community/register.html",
		controller:"registerController"
		})
	.state('communityProfile', 
		{			
		templateUrl: "/views/community/profile.html",
		controller:"profileController"
		})
	})
.factory("community",["$resource","user","$state","community_url",function($resource,user,$state,community_url)
	{				
	var community = $resource(
			"http://"+community_url+"/community/user/:id",{id:"@id"},
			{
			login:
				{
				method:'GET',
				params:{mail:'',psw:''},
				url:'http://'+community_url+'/community/login',
				responseType:'json',
				transformResponse:function(data)
					{		
					if(data==null) return;
					data.background='http://www.italyluxurytours.com/italy-guide/images/art.jpg';
					data.img = 'https://lh5.googleusercontent.com/-tgoExjOkcX0/AAAAAAAAAAI/AAAAAAAAAAA/wEyTqkqK-T8/photo.jpg';					
					
					angular.extend(user,data);
					angular.extend(user,user.data);
					
					localStorage.setItem("jwt", user.jwt);
					user.logged=true;
					}
				},
			register:
				{
				method:'POST',
				url:'http://'+community_url+'/community/register',
				responseType:'json'				
				},
			sendPsw:
				{
				method:'GET',
				url:'http://'+community_url+'/community/:mail/sendPsw',
				params:{mail:''},
				responseType:'json'
				}
			});
	community.autoLogin=function()
		{
		var jwt = localStorage.getItem("jwt");
		$.get("http://"+community_url+"/community/jwt",{jwt:jwt}).then(function(data)
			{				
			user.background='http://www.italyluxurytours.com/italy-guide/images/art.jpg';
			user.img = 'https://lh5.googleusercontent.com/-tgoExjOkcX0/AAAAAAAAAAI/AAAAAAAAAAA/wEyTqkqK-T8/photo.jpg';
			user.logged=true;
			angular.extend(user,data);
			angular.extend(user,user.data);
			
			$state.go($state.current, {}, {reload: true});			
			},function(){
			//$state.go($state.current, {}, {reload: true});
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
			},function()
			{
			loading.hide();
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
