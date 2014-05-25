/**
 * Run this file using node.js. Be sure to paste libGD.js in the same folder:
 *
 * node demo.js
 */

var gd = require('./libGD.js');
var fs = require('fs');

console.log("Here is an example of how to use libGD.js.");
console.log("*** Initialization of the library:");
gd.initializePlatforms(); //Mandatory initialization
console.log("*** Initialization finished, now we create a sample project.");
console.log(" ");
console.log(" ");

//Create a project with a scene
var project = gd.ProjectHelper.createNewGDJSProject(); //The project is based on the Javascript platform
project.setMinimumFPS(20);
project.setMaximumFPS(20);
project.customValue = 54;
project.getVariables().insertNew("Global variable", 0).setValue(10);
var layout = project.insertNewLayout("Super scene", 0); //"Layout" is a synonym for "Scene".
layout.setBackgroundColor(125,100,240);
layout.getVariables().insertNew("Score", 0).setValue(1000);

//Create new objects and modify them
layout.insertNewObject(project, "Sprite", "MyObject", 0); //"Sprite" is a builtin object.
layout.insertNewObject(project, "Sprite", "MyCharacter", 0);

//Rename an object:
var obj = layout.getObject("MyObject");
obj.setName("Background");

//Adding an animation to a sprite:
var anim = new gd.Animation();
anim.setDirectionsCount(2);
gd.asSpriteObject(obj).addAnimation(anim);

//Create instances of objects on the scene (these are the real objects that the player will see on the scene)
var instances = layout.getInitialInstances();
var object1 = instances.insertNewInitialInstance();
var object2 = instances.insertNewInitialInstance();
var object3 = instances.insertNewInitialInstance();
object1.setObjectName("Background");
object1.setX(120);
object1.setY(120);
object2.setObjectName("MyCharacter");
object2.setX(250);
object2.setY(20);
object2.setAngle(45);
object3.setObjectName("Background");

//Each instance can begin with specific variables:
var instanceVariables = object2.getVariables();
instanceVariables.insertNew("Life", 0).setValue(100);
instanceVariables.insertNew("CharacterName", 0).setString("John");

//Add a new "standard" event to the scene:
var evt = layout.getEvents().insertNewEvent(project, "BuiltinCommonInstructions::Standard", 0);
var standardEvt = gd.asStandardEvent(evt); //We need to "cast" the event to use its specific methods (getConditions and getActions):

var firstCondition = new gd.Instruction(); //Add a simple condition
firstCondition.setType("KeyPressed");
firstCondition.setParametersCount(2);
firstCondition.setParameter(1, "Space");
standardEvt.getConditions().push_back(firstCondition);

var firstAction = new gd.Instruction(); //Add a simple action
firstAction.setType("Delete");
firstAction.setParametersCount(2);
firstAction.setParameter(0, "MyCharacter");
standardEvt.getActions().push_back(firstAction);

//Display the events as sentence:
console.log("*** Events displayed as english sentences (Just like in the events editor):");

var condition = standardEvt.getConditions().get(0);
var conditionSentenceInEnglish = gd.InstructionSentenceFormatter.get().translate(condition,
	gd.MetadataProvider.getConditionMetadata(gd.JsPlatform.get(), "KeyPressed"));
console.log("Condition:", conditionSentenceInEnglish);

var action = standardEvt.getActions().get(0);
var actionSentenceInEnglish = gd.InstructionSentenceFormatter.get().translate(action,
	gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), "Delete"));
console.log("Action:", actionSentenceInEnglish);

//Do automatic refactoring on the events:

//Rename an object:
layout.getObject("MyCharacter").setName("MySuperHero"); //Change the object name...
instances.renameInstancesOfObject("MyCharacter", "MySuperHero"); //...update the instances on the scene...
gd.EventsRefactorer.renameObjectInEvents(gd.JsPlatform.get(), project,
	layout, layout.getEvents(), "MyCharacter", "MySuperHero"); //...and update the events.

console.log("*** The action after renaming MyCharacter to MySuperHero:");
var actionSentenceInEnglish = gd.InstructionSentenceFormatter.get().translate(standardEvt.getActions().get(0),
	gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), "Delete"));
console.log("Action:", actionSentenceInEnglish);

//Finally, write the game to a file.
var serializedProject = new gd.SerializerElement();
project.serializeTo(serializedProject);
var jsonProject = gd.Serializer.toJSON(serializedProject);
fs.writeFile('demo-generated-game.json', jsonProject, function (err) {
  if (err) throw err;
  console.log('*** JSON file of the generated project saved in "demo-generated-game.json". Open it!');

	var unserializedProject = new gd.SerializerElement();
	unserializedProject = gd.Serializer.fromJSON(jsonProject);
	project.unserializeFrom(unserializedProject);

	var serializedProject = new gd.SerializerElement();
	project.serializeTo(serializedProject);
	var jsonProject = gd.Serializer.toJSON(serializedProject);
	fs.writeFile('demo-generated-game2.json', jsonProject, function (err) {
		if (err) throw err;
		console.log('*** JSON file of the generated project saved in "demo-generated-game2.json". Open it!');
	});
});

//And also generate the code for the events to demonstrate how events are translated to Javascript!
var code = gd.GenerateSceneEventsCompleteCode(project, layout, layout.getEvents(), new gd.SetString(), true);
fs.writeFile('demo-generated-code.js', code, function (err) {
  if (err) throw err;
  console.log('*** Javascript code saved in "demo-generated-code.js". Open it (but it\'s not meant to be read by humans) !');
});

//Note that any object from gd created using new operator ("var myObject = new gd.")
//must be deleted. Most of the time, it is not necessary to use new because there are methods for
//creating the objects (InsertLayout, InsertNewObject...) and everything is contained in the project object:
project.delete();