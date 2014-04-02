var gd = require('./libWebIDE.js');
gd.initializePlatforms();

//Create a project with a scene
var project = gd.ProjectHelper.createNewGDJSProject();
var layout = project.insertNewLayout("Super scene", 0);
project.setMinimumFPS(20);
layout.setBackgroundColor(125,100,240);
layout.getVariables().insertNew("Score", 0).setValue(1000);
project.getVariables().insertNew("GlobalVar", 0).setValue(1000000);

//Create instance on the scene
var instances = layout.getInitialInstances();
var object1 = instances.insertNewInitialInstance();
var object2 = instances.insertNewInitialInstance();
var object3 = instances.insertNewInitialInstance();
object1.setObjectName("MonObjet");
object1.setX(120);
object1.setY(120);
object2.setObjectName("MonPersonnage");
object2.setX(250);
object2.setY(20);
object2.setAngle(45);
object3.setObjectName("InstanceAvecVariables");

//Edit the variables of an instance
var instanceVariables = object3.getVariables();
instanceVariables.insertNew("Var2", 1).setString("ValeurVariable2");
instanceVariables.insertNew("Var1", 0).getChild("VariableEnfant").setValue(42);

//Display the XML of the whole project
gd.ProjectHelper.dumpProjectXml(project);
project.delete();