angular.module('myapp',["ngRoute","ngResource","angularFileUpload","taggable"]).
  config(['$routeProvider', 
  	function($routeProvider) 
  		{
    	$routeProvider    		
    		.when('/login', {templateUrl: 'views/login.html'})
    		.when('/shot', {templateUrl: 'views/shot.html'})
    		.when('/list', {templateUrl: 'views/list.html',	controller:'aroundmeController'})
    		.when('/404',{templateUrl: 'views/pages/404.html'})
    		.otherwise({redirectTo: '/list'});
    	}]
  )