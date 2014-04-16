var gd = require('../../Binaries/Output/WebIDE/Release/libGD.js');
var expect = require('expect.js');

describe('libGD.js', function(){
	gd.initializePlatforms();

	describe('gd.Project', function(){

		var project = gd.ProjectHelper.createNewGDJSProject();

		it('properties can be read and changed', function(){
			project.setName("My super project");
			expect(project.getName()).to.be("My super project");
			project.setAuthor("Me");
			expect(project.getAuthor()).to.be("Me");
			project.setMaximumFPS(15);
			expect(project.getMaximumFPS()).to.be(15);
			project.setMinimumFPS(15);
			expect(project.getMinimumFPS()).to.be(15);
		});
		it('layouts management is ok', function(){
			expect(project.hasLayoutNamed("Scene")).to.be(false);

			project.insertNewLayout("Scene", 0);
			expect(project.hasLayoutNamed("Scene")).to.be(true);
			expect(project.getLayout("Scene").getName()).to.be("Scene");

			project.removeLayout("Scene");
			expect(project.hasLayoutNamed("Scene")).to.be(false);
		});

		after(function() { project.delete(); });
	});

	describe('gd.Layout', function(){
		var project = gd.ProjectHelper.createNewGDJSProject();
		var layout = project.insertNewLayout("Scene", 0);

		it('properties can be read and changed', function(){
			expect(layout.getName()).to.be("Scene");
			layout.setName("My super layout");
			expect(layout.getName()).to.be("My super layout");
		});
		it('events', function() {
			var evts = layout.getEvents();
			expect(evts.getEventsCount()).to.be(0);
			var evt = evts.insertNewEvent(project, "BuiltinCommonInstructions::Standard", 0);
			expect(evts.getEventsCount()).to.be(1);
			evt.getSubEvents().insertNewEvent(project, "BuiltinCommonInstructions::Standard", 0);
			expect(evts.getEventAt(0).getSubEvents().getEventsCount()).to.be(1);
		});
		//TODO

		after(function() { project.delete(); });
	});

	describe('gd.InitialInstancesContainer', function(){
		var container = new gd.InitialInstancesContainer();

		it('initial state', function(){
			expect(container.getInstancesCount()).to.be(0);
		});
		it('adding instances', function() {
			var instance = container.insertNewInitialInstance();
			instance.setObjectName("MyObject");
			instance.setZOrder(10);

			var instance2 = new gd.InitialInstance();
			instance2.setObjectName("MyObject2");
			instance2 = container.insertInitialInstance(instance2);

			var instance3 = container.insertNewInitialInstance();
			instance3.setObjectName("MyObject3");
			instance3.setZOrder(-1);
			instance3.setLayer("OtherLayer");

			expect(container.getInstancesCount()).to.be(3);
		});
		it('iterating', function() {
			var i = 0;
			var functor = {
				invoke:function(instance){
					expect((i === 0 && instance.getObjectName() === "MyObject") ||
						(i === 1 && instance.getObjectName() === "MyObject2") ||
						(i === 2 && instance.getObjectName() === "MyObject3")).to.be(true);
					i++;
				}
			};
			container.iterateOverInstances(gd.InitialInstanceFunctor.implement(functor));
		});
		it('iterating with z ordering', function() {
			var i = 0;
			var functor = {
				invoke:function(instance){
					expect((i === 0 && instance.getObjectName() === "MyObject2") ||
						(i === 1 && instance.getObjectName() === "MyObject")).to.be(true);
					i++;
				}
			};
			container.iterateOverInstancesWithZOrdering(gd.InitialInstanceFunctor.implement(functor), "");
		});
		it('moving from layers to another', function() {
			container.moveInstancesToLayer("OtherLayer", "YetAnotherLayer");

			var functor = {
				invoke:function(instance){
					expect(instance.getObjectName()).to.be("MyObject3");
				}
			};
			container.iterateOverInstancesWithZOrdering(gd.InitialInstanceFunctor.implement(functor), "YetAnotherLayer");
		});
		it('removing instances', function() {
			container.removeInitialInstancesOfObject("MyObject");
			expect(container.getInstancesCount()).to.be(2);
		});
		it('removing instances on a layer', function() {
			container.removeAllInstancesOnLayer("YetAnotherLayer");
			expect(container.getInstancesCount()).to.be(1);
		});

		after(function() { container.delete(); })
	});

	describe('gd.InitialInstance', function(){
		var project = gd.ProjectHelper.createNewGDJSProject();
		var layout = project.insertNewLayout("Scene", 0);
		layout.insertNewObject(project, "Sprite", "MySpriteObject", 0);
		var initialInstance = layout.getInitialInstances().insertNewInitialInstance();

		it('properties', function(){
			initialInstance.setObjectName("MySpriteObject");
			expect(initialInstance.getObjectName()).to.be("MySpriteObject");
			initialInstance.setX(150);
			expect(initialInstance.getX()).to.be(150);
			initialInstance.setY(140);
			expect(initialInstance.getY()).to.be(140);
			initialInstance.setAngle(45);
			expect(initialInstance.getAngle()).to.be(45);
			initialInstance.setZOrder(12);
			expect(initialInstance.getZOrder()).to.be(12);
			initialInstance.setLayer("MyLayer");
			expect(initialInstance.getLayer()).to.be("MyLayer");
			initialInstance.setLocked(true);
			expect(initialInstance.isLocked()).to.be(true);
			initialInstance.setHasCustomSize(true);
			expect(initialInstance.hasCustomSize()).to.be(true);
			initialInstance.setCustomWidth(34);
			expect(initialInstance.getCustomWidth()).to.be(34);
			initialInstance.setCustomHeight(30);
			expect(initialInstance.getCustomHeight()).to.be(30);
		});
		it('custom properties', function(){
			initialInstance.updateCustomProperty("Animation", "2", project, layout);
			expect(initialInstance.getCustomProperties(project, layout).get("Animation").getValue()).
				to.be("2");
		});

		after(function(){ project.delete(); });
	});

	describe('gd.VariablesContainer', function(){
		it('container is empty after being created', function(){
			var container = new gd.VariablesContainer();

			expect(container.has("Variable")).to.be(false);
			expect(container.count()).to.be(0);
			container.delete();
		});
		it('can insert variables', function(){
			var container = new gd.VariablesContainer();

			container.insertNew("Variable", 0);
			expect(container.has("Variable")).to.be(true);
			expect(container.count()).to.be(1);

			container.insertNew("SecondVariable", 0);
			expect(container.has("SecondVariable")).to.be(true);
			expect(container.count()).to.be(2);
			container.delete();
		});
		it('can rename variables', function(){
			var container = new gd.VariablesContainer();

			container.insertNew("Variable", 0);
			container.insertNew("SecondVariable", 0).setString("String of SecondVariable");
			container.insertNew("ThirdVariable", 0);

			expect(container.has("SecondVariable")).to.be(true);
			expect(container.has("NewName")).to.be(false);
			container.rename("SecondVariable", "NewName");
			expect(container.has("SecondVariable")).to.be(false);
			expect(container.has("NewName")).to.be(true);

			expect(container.get("NewName").getString()).to.be("String of SecondVariable");
			container.delete();
		});
		it('can reorganize variables', function(){
			var container = new gd.VariablesContainer();

			container.insertNew("Variable", 0).setValue(4);
			container.insertNew("SecondVariable", 1).setString("String of SecondVariable");
			container.insertNew("ThirdVariable", 2).getChild("Child1").setValue(7);

			expect(container.getAt(0).getName()).to.be("Variable");
			expect(container.getAt(2).getName()).to.be("ThirdVariable");

			container.swap(0, 2);
			expect(container.getAt(0).getName()).to.be("ThirdVariable");
			expect(container.getAt(2).getName()).to.be("Variable");
			expect(container.getAt(2).getVariable().getValue()).to.be(4);
			container.delete();
		});
	});

	describe('gd.Variable', function(){
		var variable = new gd.Variable();

		it('initial value', function(){
			expect(variable.getValue()).to.be(0);
			expect(variable.isNumber()).to.be(true);
		});
		it('value', function(){
			variable.setValue(5);
			expect(variable.getValue()).to.be(5);
			expect(variable.isNumber()).to.be(true);
		});
		it('string', function(){
			variable.setString("Hello");
			expect(variable.getString()).to.be("Hello");
			expect(variable.isNumber()).to.be(false);
		});
		it('structure', function(){
			variable.getChild("FirstChild").setValue(1);
			variable.getChild("SecondChild").setString("two");
			expect(variable.hasChild("FirstChild")).to.be(true);
			expect(variable.hasChild("SecondChild")).to.be(true);
			expect(variable.hasChild("NotExisting")).to.be(false);
			expect(variable.getChild("SecondChild").getString()).to.be("two");
			variable.removeChild("FirstChild");
			expect(variable.hasChild("FirstChild")).to.be(false);
		});

		after(function() {variable.delete();});
	});

	describe('gd.Object', function(){
		var project = gd.ProjectHelper.createNewGDJSProject();
		var layout = project.insertNewLayout("Scene", 0);
		var object = layout.insertNewObject(project, "Sprite", "MyObject", 0);
		it('properties and initial values', function() {
			object.setName("TheObject");
			expect(object.getName()).to.be("TheObject");
			expect(object.hasAutomatismNamed("DoNotExists")).to.be(false);
		});
		//TODO

		after(function() {project.delete();});
	});
	describe('gd.Automatism', function(){
		var project = gd.ProjectHelper.createNewGDJSProject();
		var automatism = new gd.Automatism();

		it('properties and initial values', function() {
			automatism.setName("MyAutomatism");
			expect(automatism.getName()).to.be("MyAutomatism");
			expect(automatism.getTypeName()).to.be("");
		});
		it('update a not existing property', function() {
			expect(automatism.updateProperty("PropertyThatDoesNotExist", "MyValue", project)).to.be(false);
		});
		//TODO

		after(function() {
			automatism.delete();
			project.delete();
		});
	});

	describe('gd.Instruction', function(){
		var instr = new gd.Instruction();

		it('initial values', function(){
			expect(instr.getParametersCount()).to.be(0);
			expect(instr.getSubInstructions().size()).to.be(0);
		});
		it('setting parameters', function(){
			instr.setParametersCount(3);
			expect(instr.getParametersCount()).to.be(3);
			expect(instr.getParameter(1)).to.be("");
			instr.setParameter(2, "MyValue");
			expect(instr.getParameter(2)).to.be("MyValue");
		});

		after(function() {instr.delete();})
	});

	describe('gd.BaseEvent', function(){
		//TODO
	});

	describe('gd.StandardEvent', function(){
		//TODO
		var evt = new gd.StandardEvent();

		it('initial values', function(){
			expect(evt.canHaveSubEvents()).to.be(true);
			expect(evt.isExecutable()).to.be(true);
		});
		it('conditions and actions', function(){
			var conditions = evt.getConditions();
			expect(evt.getConditions().size()).to.be(0);
			var cnd = new gd.Instruction();
			conditions.push_back(cnd);
			expect(evt.getConditions().size()).to.be(1);

			var actions = evt.getActions();
			expect(evt.getActions().size()).to.be(0);
			var act = new gd.Instruction();
			actions.push_back(act);
			expect(evt.getActions().size()).to.be(1);
		});

		after(function() {evt.delete();})
	});
	describe('gd.CommentEvent', function(){
		var evt = new gd.CommentEvent();

		it('initial values', function(){
			expect(evt.canHaveSubEvents()).to.be(false);
			expect(evt.isExecutable()).to.be(false);
		});
		it('comment', function(){
			evt.setComment("My nice comment about my events!");
			expect(evt.getComment()).to.be("My nice comment about my events!");
		});

		after(function() {evt.delete();})
	});
});

