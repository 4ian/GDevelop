/**
 * This is an example of some functions that can be used through events.
 * They could live on any object but it's usual to store them in an object
 * with the extension name in `gdjs.evtTools`.
 * 
 * Functions are being passed the arguments that were declared in the extension.
 * 
 * @namespace gdjs.evtTools
 * @class exampleJsExtension
 * @static
 * @private
 */
gdjs.evtTools.exampleJsExtension = {};

gdjs.evtTools.exampleJsExtension.myConditionFunction = function(number, text) {
	return (number == < 10 && text.length < 5);
};

gdjs.evtTools.exampleJsExtension.getString = function() {
	return "Hello World";
};