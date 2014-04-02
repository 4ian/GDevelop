	var gd = require('./libWebIDE.js');

	var instance = new gd.Project();
	console.log(instance.name);
	instance.name = "test";
	console.log(instance.name);

	var jsPlatform = gd.JsPlatform.get();
	console.log("ABOUT TO ADD", jsPlatform.getName());
	instance.addPlatform(jsPlatform);
	console.log("END ADD");

	console.log("AUTRE MANIERE:");
	console.log(gd.asJSPlatform(instance.getCurrentPlatform()).getName());

	console.log("DUMP1:");
	gd.ProjectHelper.dumpProjectXml(instance);
	instance.delete();

	console.log("ISNTANCE2");
	instance2 = gd.ProjectHelper.createNewGDJSProject();
	var test1 = instance2.insertNewLayout("Ma super scène", 0);
	var test = instance2.insertNewLayout("Scene 2", 0);
	test.insertNewLayer("Layer1", 0);
	test.insertNewLayer("Layer2", 0);
	console.log("ISNTANCE2PLATFORM:");
	console.log(instance2.getCurrentPlatform().getName());
	console.log(gd.asJSPlatform(instance2.getCurrentPlatform()).getName());
	test1.setName("COUCOU")
	test1.setBackgroundColor(1,2,3)
	gd.ProjectHelper.dumpProjectXml(instance2);
	console.log(test1.getName());
	console.log(test1.getBackgroundColorRed());
	console.log(test1.getBackgroundColorGreen());
	console.log(test1.getBackgroundColorBlue());
	instance2.delete();