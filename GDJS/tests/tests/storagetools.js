describe('gdjs.evtTools.storage', function() {
	function writeFixturesInFile(filename) {
		gdjs.evtTools.storage.writeNumberInJSONFile(filename, "Root/NumericElement0", 0);
		gdjs.evtTools.storage.writeNumberInJSONFile(filename, "Root/NumericElement40", 40);
		gdjs.evtTools.storage.writeStringInJSONFile(filename, "Root/EmptyString", "");
		gdjs.evtTools.storage.writeStringInJSONFile(filename, "Root/HelloString", "Hello");
	}

	function checkFixturesInFile(filename) {
		expect(gdjs.evtTools.storage.elementExistsInJSONFile(filename, "Root/NumericElement0"))
			.to.be(true);
		expect(gdjs.evtTools.storage.elementExistsInJSONFile(filename, "Root/NumericElement40"))
			.to.be(true);
		expect(gdjs.evtTools.storage.elementExistsInJSONFile(filename, "Root/EmptyString"))
			.to.be(true);
		expect(gdjs.evtTools.storage.elementExistsInJSONFile(filename, "Root/HelloString"))
			.to.be(true);
		expect(gdjs.evtTools.storage.elementExistsInJSONFile(filename, "Root/I/Dont/Exist"))
			.to.be(false);

		var variable = new gdjs.Variable();
		gdjs.evtTools.storage.readNumberFromJSONFile(filename, "Root/NumericElement0", null, variable);
		expect(variable.getAsNumber()).to.be(0);
		gdjs.evtTools.storage.readNumberFromJSONFile(filename, "Root/NumericElement40", null, variable);
		expect(variable.getAsNumber()).to.be(40);
		gdjs.evtTools.storage.readStringFromJSONFile(filename, "Root/EmptyString", null, variable);
		expect(variable.getAsString()).to.be("");
		gdjs.evtTools.storage.readStringFromJSONFile(filename, "Root/HelloString", null, variable);
		expect(variable.getAsString()).to.be("Hello");
	}

	it('can store and retrieve values, with a permanently loaded file', function(){
		gdjs.evtTools.storage.loadJSONFileFromStorage("Test1");
		writeFixturesInFile("Test1");
		gdjs.evtTools.storage.unloadJSONFile("Test1");

		gdjs.evtTools.storage.loadJSONFileFromStorage("Test1");
		checkFixturesInFile("Test1");
		gdjs.evtTools.storage.unloadJSONFile("Test1");
	});

	it('can store and retrieve values, with a non loaded file', function(){
		writeFixturesInFile("Test1");
		checkFixturesInFile("Test1");
	});
});
