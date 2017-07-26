cytoscape-panzoom
================================================================================
[![DOI](https://zenodo.org/badge/16007634.svg)](https://zenodo.org/badge/latestdoi/16007634)

![Preview](https://raw.githubusercontent.com/cytoscape/cytoscape.js-panzoom/master/img/preview.png)

## Description

This extension creates a widget that lets the user pan and zoom about a Cytoscape.js graph.  This complements the built-in gesture support for panning and zooming in Cytoscape.js by giving less savvy users a more traditional UI -- similar to controls on map webapps.


## Dependencies

 * jQuery ^1.4 || ^2.0 || ^3.0
 * Cytoscape.js ^2.0.0 || ^3.0.0
 * Font Awesome 4 (for automatic icons), or you can specify your own class names for icons


## Usage instructions

Download the library:

 * via npm: `npm install cytoscape-panzoom`,
 * via bower: `bower install cytoscape-panzoom`, or
 * via direct download in the repository (probably from a tag).

`require()` the library as appropriate for your project:

CommonJS:
```js
var cytoscape = require('cytoscape');
var panzoom = require('cytoscape-panzoom');

panzoom( cytoscape ); // register extension
```

AMD:
```js
require(['cytoscape', 'jquery', 'cytoscape-panzoom'], function( cytoscape, $, panzoom ){
  panzoom( cytoscape, $ ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

```js
// the default values of each option are outlined below:
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
  zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
  fitSelector: undefined, // selector of elements to fit
  animateOnFit: function(){ // whether to animate on fit
    return false;
  },
  fitAnimationDuration: 1000, // duration of animation on fit

  // icon class names
  sliderHandleIcon: 'fa fa-minus',
  zoomInIcon: 'fa fa-plus',
  zoomOutIcon: 'fa fa-minus',
  resetIcon: 'fa fa-expand'
};

cy.panzoom( defaults );
```


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Set the version number environment variable: `export VERSION=1.2.3`
1. Publish: `gulp publish`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-panzoom https://github.com/cytoscape/cytoscape.js-panzoom.git`
1. Make a release on GitHub to automatically register a new Zenodo DOI
