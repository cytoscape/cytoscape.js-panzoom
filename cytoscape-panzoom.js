;(function(){ 'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape, $ ){
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    $.fn.cyPanzoom = $.fn.cytoscapePanzoom = function( options ){
      panzoom.apply( this, [ options ] );
            
      return this; // chainability
    };

    // if you want a core extension
    cytoscape('core', 'panzoom', function( options ){ // could use options object, but args are up to you
      var cy = this;

      panzoom.apply( cy.container(), [ options ] );

      return this; // chainability
    });

  };
  
  var defaults = {
    zoomFactor: 0.05, // zoom factor per zoom tick
    zoomDelay: 45, // how many ms between zoom ticks
    minZoom: 0.1, // min zoom level
    maxZoom: 10, // max zoom level
    fitPadding: 50, // padding when fitting
    panSpeed: 10, // how many ms in between pan ticks
    panDistance: 10, // max pan distance per tick
    panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
    panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
    panInactiveArea: 8, // radius of inactive area in pan drag box
    panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
    autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)
    
    // icon class names
    zoomInIcon: 'fa fa-plus-square-o',
    zoomOutIcon: 'fa fa-minus-square-o',
    resetIcon: 'fa fa-refresh',
    panIcon: 'fa fa-compass'
  };
  
  var panzoom = function(params){
    var options = $.extend(true, {}, defaults, params);
    var fn = params;
    
    var functions = {
      destroy: function(){
        var $this = $(this);
        
        $this.find(".ui-cytoscape-panzoom").remove();
      },
        
      init: function(){
        var browserIsMobile = 'ontouchstart' in window;
        
        if( browserIsMobile && options.autodisableForMobile ){
          return $(this);
        }
        
        return $(this).each(function(){
          var $container = $(this);
          
          var $panzoom = $('<div class="ui-cytoscape-panzoom"></div>');
          $container.append( $panzoom );
          
          if( options.staticPosition ){
            $panzoom.addClass("ui-cytoscape-panzoom-static");
          }
          
          // add base html elements
          /////////////////////////
          
          var $pHandle = $('<div class="ui-cytoscape-panzoom-panner-handle"></div>');
	          var $pIndicator = $('<div class="ui-cytoscape-panzoom-pan-indicator"><i class="fa fa-circle"></i></div>');
	          var $panner = $('<div class="ui-cytoscape-panzoom-panner"><i class="' + options.panIcon + '"></i></div>');
	          $pHandle.append($pIndicator).append($panner);
          
          var $zoomer = $('<div class="ui-cytoscape-panzoom-zoomer"></div>')
	          var $slider = $('<div class="ui-cytoscape-panzoom-slider"></div>');
		          var $sliderHandle = $('<div class="ui-cytoscape-panzoom-slider-handle">&nbsp;</div>');
		          $slider.append( $sliderHandle );
	 
	          var $reset = $('<div class="ui-cytoscape-panzoom-reset"><i class="' + options.resetIcon + '"></i></div>');
	          var $zoomIn = $('<div class="ui-cytoscape-panzoom-zoom-in"><i class="' + options.zoomInIcon + '"></i></div>');
	          var $zoomOut = $('<div class="ui-cytoscape-panzoom-zoom-out"><i class="' + options.zoomOutIcon + '"></i></div>');         
          
	          $zoomer.append( $reset ).append($zoomIn).append($slider).append($zoomOut);
   
          $panzoom.append( $pHandle );    
//          $panzoom.append( $panner );
          $panzoom.append( $zoomer );
           
          // functions for calculating panning
          ////////////////////////////////////

          function handle2pan(e){
            var v = {
              x: e.originalEvent.pageX - $pHandle.offset().left - $pHandle.width()/2,
              y: e.originalEvent.pageY - $pHandle.offset().top - $pHandle.height()/2
            }
            
            var r = options.panDragAreaSize;
            var d = Math.sqrt( v.x*v.x + v.y*v.y );
            var percent = Math.min( d/r, 1 );
            
            if( d < options.panInactiveArea ){
              return {
                x: NaN,
                y: NaN
              };
            }
            
            v = {
              x: v.x/d,
              y: v.y/d
            };
            
            percent = Math.max( options.panMinPercentSpeed, percent );
            
            var vnorm = {
              x: v.x * (percent * options.panDistance),
              y: v.y * (percent * options.panDistance)
            };
            
            return vnorm;
          }
          
          function donePanning(){
            clearInterval(panInterval);
            $(window).unbind("mousemove", handler);
            
            $pIndicator.hide();
          }
          
          function positionIndicator(pan){
            var v = pan;
            var d = Math.sqrt( v.x*v.x + v.y*v.y );
            var vnorm = {
              x: v.x/d,
              y: v.y/d
            };
            
            var w = $pHandle.width();
            var h = $pHandle.height();
            var percent = d/options.panDistance;

            $pIndicator.show().css({
              left: w/2 * vnorm.x + w/2,
              top: h/2 * vnorm.y + h/2
            });
          }
          
          function calculateZoomCenterPoint(){
            var cy = $container.cytoscape("get");
            var pan = cy.pan();
            var zoom = cy.zoom();

            zx = $container.width()/2;
            zy = $container.height()/2;
          }

          var zooming = false;
          function startZooming(){
            zooming = true;

            calculateZoomCenterPoint();
          }


          function endZooming(){
            zooming = false;
          }

          var zx, zy;
          function zoomTo(level){
            var cy = $container.cytoscape("get");

            if( !zooming ){ // for non-continuous zooming (e.g. click slider at pt)
              calculateZoomCenterPoint();
            }

            cy.zoom({
              level: level,
              renderedPosition: { x: zx, y: zy }
            });
          }

          var panInterval;
          
          var handler = function(e){
            e.stopPropagation(); // don't trigger dragging of panzoom
            e.preventDefault(); // don't cause text selection
            clearInterval(panInterval);
            
            var pan = handle2pan(e);
            
            if( isNaN(pan.x) || isNaN(pan.y) ){
              $pIndicator.hide();
              return;
            }
            
            positionIndicator(pan);
            panInterval = setInterval(function(){
              $container.cytoscape("get").panBy(pan);
            }, options.panSpeed);
          };
          
          $pHandle.bind("mousedown", function(e){
            // handle click of icon
            handler(e);
            
            // update on mousemove
            $(window).bind("mousemove", handler);
          });
          
          $pHandle.bind("mouseup", function(){
            donePanning();
          });
          
          $(window).bind("mouseup blur", function(){
            donePanning();
          });
          


          // set up slider behaviour
          //////////////////////////

          $slider.bind('mousedown', function(){
            return false; // so we don't pan close to the slider handle
          });

          var sliderVal;
          var sliding = false;
          var sliderPadding = 2;

          function setSliderFromMouse(evt, handleOffset){
            if( handleOffset === undefined ){
              handleOffset = 0;
            }

            var padding = sliderPadding;
            var min = 0 + padding;
            var max = $slider.height() - $sliderHandle.height() - 2*padding;
            var top = evt.pageY - $slider.offset().top - handleOffset;

            // constrain to slider bounds
            if( top < min ){ top = min }
            if( top > max ){ top = max }

            var percent = 1 - (top - min) / ( max - min );

            // move the handle
            $sliderHandle.css('top', top);

            var zmin = options.minZoom;
            var zmax = options.maxZoom;

            // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
            var x = Math.log(zmin) / Math.log(zmax);
            var p = (1 - x)*percent + x;

            // change the zoom level
            var z = Math.pow( zmax, p );

            // bound the zoom value in case of floating pt rounding error
            if( z < zmin ){
              z = zmin;
            } else if( z > zmax ){
              z = zmax;
            }

            zoomTo( z );
          }

          var sliderMdownHandler, sliderMmoveHandler;
          $sliderHandle.bind('mousedown', sliderMdownHandler = function( mdEvt ){
            var handleOffset = mdEvt.target === $sliderHandle[0] ? mdEvt.offsetY : 0;
            sliding = true;

            startZooming();
            $sliderHandle.addClass("active");

            var lastMove = 0;
            $(window).bind('mousemove', sliderMmoveHandler = function( mmEvt ){
              var now = +new Date;

              // throttle the zooms every 10 ms so we don't call zoom too often and cause lag
              if( now > lastMove + 10 ){
                lastMove = now;
              } else {
                return false;
              }

              setSliderFromMouse(mmEvt, handleOffset);

              return false;
            });

            // unbind when 
            $(window).bind('mouseup', function(){
              $(window).unbind('mousemove', sliderMmoveHandler);
              sliding = false;

              $sliderHandle.removeClass("active");
              endZooming();
            });

            return false;
          });				
        
          $slider.bind('mousedown', function(e){
            if( e.target !== $sliderHandle[0] ){
              sliderMdownHandler(e);
              setSliderFromMouse(e);
            }
          });

          function positionSliderFromZoom(){
            var cy = $container.cytoscape("get");
            var z = cy.zoom();
            var zmin = options.minZoom;
            var zmax = options.maxZoom;
            
            // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
            var x = Math.log(zmin) / Math.log(zmax);
            var p = Math.log(z) / Math.log(zmax);
            var percent = 1 - (p - x) / (1 - x); // the 1- bit at the front b/c up is in the -ve y direction

            var min = sliderPadding;
            var max = $slider.height() - $sliderHandle.height() - 2*sliderPadding;
            var top = percent * ( max - min );

            // constrain to slider bounds
            if( top < min ){ top = min }
            if( top > max ){ top = max }

            // move the handle
            $sliderHandle.css('top', top);
          }

          positionSliderFromZoom();

          var cy = $container.cytoscape("get");
          cy.on('zoom', function(){
            if( !sliding ){
              positionSliderFromZoom();
            }
          });

          // set the position of the zoom=1 tick
          (function(){
            var z = 1;
            var zmin = options.minZoom;
            var zmax = options.maxZoom;
            
            // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
            var x = Math.log(zmin) / Math.log(zmax);
            var p = Math.log(z) / Math.log(zmax);
            var percent = 1 - (p - x) / (1 - x); // the 1- bit at the front b/c up is in the -ve y direction
            
//            if( percent > 1 || percent < 0 ){
//              $noZoomTick.hide();
//              return;
//            }

            var min = sliderPadding;
            var max = $slider.height() - $sliderHandle.height() - 2*sliderPadding;
            var top = percent * ( max - min );

            // constrain to slider bounds
            if( top < min ){ top = min }
            if( top > max ){ top = max }

//            $noZoomTick.css('top', top);
          })();

          // set up zoom in/out buttons
          /////////////////////////////

          function bindButton($button, factor){
            var zoomInterval;

            $button.bind("mousedown", function(e){
              e.preventDefault();
              e.stopPropagation();
              
              if( e.button != 0 ){
                return;
              }

              var cy = $container.cytoscape("get");
              var doZoom = function(){
                var zoom = cy.zoom();
                var lvl = cy.zoom() * factor;
                
                if( lvl < options.minZoom ){
                  lvl = options.minZoom;
                }
                
                if( lvl > options.maxZoom ){
                  lvl = options.maxZoom;
                }
                
                if( (lvl == options.maxZoom && zoom == options.maxZoom) ||
                  (lvl == options.minZoom && zoom == options.minZoom)
                ){
                  return;
                }
                
                zoomTo(lvl);
              };

              startZooming();
              doZoom();
              zoomInterval = setInterval(doZoom, options.zoomDelay);
              
              return false;
            });
            
            $(window).bind("mouseup blur", function(){
              clearInterval(zoomInterval);
              endZooming();
            });
          }
          
          bindButton( $zoomIn, (1 + options.zoomFactor) );
          bindButton( $zoomOut, (1 - options.zoomFactor) );
          
          $reset.bind("mousedown", function(e){
            if( e.button != 0 ){
              return;
            }
            
            var cy = $container.cytoscape("get");

            if( cy.elements().size() === 0 ){
              cy.reset();
            } else {
              cy.fit( options.fitPadding );
            }

            return false;
          });
          
          
          
        });
      }
    };
    
    if( functions[fn] ){
      return functions[fn].apply(this, Array.prototype.slice.call( arguments, 1 ));
    } else if( typeof fn == 'object' || !fn ) {
      return functions.init.apply( this, arguments );
    } else {
      $.error("No such function `"+ fn +"` for jquery.cytoscapePanzoom");
    }
    
    return $(this);
  };


  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-panzoom', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape, jQuery || {} );
  }

})();

