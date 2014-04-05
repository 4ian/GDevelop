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

		after(function() {
			project.delete();
		});
	});

	describe('gd.VariablesContainer', function(){
		it('container is empty after being created', function(){
			var container = new gd.VariablesContainer();

			expect(container.has("Variable")).to.be(false);
			expect(container.count()).to.be(0);
		});
		it('can insert variables', function(){
			var container = new gd.VariablesContainer();

			container.insertNew("Variable", 0);
			expect(container.has("Variable")).to.be(true);
			expect(container.count()).to.be(1);

			container.insertNew("SecondVariable", 0);
			expect(container.has("SecondVariable")).to.be(true);
			expect(container.count()).to.be(2);
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
	});
});

