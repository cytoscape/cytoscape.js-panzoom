cytoscape.js-panzoom
====================

## Description

This plugin creates a widget that lets the user pan and zoom about a Cytoscape.js graph.  This complements the built-in gesture support in Cytoscape.js to pan and zoom by giving less savvy users a more traditional UI -- similar to controls on map webapps.


## Dependencies

 * jQuery >=1.4
 * Cytoscape.js >=2.0
 * Font Awesome 4 (for automatic icons), or you can specify your own class names for icons


## Initialisation

You initialise the plugin on the same HTML DOM element container used for Cytoscape.js:

```js

$('#cy').cytoscape({
	/* ... */
});

// the default values of each option are outlined below:
$('#cy').cytoscapePanzoom({
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

```