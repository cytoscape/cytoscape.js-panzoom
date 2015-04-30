cytoscape.js-panzoom
====================

![Preview](https://raw.githubusercontent.com/cytoscape/cytoscape.js-panzoom/master/img/preview.png)

## Description

This plugin creates a widget that lets the user pan and zoom about a Cytoscape.js graph.  This complements the built-in gesture support for panning and zooming in Cytoscape.js by giving less savvy users a more traditional UI -- similar to controls on map webapps.

Note that because this plugin is unnecessary on touch devices due to natural gesture support, it is disabled by default on touch devices.  The plugin wouldn't be very useful anyway on touch, because small targets are much harder to use than gestures that can be used anywhere.  As such, the plugin is untested on touch and would probably either need a library like [fastclick](https://github.com/ftlabs/fastclick) or reworking of its event handlers to work.


## Dependencies

 * jQuery >=1.4
 * Cytoscape.js >=2.0
 * Font Awesome 4 (for automatic icons), or you can specify your own class names for icons


## Initialisation

```js

var cy = cytoscape({
	container: document.getElementById('cy')
	/* ... */
});

// the default values of each option are outlined below:
var defaults = ({
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
	sliderHandleIcon: 'fa fa-minus',
	zoomInIcon: 'fa fa-plus',
	zoomOutIcon: 'fa fa-minus',
	resetIcon: 'fa fa-expand'
});

cy.panzoom( defaults );

// or via jquery
// $('#cy').cytoscapePanzoom( defaults );

```