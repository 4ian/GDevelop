var gd = require('../../Binaries/Output/WebIDE/Release/libGD.js');
var expect = require('expect.js');

describe('libGD.js - GDJS related tests', function(){
	//gd.initializePlatforms();

	describe('EventsCodeGenerator', function(){

		var project = gd.ProjectHelper.createNewGDJSProject();
		var layout = project.insertNewLayout("Scene", 0);

		var evt = layout.getEvents().insertNewEvent(project, "BuiltinCommonInstructions::Repeat", 0);
		gd.asRepeatEvent(evt).setRepeatExpression("5+4+3+2+1");
		var instr = new gd.Instruction();
		instr.setType("BuiltinCommonInstructions::Once");
		gd.asRepeatEvent(evt).getConditions().push_back(instr);

		var code = gd.GenerateSceneEventsCompleteCode(project, layout, layout.getEvents(), new gd.SetString(), true);
		expect(code).to.match(/(context.triggerOnce)/);

		instr.delete();
	});
});

