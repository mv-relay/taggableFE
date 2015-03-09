angular.module("ngBase",["ngResource"])
.directive('cache', ["base64",function (base64) 
    {
    return {      
      restrict: 'A',
      link:function(scope, iElm, iAttrs)
      	{    	
    	var src = scope.$eval(iAttrs.src);
    	iAttrs.$set('src',src);    	
    	if(src.substring(0,5)=="data:") return;
    	console.log("img");
    	iAttrs.$set('src',"");
    	base64.convert(src).then(function(data)
    		{
    		iAttrs.$set('src',data);
    		scope.item.img=data;
    		})    	
      	},      
    };
  	}])
.directive('sbLoad', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var fn = $parse(attrs.sbLoad);
        elem.on('load', function (event) {
          scope.$apply(function() {
            fn(scope, { $event: event });
          });
        });
      }
    };
  }])
.directive('headerShrink', function($document) {
	  var fadeAmt;

	  var shrink = function(header, content, amt, max) {
	    amt = Math.min(44, amt);
	    fadeAmt = 1 - amt / 44;
	    ionic.requestAnimationFrame(function() {
	      header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + amt + 'px, 0)';
	      for(var i = 0, j = header.children.length; i < j; i++) {
	        header.children[i].style.opacity = fadeAmt;
	      }
	    });
	  };

	  return {
	    restrict: 'A',
	    link: function($scope, $element, $attr) {
	      var starty = $scope.$eval($attr.headerShrink) || 0;
	      var shrinkAmt;
	      
	      var header = $document[0].body.querySelector('.nav-bar');
	      var headerHeight = header.offsetHeight;
	      
	      $element.bind('scroll', function(e) {	    	  
	        var scrollTop = null;
	        if(e.detail)
	          scrollTop = e.detail.scrollTop;
	        else if(e.target)
	          scrollTop = e.target.scrollTop;	        
	        if(scrollTop > starty)
	        	{
	        	// Start shrinking	        	
	        	shrinkAmt = headerHeight - Math.max(0, (starty + headerHeight) - scrollTop);
	        	shrink(header, $element[0], shrinkAmt, headerHeight);
	        	} 
	        else 
	          shrink(header, $element[0], 0, headerHeight);	        
	      });
	    }
	  }
	})
.directive('focusOn', function ($timeout) 
	{	
    return {
        link: function(scope, element, attrs) 
        	{           	
            scope.$watch(attrs.focusOn, function(newValue)
            	{            	                        	
                if (newValue) 
                	{
                    $timeout(function(){$(element).focus();});                    
                	}
            	});
        	}
     	};
	})
.value("config",
	{
	name:"inArt",
	data:{}
	})
.factory("configurations",["$resource",function($resource)
   {	
   return $resource("http://95.110.224.34:8080/relay-service-web/rest/land/config/:id",{id:'@id'})
   }])
.service("loading",["$ionicLoading",function($ionicLoading)
    {
	this.hide=function()
		{
		$ionicLoading.hide();
		}
	this.show=function()
		{				
		$ionicLoading.show();
		}
    }])
.service("popup",["$ionicPopup",function($ionicPopup)
	{
	this.open=false;
	this.alert=function(title,msg)
		{
		var act = this;
		
		if(this.open==true) return;
		this.open=true;
		$ionicPopup.alert({title:title,template:msg}).then(function(){act.open=false;});;
		}
	this.show=function(title,msg,buttons)
		{				
		$ionicPopup.alert({title:title,template:msg,buttons:buttons})
		}
	}])
.service("base64",["$q",function($q)
   {
	this.convert=function(url)
		{
		var deferred = $q.defer();
		var canvas = document.createElement('CANVAS'),
	        ctx = canvas.getContext('2d'),
	        img = new Image();
		img.crossOrigin = 'Anonymous';
	    img.onload = function()
	    	{
	        var dataURL;
	        canvas.height = img.height;
	        canvas.width = img.width;
	        ctx.drawImage(img, 0, 0);
	        dataURL = canvas.toDataURL("base64");
	        deferred.resolve(dataURL);
	        canvas = null; 
	    	};
	    img.src = url;
		
		return deferred.promise;
		}	
   }])
.run(["configurations","config",function(configurations,config)
   {		
   console.log("configurations....");   
   configurations.get({id:config.name},function(data)
		   {
	   		console.log("...configurations OK");
	   		
	   		config["data"]=JSON.parse(data.attributes);
	   		})
	   		
   }])