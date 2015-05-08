/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
                          GD_T("Base object"),
                          GD_T("Base object"),
                          "Florian Rival",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject("",
               GD_T("Base object"),
               GD_T("Base object"),
               "res/objeticon24.png",
               &CreateBaseObject);

    #if defined(GD_IDE_ONLY)
    obj.AddCondition("PosX",
                   GD_T("Compare X position of an object"),
                   GD_T("Compare the X position of the object."),
                   GD_T("The X position of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Position"),
                   "res/conditions/position24.png",
                   "res/conditions/position.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("X position"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddAction("MettreX",
                   GD_T("X position of an object"),
                   GD_T("Change the X position of an object."),
                   GD_T("Do _PARAM1__PARAM2_ to the X position of _PARAM0_"),
                   GD_T("Position"),
                   "res/actions/position24.png",
                   "res/actions/position.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddCondition("PosY",
                   GD_T("Compare Y position of an object"),
                   GD_T("Compare the Y position of an object."),
                   GD_T("The Y position of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Position"),
                   "res/conditions/position24.png",
                   "res/conditions/position.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Y position"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddAction("MettreY",
                   GD_T("Y position of an object"),
                   GD_T("Change the Y position of an object."),
                   GD_T("Do _PARAM1__PARAM2_ to the Y position of _PARAM0_"),
                   GD_T("Position"),
                   "res/actions/position24.png",
                   "res/actions/position.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddAction("MettreXY",
                   GD_T("Position of an object"),
                   GD_T("Change the position of an object."),
                   GD_T("Do _PARAM1__PARAM2_;_PARAM3__PARAM4_ to the position of _PARAM0_"),
                   GD_T("Position"),
                   "res/actions/position24.png",
                   "res/actions/position.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Y position"))
        .MarkAsSimple();

    obj.AddAction("MettreAutourPos",
                   GD_T("Put an object around a position"),
                   GD_T("Position an object around a position, with specified angle and distance."),
                   GD_T("Put _PARAM0_ around _PARAM1_;_PARAM2_, with an angle of _PARAM4_ degrees and _PARAM3_ pixels distance."),
                   GD_T("Position"),
                   "res/actions/positionAutour24.png",
                   "res/actions/positionAutour.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("expression", GD_T("Y position"))
        .AddParameter("expression", GD_T("Distance"))
        .AddParameter("expression", GD_T("Angle, in degrees"))
        .MarkAsAdvanced();

    obj.AddAction("SetAngle",
                   GD_T("Angle"),
                   GD_T("Change the angle of rotation of an object."),
                   GD_T("Do _PARAM1__PARAM2_ to angle of _PARAM0_"),
                   GD_T("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetManipulatedType("number");

    obj.AddAction("Rotate",
                   GD_T("Rotate"),
                   GD_T("Rotate an object, clockwise if the speed is positive, counterclockwise otherwise."),
                   GD_T("Rotate _PARAM0_ at speed _PARAM1_deg/second"),
                   GD_T("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object"), "", false)
        .AddParameter("expression", GD_T("Angular speed (in degrees per second)"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsSimple();

    obj.AddAction("RotateTowardAngle",
                   GD_T("Rotate toward angle"),
                   GD_T("Rotate an object towards an angle with the specified speed."),
                   GD_T("Rotate _PARAM0_ towards _PARAM1_ at speed _PARAM2_deg/second"),
                   GD_T("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object"), "", false)
        .AddParameter("expression", GD_T("Angle to rotate towards (in degrees)"), "",false)
        .AddParameter("expression", GD_T("Angular speed (in degrees per second) (0 for immediate rotation)"), "",false)
        .AddCodeOnlyParameter("currentScene", "");

    obj.AddAction("RotateTowardPosition",
                   GD_T("Rotate toward position"),
                   GD_T("Rotate an object towards a position, with the specified speed."),
                   GD_T("Rotate _PARAM0_ towards _PARAM1_;_PARAM2_ at speed _PARAM3_deg/second"),
                   GD_T("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object"), "", false)
        .AddParameter("expression", GD_T("X position"), "",false)
        .AddParameter("expression", GD_T("Y position"), "",false)
        .AddParameter("expression", GD_T("Angular speed (in degrees per second) (0 for immediate rotation)"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    obj.AddAction("AddForceXY",
                   GD_T("Add a force to an object"),
                   GD_T("Add a force to an object. The object will move according to\nall forces it owns. This action create the force with its X and Y coordinates."),
                   GD_T("Add to _PARAM0_ a force of _PARAM1_ p/s on X axis and _PARAM2_ p/s on Y axis"),
                   GD_T("Movement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("expression", GD_T("X coordinate of moving"))
        .AddParameter("expression", GD_T("Y coordinate of moving"))
        .AddParameter("expression", GD_T("Damping (Default: 0)"));

    obj.AddAction("AddForceAL",
                   GD_T("Add a force ( angle )"),
                   GD_T("Add a force to an object. The object will move according to\nall forces it owns. This action creates the force using the specified angle and length."),
                   GD_T("Add to _PARAM0_ a force, angle: _PARAM1_ degrees and length: _PARAM2_ pixels"),
                   GD_T("Movement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("expression", GD_T("Angle"))
        .AddParameter("expression", GD_T("Length (in pixels)"))
        .AddParameter("expression", GD_T("Damping (Default: 0)"))
        .MarkAsAdvanced();

    obj.AddAction("AddForceVersPos",
                   GD_T("Add a force so as to move to a position"),
                   GD_T("Add a force to an object so as it moves to the position."),
                   GD_T("Move _PARAM0_ to _PARAM1_;_PARAM2_ with a force of _PARAM3_ pixels"),
                   GD_T("Movement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("expression", GD_T("Y position"))
        .AddParameter("expression", GD_T("Length (in pixels)"))
        .AddParameter("expression", GD_T("Damping (Default: 0)"))
        .MarkAsAdvanced();

    obj.AddAction("AddForceTournePos",
                   GD_T("Add a force so as to move around a position"),
                   GD_T("Add a force to an object so as it rotates toward a position.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                   GD_T("Rotate _PARAM0_ around _PARAM1_;_PARAM2_ with _PARAM3_ deg/sec and _PARAM4_ pixels away"),
                   GD_T("Movement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("expression", GD_T("X position of the center"))
        .AddParameter("expression", GD_T("Y position of the center"))
        .AddParameter("expression", GD_T("Speed (in Degrees per seconds)"))
        .AddParameter("expression", GD_T("Distance (in pixels)"))
        .AddParameter("expression", GD_T("Damping (Default: 0)"))
        .SetHidden();


    obj.AddAction("Arreter",
                   GD_T("Stop the object"),
                   GD_T("Stop the object by deleting all its forces."),
                   GD_T("Stop the object _PARAM0_"),
                   GD_T("Movement"),
                   "res/actions/arreter24.png",
                   "res/actions/arreter.png")

        .AddParameter("object", GD_T("Object"))
        .MarkAsAdvanced();

    obj.AddAction("Delete",
                   GD_T("Delete an object"),
                   GD_T("Delete the specified object."),
                   GD_T("Delete object _PARAM0_"),
                   GD_T("Objects"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")

        .AddParameter("object", GD_T("Object"))
        .AddCodeOnlyParameter("currentScene","")
        .MarkAsSimple();

    obj.AddAction("ChangePlan",
                   GD_T("Z order"),
                   GD_T("Modify the z order of an object"),
                   GD_T("Do _PARAM1__PARAM2_ to z-Order of _PARAM0_"),
                   GD_T("Z order"),
                   "res/actions/planicon24.png",
                   "res/actions/planicon.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetManipulatedType("number");

    obj.AddAction("ChangeLayer",
                   GD_T("Layer"),
                   GD_T("Change the layer where is the object."),
                   GD_T("Put _PARAM0_ on the layer _PARAM1_"),
                   GD_T("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("layer", GD_T("Put on the layer (base layer if empty)")).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    obj.AddAction("ModVarObjet",
                   GD_T("Modify a variable of an object"),
                   GD_T("Modify the value of a variable of an object"),
                   GD_T("Do _PARAM2__PARAM3_ to variable _PARAM1_ of _PARAM0_"),
                   GD_T("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetManipulatedType("number");

    obj.AddAction("ModVarObjetTxt",
                   GD_T("Modify the text of a variable of an object"),
                   GD_T("Modify the text of a variable of an object"),
                   GD_T("Do _PARAM2__PARAM3_ to the text of variable _PARAM1_ of _PARAM0_"),
                   GD_T("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("string", GD_T("Text"))
        .SetManipulatedType("string");

    obj.AddCondition("ObjectVariableChildExists",
             GD_T("Child existence"),
             GD_T("Return true if the specified child of the variable exists."),
             GD_T("Child _PARAM2_ of variable _PARAM1_ of _PARAM0_ exists"),
             GD_T("Variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"))
        .AddParameter("string", GD_T("Name of the child"))
        .MarkAsAdvanced();

    obj.AddAction("ObjectVariableRemoveChild",
               GD_T("Remove a child"),
               GD_T("Remove a child from a variable of an object."),
               GD_T("Remove child _PARAM2_ from variable _PARAM1_ of _PARAM0_"),
               GD_T("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"))
        .AddParameter("string", GD_T("Child's name"))
        .MarkAsAdvanced();

    obj.AddAction("Cache",
                   GD_T("Hide"),
                   GD_T("Hide the specified object."),
                   GD_T("Hide the object _PARAM0_"),
                   GD_T("Visibility"),
                   "res/actions/visibilite24.png",
                   "res/actions/visibilite.png")

        .AddParameter("object", GD_T("Object"))
        .MarkAsSimple();

    obj.AddAction("Montre",
                   GD_T("Show"),
                   GD_T("Show the specified object"),
                   GD_T("Show object _PARAM0_"),
                   GD_T("Visibility"),
                   "res/actions/visibilite24.png",
                   "res/actions/visibilite.png")

        .AddParameter("object", GD_T("Object"))
        .AddCodeOnlyParameter("inlineCode", "false")
        .MarkAsSimple();

    obj.AddCondition("Angle",
                   GD_T("Angle"),
                   GD_T("Compare angle of the specified object."),
                   GD_T("Angle of _PARAM0_ is _PARAM1__PARAM2_ deg."),
                   GD_T("Angle"),
                   "res/conditions/direction24.png",
                   "res/conditions/direction.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to compare (in degrees)"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("Plan",
                   GD_T("Compare Z order"),
                   GD_T("Compare the z-order of the specified object."),
                   GD_T("Z Order of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Z order"),
                   "res/conditions/planicon24.png",
                   "res/conditions/planicon.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Z order"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("Layer",
                   GD_T("Compare layer"),
                   GD_T("Test if the object is on the specified layer."),
                   GD_T("_PARAM0_ is on layer _PARAM1_"),
                   GD_T("Layer"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("layer", GD_T("Layer"))
        .MarkAsAdvanced();

    obj.AddCondition("Visible",
                   GD_T("Visibility of an object"),
                   GD_T("Test if an object is not hidden."),
                   GD_T("The object _PARAM0_ is visible"),
                   GD_T("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

        .AddParameter("object", GD_T("Object"))
        .MarkAsSimple();

    obj.AddCondition("Invisible",
                   GD_T("Invisibility of an object"),
                   GD_T("Test if an object is hidden."),
                   GD_T("_PARAM0_ is hidden"),
                   GD_T("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

        .AddParameter("object", GD_T("Object"))
        .SetHidden(); //Inverted "Visible" condition  does the same thing.

    obj.AddCondition("Arret",
                   GD_T("Object is stopped"),
                   GD_T("Test if an object does not move"),
                   GD_T("_PARAM0_ is stopped"),
                   GD_T("Movement"),
                   "res/conditions/arret24.png",
                   "res/conditions/arret.png")

        .AddParameter("object", GD_T("Object"))
        .MarkAsAdvanced();

    obj.AddCondition("Vitesse",
                   GD_T("Speed"),
                   GD_T("Compare the overall speed of an object"),
                   GD_T("Overall speed of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Movement"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Speed"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("AngleOfDisplacement",
                   GD_T("Angle of moving"),
                   GD_T("Compare the angle of displacement of an object"),
                   GD_T("Angle of displacement of _PARAM0_ is _PARAM1_ (tolerance : _PARAM2_ degrees)"),
                   GD_T("Movement"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("expression", GD_T("Angle, in degrees"))
        .AddParameter("expression", GD_T("Tolerance"))
        .MarkAsAdvanced();

    obj.AddCondition("VarObjet",
                   GD_T("Value of an object's variable"),
                   GD_T("Compare the value of a variable of an object."),
                   GD_T("Variable _PARAM1_ of _PARAM0_ is _PARAM2__PARAM3_"),
                   GD_T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .SetManipulatedType("number");

    obj.AddCondition("VarObjetTxt",
                   GD_T("Text of an object's variable"),
                   GD_T("Compare the text of a variable of an object."),
                   GD_T("The text of variable _PARAM1_ of _PARAM0_ is _PARAM2__PARAM3_"),
                   GD_T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to test"))
        .SetManipulatedType("string");

    obj.AddCondition("VarObjetDef",
                   GD_T("Variable defined"),
                   GD_T("Test "),
                   GD_T("Variable _PARAM1 of _PARAM0_ is defined"),
                   GD_T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("string", GD_T("Variable"))
        .SetHidden();

    obj.AddCondition("AutomatismActivated",
                   GD_T("Automatism activated"),
                   GD_T("Return true if the automatism is activated for the object."),
                   GD_T("Automatism _PARAM1_ of _PARAM0_ is activated"),
                   GD_T("Automatisms"),
                   "res/automatism24.png",
                   "res/automatism16.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"))
        .MarkAsAdvanced();

    obj.AddAction("ActivateAutomatism",
                   GD_T("De/activate an automatism"),
                   GD_T("De/activate the automatism for the object."),
                   GD_T("Activate automatism _PARAM1_ of _PARAM0_: _PARAM2_"),
                   GD_T("Automatisms"),
                   "res/automatism24.png",
                   "res/automatism16.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"))
        .AddParameter("yesorno", GD_T("Activate \?"))
        .MarkAsAdvanced();

    obj.AddAction("AddForceVers",
                   GD_T("Add a force so as to move to an object"),
                   GD_T("Add a force to an object so as it moves to another."),
                   GD_T("Move _PARAM0_ to _PARAM1_ with a force of _PARAM2_ pixels"),
                   GD_T("Movement"),
                   "res/actions/forceVers24.png",
                   "res/actions/forceVers.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectPtr", GD_T("Target Object"))
        .AddParameter("expression", GD_T("Length in pixel"))
        .AddParameter("expression", GD_T("Damping (Default: 0)"))
        .MarkAsAdvanced();

    obj.AddAction("AddForceTourne",
                   GD_T("Add a force so as to move around an object"),
                   GD_T("Add a force to an object so as it rotates around another.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                   GD_T("Rotate _PARAM0_ around _PARAM1_ with _PARAM2_ deg/sec and _PARAM3_ pixels away"),
                   GD_T("Movement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectPtr", GD_T("Rotate around this object"))
        .AddParameter("expression", GD_T("Speed ( Degrees per second )"))
        .AddParameter("expression", GD_T("Distance ( in pixel )"))
        .AddParameter("expression", GD_T("Damping (Default: 0)"))
        .MarkAsAdvanced();


    obj.AddAction("MettreAutour",
                   GD_T("Put an object around another"),
                   GD_T("Position an object around another, with the specified angle and distance."),
                   GD_T("Put _PARAM0_ around _PARAM1_, with an angle of _PARAM3_ degrees and _PARAM2_ pixels distance."),
                   GD_T("Position"),
                   "res/actions/positionAutour24.png",
                   "res/actions/positionAutour.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectPtr", GD_T("\"Center\" Object"))
        .AddParameter("expression", GD_T("Distance"))
        .AddParameter("expression", GD_T("Angle, in degrees"))
        .MarkAsAdvanced();

    //Deprecated action
    obj.AddAction("Rebondir",
                   GD_T("Move an object away from another"),
                   GD_T("Move an object away from another, using forces."),
                   GD_T("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                   GD_T("Movement"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .SetHidden()
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectList", GD_T("Object 2 ( won't move )"));


    //Deprecated action
    obj.AddAction("Ecarter",
                   GD_T("Move an object away from another"),
                   GD_T("Move an object away from another without using forces."),
                   GD_T("Move away _PARAM0_ of _PARAM2_ ( only _PARAM0_ will move )"),
                   GD_T("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .SetHidden()
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectList", GD_T("Object 2 ( won't move )"));


    obj.AddAction("SeparateFromObjects",
                   GD_T("Separate two objects"),
                   GD_T("Move an object away from another using their collision masks.\nBe sure to call this action on a reasonable number of objects so as\nnot to slow down the game."),
                   GD_T("Move away _PARAM0_ of _PARAM1_ (only _PARAM0_ will move)"),
                   GD_T("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectList", GD_T("Objects"))
        .MarkAsSimple();

    obj.AddExpression("X", GD_T("X position"), GD_T("X position of the object"), GD_T("Position"), "res/actions/position.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("Y", GD_T("Y position"), GD_T("Y position of the object"), GD_T("Position"), "res/actions/position.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("Angle", GD_T("Angle"), GD_T("Current angle, in degrees, of the object"), GD_T("Angle"), "res/actions/direction.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("ForceX", GD_T("Average X coordinates of forces"), GD_T("Average X coordinates of forces"), GD_T("Movement"), "res/actions/force.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("ForceY", GD_T("Average Y coordinates of forces"), GD_T("Average Y coordinates of forces"), GD_T("Movement"), "res/actions/force.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("ForceAngle", GD_T("Average angle of the forces"), GD_T("Average angle of the forces"), GD_T("Movement"), "res/actions/force.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("ForceLength", GD_T("Average length of the forces"), GD_T("Average length of the forces"), GD_T("Movement"), "res/actions/force.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("Longueur", GD_T("Average length of the forces"), GD_T("Average length of the forces"), GD_T("Movement"), "res/actions/force.png")
        .AddParameter("object", GD_T("Object"))
        .SetHidden();


    obj.AddExpression("Width", GD_T("Width"), GD_T("Width of the object"), GD_T("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("Largeur", GD_T("Width"), GD_T("Width of the object"), GD_T("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"))
        .SetHidden();

    obj.AddExpression("Height", GD_T("Height"), GD_T("Height of the object"), GD_T("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("Hauteur", GD_T("Height"), GD_T("Height of the object"), GD_T("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"))
        .SetHidden();

    obj.AddExpression("ZOrder", GD_T("Z order"), GD_T("Z order of an object"), GD_T("Visibility"), "res/actions/planicon.png")
        .AddParameter("object", GD_T("Object"));

    obj.AddExpression("Plan", GD_T("Z order"), GD_T("Z order of an object"), GD_T("Visibility"), "res/actions/planicon.png")
        .AddParameter("object", GD_T("Object"))
        .SetHidden();

    obj.AddExpression("Distance", GD_T("Distance between two objects"), GD_T("Distance between two objects"), GD_T("Position"), "res/conditions/distance.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectPtr", GD_T("Object"));

    obj.AddExpression("SqDistance", GD_T("Square distance between two objects"), GD_T("Square distance between two objects"), GD_T("Position"), "res/conditions/distance.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectPtr", GD_T("Object"));

    obj.AddExpression("Variable", GD_T("Object's variable"), GD_T("Object's variable"), GD_T("Variables"), "res/actions/var.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"));

    obj.AddStrExpression("VariableString", GD_T("Object's variable"), GD_T("Text of variable of an object"), GD_T("Variables"), "res/actions/var.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("objectvar", GD_T("Variable"));

    extension.AddAction("Create",
                   GD_T("Create an object"),
                   GD_T("Create an object at specified position"),
                   GD_T("Create object _PARAM1_ at position _PARAM2_;_PARAM3_"),
                   GD_T("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectListWithoutPicking", GD_T("Object to create"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("expression", GD_T("Y position"))
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .MarkAsSimple();

    extension.AddAction("CreateByName",
                   GD_T("Create an object from its name"),
                   GD_T("Among the objects of the specified group, the action will create the object with the specified name."),
                   GD_T("Among objects _PARAM1_, create object named _PARAM2_ at position _PARAM3_;_PARAM4_"),
                   GD_T("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectListWithoutPicking", GD_T("Groups containing objects which can be created by the action"))
        .AddParameter("string", GD_T("Text representing the name of the object to create"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("expression", GD_T("Y position"))
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddAction("AjoutObjConcern",
                   GD_T("Consider objects"),
                   GD_T("Pick all objects with this name."),
                   GD_T("Consider all _PARAM1_ "),
                   GD_T("Objects"),
                   "res/actions/add24.png",
                   "res/actions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", GD_T("Object"))
        .MarkAsAdvanced();

    extension.AddAction("AjoutHasard",
                   GD_T("Take a random object"),
                   GD_T("Take only one object with this name among all"),
                   GD_T("Take a random _PARAM1_ "),
                   GD_T("Objects"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", GD_T("Object"))
        .MarkAsSimple();

    extension.AddAction("MoveObjects",
                   GD_T("Make objects moving"),
                   GD_T("Moves the objects according to the forces they have. GDevelop call this action at the end of the events by default."),
                   GD_T("Make objects moving"),
                   GD_T("Movement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddCondition("SeDirige",
                   GD_T("An object is moving to another"),
                   GD_T("Test if an object moves towards another.\nThe first object must move."),
                   GD_T("_PARAM0_ is moving toward _PARAM1_"),
                   GD_T("Movement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png")
        .AddParameter("objectList", GD_T("Object"))
        .AddParameter("objectList", GD_T("Object 2"))
        .AddParameter("expression", GD_T("Angle of tolerance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsAdvanced();

    extension.AddCondition("Distance",
                   GD_T("Distance between two objects"),
                   GD_T("Test the distance between two objects.\nIf condition is inverted, only objects that have a distance greater than specified to any other object will be picked."),
                   GD_T("_PARAM0_ distance to _PARAM1_ is below _PARAM2_ pixels"),
                   GD_T("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("objectList", GD_T("Object"))
        .AddParameter("objectList", GD_T("Object 2"))
        .AddParameter("expression", GD_T("Distance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddCondition("AjoutObjConcern",
                   GD_T("Consider objects"),
                   GD_T("Pick all objects with this name."),
                   GD_T("Consider all _PARAM1_ "),
                   GD_T("Objects"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", GD_T("Object"))
        .MarkAsAdvanced();

    extension.AddCondition("AjoutHasard",
                   GD_T("Take a random object"),
                   GD_T("Take only one object with this name among all"),
                   GD_T("Take a random _PARAM1_ "),
                   GD_T("Objects"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", GD_T("Object"))
        .MarkAsSimple();

    extension.AddCondition("PickNearest",
                   GD_T("Pick nearest object"),
                   GD_T("Among the objects, pick the one that is nearest (or furthest if condition is inverted) from the specified position."),
                   GD_T("Pick nearest _PARAM0_ to _PARAM1_;_PARAM2_"),
                   GD_T("Objects"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("objectList", GD_T("Object"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("expression", GD_T("Y position"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddCondition("NbObjet",
                   GD_T("Number of objects"),
                   GD_T("Test the number of concerned objects."),
                   GD_T("The number of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Objects"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png")
        .AddParameter("objectList", GD_T("Object"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    extension.AddCondition("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   GD_T("Collision"),
                   GD_T("Test the collision between two objects using their collision mask.\nNote that some objects may not have a collision mask.\nSome others, like Sprite, provide also more precise collision conditions."),
                   GD_T("_PARAM0_ is in collision with _PARAM1_"),
                   GD_T("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png")
        .AddParameter("objectList", GD_T("Object"))
        .AddParameter("objectList", GD_T("Object"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddCondition("EstTourne",
                      GD_T("An object is turned toward another"),
                      GD_T("Test if an object is turned toward another"),
                      GD_T("_PARAM0_ is rotated towards _PARAM1_"),
                      GD_T("Angle"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png")
        .AddParameter("objectList", GD_T("Name of the object"), "", false)
        .AddParameter("objectList", GD_T("Name of the second object"))
        .AddParameter("expression", GD_T("Angle of tolerance, in degrees (0: minimum tolerance)"), "",false)
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsAdvanced();

    extension.AddExpression("Count", GD_T("Number of objects"), GD_T("Count the number of the specified objects currently picked"), GD_T("Objects"), "res/conditions/nbObjet.png")
        .AddParameter("objectList", GD_T("Object"));
    #endif
}

}
