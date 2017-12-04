/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Project/Object.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinObject",
                          _("Base object"),
                          _("Base object"),
                          "Florian Rival",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<gd::Object>("",
               _("Base object"),
               _("Base object"),
               "res/objeticon24.png");

    #if defined(GD_IDE_ONLY)
    obj.AddCondition("PosX",
                   _("Compare X position of an object"),
                   _("Compare the X position of the object."),
                   _("The X position of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Position"),
                   "res/conditions/position24.png",
                   "res/conditions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .MarkAsSimple()
        .SetHelpPage("gdevelop/documentation/manual/base")
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
        .MarkAsSimple()
        .SetHelpPage("gdevelop/documentation/manual/base")
        .SetManipulatedType("number");

    obj.AddCondition("PosY",
                   _("Compare Y position of an object"),
                   _("Compare the Y position of an object."),
                   _("The Y position of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Position"),
                   "res/conditions/position24.png",
                   "res/conditions/position.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Y position"))
        .MarkAsSimple()
        .SetHelpPage("gdevelop/documentation/manual/base")
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
        .MarkAsSimple()
        .SetHelpPage("gdevelop/documentation/manual/base")
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
        .AddParameter("expression", _("Y position"))
        .SetHelpPage("gdevelop/documentation/manual/base")
        .MarkAsSimple();

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
        .AddParameter("expression", _("Angle, in degrees"))
        .SetHelpPage("gdevelop/documentation/manual/base")
        .MarkAsAdvanced();

    obj.AddAction("SetAngle",
                   _("Angle"),
                   _("Change the angle of rotation of an object."),
                   _("Do _PARAM1__PARAM2_ to angle of _PARAM0_"),
                   _("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", _("Object"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetHelpPage("gdevelop/documentation/manual/base")
        .SetManipulatedType("number");

    obj.AddAction("Rotate",
                   _("Rotate"),
                   _("Rotate an object, clockwise if the speed is positive, counterclockwise otherwise."),
                   _("Rotate _PARAM0_ at speed _PARAM1_deg/second"),
                   _("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Angular speed (in degrees per second)"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetHelpPage("gdevelop/documentation/manual/base")
        .MarkAsSimple();

    obj.AddAction("RotateTowardAngle",
                   _("Rotate toward angle"),
                   _("Rotate an object towards an angle with the specified speed."),
                   _("Rotate _PARAM0_ towards _PARAM1_ at speed _PARAM2_deg/second"),
                   _("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Angle to rotate towards (in degrees)"))
        .AddParameter("expression", _("Angular speed (in degrees per second) (0 for immediate rotation)"))
        .SetHelpPage("gdevelop/documentation/manual/base")
        .AddCodeOnlyParameter("currentScene", "");

    obj.AddAction("RotateTowardPosition",
                   _("Rotate toward position"),
                   _("Rotate an object towards a position, with the specified speed."),
                   _("Rotate _PARAM0_ towards _PARAM1_;_PARAM2_ at speed _PARAM3_deg/second"),
                   _("Angle"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("expression", _("Angular speed (in degrees per second) (0 for immediate rotation)"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetHelpPage("gdevelop/documentation/manual/base")
        .MarkAsAdvanced();

    obj.AddAction("AddForceXY",
                   _("Add a force"),
                   _("Add a force to an object. The object will move according to all of the forces it has."),
                   _("Add to _PARAM0_ a force of _PARAM1_ p/s on X axis and _PARAM2_ p/s on Y axis"),
                   _("Movement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Speed on X axis (in pixels per second)"))
        .AddParameter("expression", _("Speed on Y axis (in pixels per second)"))
        .AddParameter("expression", _("Damping (Default: 0)"))
        .SetHelpPage("gdevelop/documentation/manual/base");

    obj.AddAction("AddForceAL",
                   _("Add a force (angle)"),
                   _("Add a force to an object. The object will move according to all of the forces it has. This action creates the force using the specified angle and length."),
                   _("Add to _PARAM0_ a force, angle: _PARAM1_ degrees and length: _PARAM2_ pixels"),
                   _("Movement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Angle"))
        .AddParameter("expression", _("Speed (in pixels per second)"))
        .AddParameter("expression", _("Damping (Default: 0)"))
        .SetHelpPage("gdevelop/documentation/manual/base")
        .MarkAsAdvanced();

    obj.AddAction("AddForceVersPos",
                   _("Add a force to move toward a position"),
                   _("Add a force to an object to make it move toward a position."),
                   _("Move _PARAM0_ to _PARAM1_;_PARAM2_ with a force of _PARAM3_ pixels"),
                   _("Movement"),
                   "res/actions/force24.png",
                   "res/actions/force.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("expression", _("Speed (in pixels per second)"))
        .AddParameter("expression", _("Damping (Default: 0)"))
        .SetHelpPage("gdevelop/documentation/manual/base#displacement")
        .MarkAsAdvanced();

    obj.AddAction("AddForceTournePos",
                   _("Add a force to move around a position"),
                   _("Add a force to an object to make it rotate around a position.\nNote that the movement is not precise, especially if the speed is high.\nTo position an object around a position more precisely, use the actions in the category \"Position\"."),
                   _("Rotate _PARAM0_ around _PARAM1_;_PARAM2_ at _PARAM3_ deg/sec and _PARAM4_ pixels away"),
                   _("Movement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position of the center"))
        .AddParameter("expression", _("Y position of the center"))
        .AddParameter("expression", _("Speed (in Degrees per seconds)"))
        .AddParameter("expression", _("Distance (in pixels)"))
        .AddParameter("expression", _("Damping (Default: 0)"))
        .SetHidden();


    obj.AddAction("Arreter",
                   _("Stop the object"),
                   _("Stop the object by deleting all of its forces."),
                   _("Stop the object _PARAM0_"),
                   _("Movement"),
                   "res/actions/arreter24.png",
                   "res/actions/arreter.png")

        .AddParameter("object", _("Object"))
        .SetHelpPage("gdevelop/documentation/manual/base#displacement")
        .MarkAsAdvanced();

    obj.AddAction("Delete",
                   _("Delete an object"),
                   _("Delete the specified object."),
                   _("Delete object _PARAM0_"),
                   _("Objects"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")

        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("currentScene","")
        .MarkAsSimple();

    obj.AddAction("ChangePlan",
                   _("Z order"),
                   _("Modify the Z-order of an object"),
                   _("Do _PARAM1__PARAM2_ to z-Order of _PARAM0_"),
                   _("Z order"),
                   "res/actions/planicon24.png",
                   "res/actions/planicon.png")

        .AddParameter("object", _("Object"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("ChangeLayer",
                   _("Layer"),
                   _("Move the object to a different layer."),
                   _("Put _PARAM0_ on the layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")

        .AddParameter("object", _("Object"))
        .AddParameter("layer", _("Move it to this layer (base layer if empty)")).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

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
        .AddParameter("string", _("Name of the child"))
        .MarkAsAdvanced();

    obj.AddAction("ObjectVariableRemoveChild",
               _("Remove a child"),
               _("Remove a child from a variable of an object."),
               _("Remove child _PARAM2_ from variable _PARAM1_ of _PARAM0_"),
               _("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .AddParameter("string", _("Child's name"))
        .MarkAsAdvanced();

    obj.AddAction("ObjectVariableClearChildren",
               _("Clear variable"),
               _("Remove all the children from the object variable."),
               _("Clear children from variable _PARAM1_ of _PARAM0_"),
               _("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("object", _("Object"))
        .AddParameter("objectvar", _("Variable"))
        .MarkAsAdvanced();

    obj.AddAction("Cache",
                   _("Hide"),
                   _("Hide the specified object."),
                   _("Hide the object _PARAM0_"),
                   _("Visibility"),
                   "res/actions/visibilite24.png",
                   "res/actions/visibilite.png")

        .AddParameter("object", _("Object"))
        .MarkAsSimple();

    obj.AddAction("Montre",
                   _("Show"),
                   _("Show the specified object"),
                   _("Show object _PARAM0_"),
                   _("Visibility"),
                   "res/actions/visibilite24.png",
                   "res/actions/visibilite.png")

        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("inlineCode", "false")
        .MarkAsSimple();

    obj.AddCondition("Angle",
                   _("Angle"),
                   _("Compare the angle of the specified object."),
                   _("Angle of _PARAM0_ is _PARAM1__PARAM2_ deg."),
                   _("Angle"),
                   "res/conditions/direction24.png",
                   "res/conditions/direction.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to compare (in degrees)"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("Plan",
                   _("Compare Z order"),
                   _("Compare the Z-order of the specified object."),
                   _("Z Order of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Z order"),
                   "res/conditions/planicon24.png",
                   "res/conditions/planicon.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Z order"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("Layer",
                   _("Compare layer"),
                   _("Check if the object is on the specified layer."),
                   _("_PARAM0_ is on layer _PARAM1_"),
                   _("Layer"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")

        .AddParameter("object", _("Object"))
        .AddParameter("layer", _("Layer"))
        .MarkAsAdvanced();

    obj.AddCondition("Visible",
                   _("Visibility of an object"),
                   _("Check if an object is visible."),
                   _("The object _PARAM0_ is visible"),
                   _("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

        .AddParameter("object", _("Object"))
        .MarkAsSimple();

    obj.AddCondition("Invisible",
                   _("Invisibility of an object"),
                   _("Check if an object is hidden."),
                   _("_PARAM0_ is hidden"),
                   _("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

        .AddParameter("object", _("Object"))
        .SetHidden(); //Inverted "Visible" condition  does the same thing.

    obj.AddCondition("Arret",
                   _("Object is stopped"),
                   _("Check if an object is not moving"),
                   _("_PARAM0_ is stopped"),
                   _("Movement"),
                   "res/conditions/arret24.png",
                   "res/conditions/arret.png")

        .AddParameter("object", _("Object"))
        .MarkAsAdvanced();

    obj.AddCondition("Vitesse",
                   _("Speed"),
                   _("Compare the overall speed of an object"),
                   _("Overall speed of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Movement"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

        .AddParameter("object", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Speed"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("AngleOfDisplacement",
                   _("Angle of movement"),
                   _("Compare the angle of displacement of an object"),
                   _("Angle of displacement of _PARAM0_ is _PARAM1_ (tolerance : _PARAM2_ degrees)"),
                   _("Movement"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("Angle, in degrees"))
        .AddParameter("expression", _("Tolerance"))
        .MarkAsAdvanced();

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
                   _("Check if the variable is defined."),
                   _("Variable _PARAM1 of _PARAM0_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

        .AddParameter("object", _("Object"))
        .AddParameter("string", _("Variable"))
        .SetHidden();

    obj.AddCondition("BehaviorActivated",
                   _("Behavior activated"),
                   _("Return true if the behavior is activated for the object."),
                   _("Behavior _PARAM1_ of _PARAM0_ is activated"),
                   _("Behaviors"),
                   "res/behavior24.png",
                   "res/behavior16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"))
        .MarkAsAdvanced();

    obj.AddAction("ActivateBehavior",
                   _("De/activate a behavior"),
                   _("De/activate the behavior for the object."),
                   _("Activate behavior _PARAM1_ of _PARAM0_: _PARAM2_"),
                   _("Behaviors"),
                   "res/behavior24.png",
                   "res/behavior16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"))
        .AddParameter("yesorno", _("Activate?"))
        .MarkAsAdvanced();

    obj.AddAction("AddForceVers",
                   _("Add a force to move toward an object"),
                   _("Add a force to an object to make it move toward another."),
                   _("Move _PARAM0_ to _PARAM1_ with a force of _PARAM2_ pixels"),
                   _("Movement"),
                   "res/actions/forceVers24.png",
                   "res/actions/forceVers.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("Target Object"))
        .AddParameter("expression", _("Speed (in pixels per second)"))
        .AddParameter("expression", _("Damping (Default: 0)"))
        .MarkAsAdvanced();

    obj.AddAction("AddForceTourne",
                   _("Add a force to move around an object"),
                   _("Add a force to an object to make it rotate around another.\nNote that the movement is not precise, especially if the speed is high.\nTo position an object around a position more precisely, use the actions in category \"Position\"."),
                   _("Rotate _PARAM0_ around _PARAM1_ at _PARAM2_ deg/sec and _PARAM3_ pixels away"),
                   _("Movement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectPtr", _("Rotate around this object"))
        .AddParameter("expression", _("Speed (in degrees per second)"))
        .AddParameter("expression", _("Distance (in pixels)"))
        .AddParameter("expression", _("Damping (Default: 0)"))
        .MarkAsAdvanced();


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
        .AddParameter("expression", _("Angle, in degrees"))
        .MarkAsAdvanced();

    //Deprecated action
    obj.AddAction("Rebondir",
                   _("Move an object away from another"),
                   _("Move an object away from another, using forces."),
                   _("Move _PARAM0_ away from _PARAM1_ (only _PARAM0_ will move)"),
                   _("Movement"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .SetHidden()
        .AddParameter("object", _("Object"))
        .AddParameter("objectList", _("Object 2 (won't move)"));


    //Deprecated action
    obj.AddAction("Ecarter",
                   _("Move an object away from another"),
                   _("Move an object away from another without using forces."),
                   _("Move _PARAM0_ away from _PARAM2_ (only _PARAM0_ will move)"),
                   _("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .SetHidden()
        .AddParameter("object", _("Object"))
        .AddParameter("objectList", _("Object 2 (won't move)"));


    obj.AddAction("SeparateFromObjects",
                   _("Separate two objects"),
                   _("Move an object away from another using their collision masks.\nBe sure to call this action on a reasonable number of objects\nto avoid slowing down the game."),
                   _("Move _PARAM0_ away from _PARAM1_ (only _PARAM0_ will move)"),
                   _("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png")

        .AddParameter("object", _("Object"))
        .AddParameter("objectList", _("Objects"))
        .MarkAsSimple();

    obj.AddCondition("CollisionPoint",
                   _("Point inside object"),
                   _("Test if a point is inside the object collision masks."),
                   _("_PARAM1_;_PARAM2_ is inside _PARAM0_"),
                   _("Collision"),
                   "res/conditions/collisionPoint24.png",
                   "res/conditions/collisionPoint.png")
        .AddParameter("object", _("Object"))
        .AddParameter("expression", _("X position of the point"))
        .AddParameter("expression", _("Y position of the point"))
        .MarkAsSimple();

    obj.AddExpression("X", _("X position"), _("X position of the object"), _("Position"), "res/actions/position.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Y", _("Y position"), _("Y position of the object"), _("Position"), "res/actions/position.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Angle", _("Angle"), _("Current angle, in degrees, of the object"), _("Angle"), "res/actions/direction.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceX", _("Average X coordinates of forces"), _("Average X coordinates of forces"), _("Movement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceY", _("Average Y coordinates of forces"), _("Average Y coordinates of forces"), _("Movement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceAngle", _("Average angle of the forces"), _("Average angle of the forces"), _("Movement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("ForceLength", _("Average length of the forces"), _("Average length of the forces"), _("Movement"), "res/actions/force.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Longueur", _("Average length of the forces"), _("Average length of the forces"), _("Movement"), "res/actions/force.png")
        .AddParameter("object", _("Object"))
        .SetHidden();


    obj.AddExpression("Width", _("Width"), _("Width of the object"), _("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Largeur", _("Width"), _("Width of the object"), _("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", _("Object"))
        .SetHidden();

    obj.AddExpression("Height", _("Height"), _("Height of the object"), _("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Hauteur", _("Height"), _("Height of the object"), _("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", _("Object"))
        .SetHidden();

    obj.AddExpression("ZOrder", _("Z order"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
        .AddParameter("object", _("Object"));

    obj.AddExpression("Plan", _("Z order"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
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

    obj.AddExpression("VariableChildCount", _("Object's variable number of children"), _("Get the number of children from an object"), _("Variables"), "res/actions/var.png")
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
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true).SetDefaultValue("\"\"")
        .MarkAsSimple();

    extension.AddAction("CreateByName",
                   _("Create an object from its name"),
                   _("Among the objects of the specified group, this action will create the object with the specified name."),
                   _("Among objects _PARAM1_, create object named _PARAM2_ at position _PARAM3_;_PARAM4_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectListWithoutPicking", _("Groups containing objects that can be created by the action"))
        .AddParameter("string", _("Text representing the name of the object to create"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddAction("AjoutObjConcern",
                   _("Pick all objects"),
                   _("Pick all objects with this name."),
                   _("Pick all _PARAM1_"),
                   _("Objects"),
                   "res/actions/add24.png",
                   "res/actions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .MarkAsAdvanced();

    extension.AddAction("AjoutHasard",
                   _("Pick a random object"),
                   _("Pick only one object with this name, among all"),
                   _("Pick a random _PARAM1_"),
                   _("Objects"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .MarkAsSimple();

    extension.AddAction("MoveObjects",
                   _("Apply movement to all objects"),
                   _("Moves all objects according to the forces they have. GDevelop calls this action at the end of the events by default."),
                   _("Apply movement to all objects"),
                   _("Movement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddCondition("SeDirige",
                   _("An object is moving toward another"),
                   _("Check if an object moves toward another.\nThe first object must move."),
                   _("_PARAM0_ is moving toward _PARAM1_"),
                   _("Movement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object 2"))
        .AddParameter("expression", _("Angle of tolerance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsAdvanced();

    extension.AddCondition("Distance",
                   _("Distance between two objects"),
                   _("Compare the distance between two objects.\nIf condition is inverted, only objects that have a distance greater than specified to any other object will be picked."),
                   _("_PARAM0_ distance to _PARAM1_ is below _PARAM2_ pixels"),
                   _("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object 2"))
        .AddParameter("expression", _("Distance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddCondition("AjoutObjConcern",
                   _("Pick all objects"),
                   _("Pick all objects with this name."),
                   _("Pick all _PARAM1_"),
                   _("Objects"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .MarkAsAdvanced();

    extension.AddCondition("AjoutHasard",
                   _("Pick a random object"),
                   _("Pick only one object with this name, among all"),
                   _("Pick a random _PARAM1_"),
                   _("Objects"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .MarkAsSimple();

    extension.AddCondition("PickNearest",
                   _("Pick nearest object"),
                   _("Among the objects, pick the one that is nearest (or furthest if condition is inverted) from the specified position."),
                   _("Pick nearest _PARAM0_ to _PARAM1_;_PARAM2_"),
                   _("Objects"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddCondition("NbObjet",
                   _("Objects count"),
                   _("Compare the number of picked objects"),
                   _("The number of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Objects"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    extension.AddCondition("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   _("Collision"),
                   _("Test the collision between two objects using their collision masks.\nNote that some objects may not have collision masks.\nSome others, like Sprite objects, also provide more precise collision conditions."),
                   _("_PARAM0_ is in collision with _PARAM1_"),
                   _("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddCondition("EstTourne",
                      _("An object is turned toward another"),
                      _("Check if an object is turned toward another"),
                      _("_PARAM0_ is rotated towards _PARAM1_"),
                      _("Angle"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png")
        .AddParameter("objectList", _("Name of the object"))
        .AddParameter("objectList", _("Name of the second object"))
        .AddParameter("expression", _("Angle of tolerance, in degrees (0: minimum tolerance)"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsAdvanced();

    extension.AddExpression("Count", _("Number of objects"), _("Count the number of the specified objects currently picked"), _("Objects"), "res/conditions/nbObjet.png")
        .AddParameter("objectList", _("Object"));
    #endif
}

}
