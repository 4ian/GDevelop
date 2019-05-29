(function() {
  	var createModule = function(options) {
		var Module = options || {};

		// Setup 80Mb for memory by default.
		Module.TOTAL_MEMORY = Module.TOTAL_MEMORY || 83886080;

		//Prevent Emscripten to bind its Module to Node's module. We take care of exposing
		//the Module by ourselves (see post.js).
		var module;
	    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	        var module = {
	        	exports: {}
	        };
	    } else {
	        module = undefined;
	    }

		/*Emscripten generated-code for Module will be inserted here*/
