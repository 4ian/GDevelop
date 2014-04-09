var gd = require('../../Binaries/Output/WebIDE/Release/libGD.js');
var expect = require('expect.js');

describe('libGD.js - GDJS related tests', function(){
	//gd.initializePlatforms();

	describe('EventsCodeGenerator', function(){

		var project = gd.ProjectHelper.createNewGDJSProject();
		var layout = project.insertNewLayout("Scene", 0);

		var evt = new gd.StandardEvent();
		layout.getEvents().push_back(evt);

		var code = gd.GenerateSceneEventsCompleteCode(project, layout, layout.getEvents(), new gd.SetString(), true);
		console.log(code);
	});
});

