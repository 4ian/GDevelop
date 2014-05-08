/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/PlatformDefinition/Object.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinObject",
                          _("Base object"),
                          _("Base object"),
                          "Florian Rival",
                          "Freeware");

    gd::ObjectMetadata & obj = extension.AddObject("",
               _("Base object"),
               _("Base object"),
               "res/objeticon24.png",
               &CreateBaseObject,
               &DestroyBaseObject);

    #if defined(GD_IDE_ONLY)
    obj.AddCondition("PosX",
                   _("Test X position of an object"),
                   _("Test the X position of the objext"),
                   _("The X position of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Position"),
                   "res/conditions/position24.png",
                   "res/conditions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .SetManipulatedType("number");

    obj.AddAction("MettreX",
                   _("X position of an object"),
                   _("Change the X position of an object."),
                   _("Do _PARAM1__PARAM2_ to the X position of _PARAM0_"),
                   _("Position"),
                   "res/actions/position24.png",
                   "res/actions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");


    obj.AddCondition("PosY",
                   _("Test Y position of an object"),
                   _("Test the Y position of an object"),
                   _("The Y position of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Position"),
                   "res/conditions/position24.png",
                   "res/conditions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Y position"))
        .SetManipulatedType("number");

    obj.AddAction("MettreY",
                   _("Y position of an object"),
                   _("Change the Y position of an object."),
                   _("Do _PARAM1__PARAM2_ to the Y position of _PARAM0_"),
                   _("Position"),
                   "res/actions/position24.png",
                   "res/actions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");


    obj.AddAction("MettreXY",
                   _("Position of an object"),
                   _("Change the position of an object."),
                   _("Do _PARAM1__PARAM2_;_PARAM3__PARAM4_ to the position of _PARAM0_"),
                   _("Position"),
                   "res/actions/position24.png",
                   "res/actions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("X position"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Y position"));


    obj.AddAction("MettreAutourPos",
                   _("Put an object around a position"),
                   _("Position an object around a position, with specified angle and distance."),
                   _("Put _PARAM0_ around _PARAM1_;_PARAM2_, with an angle of _PARAM4_ degrees and _PARAM3_ pixels distance."),
                   _("Position"),
                   "res/actions/positionAutour24.png",
                   "res/actions/positionAutour.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("expression", _("Distance"))
        .AddParameter("expression", _("Angle, in degrees"));


    obj.AddAction("AddForceXY",
                   _("Add a force to an object"),
                   _("Add a force to an object. The object will move according to\nall forces it owns. This action create the force with its X and Y coordinates."),
                   _("Add to _PARAM0_ a force of _PARAM1_ p/s on X axis and _PARAM2_ p/s on Y axis"),
                   _("Displacement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X coordinate of moving"))
        .AddParameter("expression", _("Y coordinate of moving"))
        .AddParameter("expression", _("Damping (Default: 0)"));

    obj.AddAction("AddForceAL",
                   _("Add a force ( angle )"),
                   _("Add a force to an object. The object will move according to\nall forces it owns. This action creates the force using the specified angle and length."),
                   _("Add to _PARAM0_ a force, angle: _PARAM1_ degrees and length: _PARAM2_ pixels"),
                   _("Displacement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Angle"))
        .AddParameter("expression", _("Length (in pixels)"))
        .AddParameter("expression", _("Damping (Default: 0)"));


    obj.AddAction("AddForceVersPos",
                   _("Add a force so as to move to a position"),
                   _("Add a force to an object so as it moves to the position."),
                   _("Move _PARAM0_ to _PARAM1_;_PARAM2_ with a force of _PARAM3_ pixels"),
                   _("Displacement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("expression", _("Length (in pixels)"))
        .AddParameter("expression", _("Damping (Default: 0)"));


    obj.AddAction("AddForceTournePos",
                   _("Add a force so as to move around a position"),
                   _("Add a force to an object so as it rotates toward a position.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                   _("Rotate _PARAM0_ around _PARAM1_;_PARAM2_ with _PARAM3_ deg/sec and _PARAM4_ pixels away"),
                   _("Displacement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position of the center"))
        .AddParameter("expression", _("Y position of the center"))
        .AddParameter("expression", _("Speed (in Degrees per seconds)"))
        .AddParameter("expression", _("Distance (in pixels)"))
        .AddParameter("expression", _("Damping (Default: 0)"));


    obj.AddAction("Arreter",
                   _("Stop the object"),
                   _("Stop the object by deleting all its forces."),
                   _("Stop the object _PARAM0_"),
                   _("Displacement"),
                   "res/actions/arreter24.png",
                   "res/actions/arreter.png")

        .AddParameter("object", _("Object"));


    obj.AddAction("Delete",
                   _("Delete an object"),
                   _("Delete the specified object."),
                   _("Delete object _PARAM0_"),
                   _("Objects"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")

        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("currentScene","");

    obj.AddAction("ChangePlan",
                   _("Change Z order of an object"),
                   _("Modify the z order of an object"),
                   _("Do _PARAM1__PARAM2_ to z-Order of _PARAM0_"),
                   _("Z order"),
                   "res/actions/planicon24.png",
                   "res/actions/planicon.png")

        .AddParameter("object", _("Object"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");


    obj.AddAction("ChangeLayer",
                   _("Change an object's layer"),
                   _("Change the layer where is the object."),
                   _("Put _PARAM0_ on the layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")

        .AddParameter("object", _("Object"))
        .AddParameter("layer", _("Put on the layer (base layer if empty)")).SetDefaultValue("\"\"");


    obj.AddAction("ModVarObjet",
                   _("Modify a variable of an object"),
                   _("Modify the value of a variable of an object"),
                   _("Do _PARAM2__PARAM3_ to variable _PARAM1_ of _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");


    obj.AddAction("ModVarObjetTxt",
                   _("Modify the text of a variable of an object"),
                   _("Modify the text of a variable of an object"),
                   _("Do _PARAM2__PARAM3_ to the text of variable _PARAM1_ of _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .SetManipulatedType("string");

    obj.AddCondition("ObjectVariableChildExists",
             _("Child existence"),
             _("Return true if the specified child of the variable exists."),
             _("Child _PARAM2_ of variable _PARAM1_ of _PARAM0_ exists"),
             _("Variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("string", _("Name of the child"));

    obj.AddAction("ObjectVariableRemoveChild",
               _("Remove a child"),
               _("Remove a child from a variable of an object."),
               _("Remove child _PARAM2_ from variable _PARAM1_ of _PARAM0_"),
               _("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("string", _("Child's name"));


    obj.AddAction("Cache",
                   _("Hide an object"),
                   _("Hide the specified object."),
                   _("Hide the object _PARAM0_"),
                   _("Visibility"),
                   "res/actions/visibilite24.png",
                   "res/actions/visibilite.png")

        .AddParameter("object", _("Object"));


    obj.AddAction("Montre",
                   _("Show an object"),
                   _("Show the specified object"),
                   _("Show object _PARAM0_"),
                   _("Visibility"),
                   "res/actions/visibilite24.png",
                   "res/actions/visibilite.png")

        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("inlineCode", "false");


    obj.AddCondition("Plan",
                   _("Test the Z order of an object"),
                   _("Test the z-order of the specified object."),
                   _("The Z Order of _PARAM0_ is _PARAM2_ _PARAM1_"),
                   _("Z order"),
                   "res/conditions/planicon.png",
                   "res/conditions/planicon.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Z order"))
        .SetManipulatedType("number");

    obj.AddCondition("Layer",
                   _("Test the layer of an object"),
                   _("Test if the object is on the specified layer."),
                   _("_PARAM0_ is on layer _PARAM1_"),
                   _("Layer"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")

        .AddParameter("object", _("Object"))
        .AddParameter("layer", _("Layer"));

    obj.AddCondition("Visible",
                   _("Visibility of an object"),
                   _("Test if an object is not hidden."),
                   _("The object _PARAM0_ is visible"),
                   _("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

        .AddParameter("object", _("Object"));

    obj.AddCondition("Invisible",
                   _("Invisibility of an object"),
                   _("Test if an object is hidden."),
                   _("_PARAM0_ is hidden"),
                   _("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

        .AddParameter("object", _("Object"));

    obj.AddCondition("Arret",
                   _("An object is stopped"),
                   _("Test if an object does not move"),
                   _("_PARAM0_ is stopped"),
                   _("Displacement"),
                   "res/conditions/arret24.png",
                   "res/conditions/arret.png")

        .AddParameter("object", _("Object"));

    obj.AddCondition("Vitesse",
                   _("Speed of the object"),
                   _("Compare the overall speed of an object"),
                   _("The speed of _PARAM0_ is _PARAM1_ _PARAM2_"),
                   _("Displacement"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Speed"))
        .SetManipulatedType("number");

    obj.AddCondition("AngleOfDisplacement",
                   _("Angle of moving"),
                   _("Compare the angle of displacement of an object"),
                   _("The angle of displacement of _PARAM0_ is _PARAM1_ (tolerance : _PARAM2_ degrees)"),
                   _("Displacement"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Angle, in degrees"))
        .AddParameter("expression", _("Tolerance"));

    obj.AddCondition("VarObjet",
                   _("Value of an object's variable"),
                   _("Compare the value of a variable of an object."),
                   _("Variable _PARAM1_ of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetManipulatedType("number");

    obj.AddCondition("VarObjetTxt",
                   _("Text of an object's variable"),
                   _("Compare the text of a variable of an object."),
                   _("The text of variable _PARAM1_ of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text to test"))
        .SetManipulatedType("string");

    obj.AddCondition("VarObjetDef",
                   _("Variable defined"),
                   _("Test "),
                   _("Variable _PARAM1 of _PARAM0_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", _("Object"))
        .AddParameter("string", _("Variable"))
        .SetHidden();

    obj.AddCondition("AutomatismActivated",
                   _("Automatism activated"),
                   _("Return true if the automatism is activated for the object."),
                   _("Automatism _PARAM1_ of _PARAM0_ is activated"),
                   _("Automatisms"),
                   "res/automatism24.png",
                   "res/automatism16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"));

    obj.AddAction("ActivateAutomatism",
                   _("De/activate an automatism"),
                   _("De/activate the automatism for the object."),
                   _("Activate automatism _PARAM1_ of _PARAM0_: _PARAM2_"),
                   _("Automatisms"),
                   "res/automatism24.png",
                   "res/automatism16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"))
        .AddParameter("yesorno", _("Activate \?"));


    obj.AddAction("AddForceVers",
                   _("Add a force so as to move to an object"),
                   _("Add a force to an object so as it moves to another."),
                   _("Move _PARAM0_ to _PARAM1_ with a force of _PARAM2_ pixels"),
                   _("Displacement"),
                   "res/actions/forceVers24.png",
                   "res/actions/forceVers.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("Target Object"))
        .AddParameter("expression", _("Length in pixel"))
        .AddParameter("expression", _("Damping (Default: 0)"));


    obj.AddAction("AddForceTourne",
                   _("Add a force so as to move around an object"),
                   _("Add a force to an object so as it rotates around another.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                   _("Rotate _PARAM0_ around _PARAM1_ with _PARAM2_ deg/sec and _PARAM3_ pixels away"),
                   _("Displacement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("Rotate around this object"))
        .AddParameter("expression", _("Speed ( Degrees per second )"))
        .AddParameter("expression", _("Distance ( in pixel )"))
        .AddParameter("expression", _("Damping (Default: 0)"));


    obj.AddAction("MettreAutour",
                   _("Put an object around another"),
                   _("Position an object around another, with the specified angle and distance."),
                   _("Put _PARAM0_ around _PARAM1_, with an angle of _PARAM3_ degrees and _PARAM2_ pixels distance."),
                   _("Position"),
                   "res/actions/positionAutour24.png",
                   "res/actions/positionAutour.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("\"Center\" Object"))
        .AddParameter("expression", _("Distance"))
        .AddParameter("expression", _("Angle, in degrees"));


    //Deprecated action
    obj.AddAction("Rebondir",
                   _("Move an object away from another"),
                   _("Move an object away from another, using forces."),
                   _("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                   _("Displacement"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .SetHidden()
        .AddParameter("object", _("Object"))
        .AddParameter("objectList", _("Object 2 ( won't move )"));


    //Deprecated action
    obj.AddAction("Ecarter",
                   _("Move an object away from another"),
                   _("Move an object away from another without using forces."),
                   _("Move away _PARAM0_ of _PARAM2_ ( only _PARAM0_ will move )"),
                   _("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .SetHidden()
        .AddParameter("object", _("Object"))
        .AddParameter("objectList", _("Object 2 ( won't move )"));


    obj.AddAction("SeparateFromObjects",
                   _("Separate two objects"),
                   _("Move an object away from another using their collision masks.\nBe sure to call this action on a reasonable number of objects so as\nnot to slow down the game."),
                   _("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                   _("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectList", _("Objects"));


    obj.AddExpression("X", _("X position"), _("X position of the object"), _("Position"), "res/actions/position.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Y", _("Y position"), _("Y position of the object"), _("Position"), "res/actions/position.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceX", _("Average X coordinates of forces"), _("Average X coordinates of forces"), _("Displacement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceY", _("Average Y coordinates of forces"), _("Average Y coordinates of forces"), _("Displacement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceAngle", _("Average angle of the forces"), _("Average angle of the forces"), _("Displacement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Angle", _("Average angle of the forces"), _("Average angle of the forces"), _("Displacement"), "res/actions/force.png")
        .AddParameter("object", _("Object"))

        .SetHidden();

    obj.AddExpression("ForceLength", _("Average length of the forces"), _("Average length of the forces"), _("Displacement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Longueur", _("Average length of the forces"), _("Average length of the forces"), _("Displacement"), "res/actions/force.png")
        .AddParameter("object", _("Object"))

        .SetHidden();


    obj.AddExpression("Width", _("Object's width"), _("Object's width"), _("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Largeur", _("Object's width"), _("Object's width"), _("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", _("Object"))

        .SetHidden();

    obj.AddExpression("Height", _("Object's height"), _("Object's height"), _("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Hauteur", _("Object's height"), _("Object's height"), _("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", _("Object"))

        .SetHidden();

    obj.AddExpression("ZOrder", _("Z order of an object"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Plan", _("Z order of an object"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
        .AddParameter("object", _("Object"))

        .SetHidden();

    obj.AddExpression("Distance", _("Distance between two objects"), _("Distance between two objects"), _("Position"), "res/conditions/distance.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("Object"));

    obj.AddExpression("SqDistance", _("Square distance between two objects"), _("Square distance between two objects"), _("Position"), "res/conditions/distance.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("Object"));

    obj.AddExpression("Variable", _("Object's variable"), _("Object's variable"), _("Variables"), "res/actions/var.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"));

    obj.AddStrExpression("VariableString", _("Object's variable"), _("Text of variable of an object"), _("Variables"), "res/actions/var.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"));

    extension.AddAction("Create",
                   _("Create an object"),
                   _("Create an object at specified position"),
                   _("Create object _PARAM1_ at position _PARAM2_;_PARAM3_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectListWithoutPicking", _("Object to create"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"");

    extension.AddAction("CreateByName",
                   _("Create an object from its name"),
                   _("Among the objects of the specified group, the action will create the object with the specified name."),
                   _("Among objects _PARAM1_, create object named _PARAM2_ at position _PARAM3_;_PARAM4_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectListWithoutPicking", _("Groups containing objects which can be created by the action"))
        .AddParameter("string", _("Text representing the name of the object to create"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"");

    extension.AddAction("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM1_ "),
                   _("Objects"),
                   "res/actions/add24.png",
                   "res/actions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"));

    extension.AddAction("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM1_ "),
                   _("Objects"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"));

    extension.AddAction("MoveObjects",
                   _("Make objects moving"),
                   _("Moves the objects according to the forces they have.Game Develop call this action at the end of the events by default."),
                   _("Make objects moving"),
                   _("Displacement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddCondition("SeDirige",
                   _("An object is moving to another"),
                   _("Test if an object moves towards another.\nThe first object must move."),
                   _("_PARAM0_ is moving toward _PARAM1_"),
                   _("Displacement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object 2"))
        .AddParameter("expression", _("Angle of tolerance"))
        .AddCodeOnlyParameter("conditionInverted", "");



    extension.AddCondition("Distance",
                   _("Distance between two objects"),
                   _("Test the distance between two objects."),
                   _("The distance between _PARAM0_ and _PARAM1_ is below _PARAM2_ pixels"),
                   _("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object 2"))
        .AddParameter("expression", _("Distance"))
        .AddCodeOnlyParameter("conditionInverted", "");



    extension.AddCondition("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM1_ "),
                   _("Objects"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"));



    extension.AddCondition("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM1_ "),
                   _("Objects"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"));



    extension.AddCondition("NbObjet",
                   _("Number of objects"),
                   _("Test the number of concerned objects."),
                   _("The number of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Objects"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetManipulatedType("number");

    extension.AddCondition("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   _("Collision"),
                   _("Test the collision between two objects using their collision mask.\nNote that some objects may not have a collision mask.\nSome others, like Sprite, provide also more precise collision conditions."),
                   _("_PARAM0_ is in collision with _PARAM1_ ( Collision masks )"),
                   _("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object"))
        .AddCodeOnlyParameter("conditionInverted", "");

    extension.AddCondition("EstTourne",
                      _("An object is turned toward another"),
                      _("Test if an object is turned toward another"),
                      _("_PARAM0_ is rotated towards _PARAM1_"),
                      _("Angle"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png")
        .AddParameter("objectList", _("Name of the object"), "", false)
        .AddParameter("objectList", _("Name of the second object"))
        .AddParameter("expression", _("Angle of tolerance, in degrees (0: minimum tolerance)"), "",false)
        .AddCodeOnlyParameter("conditionInverted", "");

    extension.AddExpression("Count", _("Number of objects"), _("Count the number of the specified objects currently picked"), _("Objects"), "res/conditions/nbObjet.png")
        .AddParameter("objectList", _("Object"));
    #endif
}

}