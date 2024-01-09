/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinObject",
          _("Objects"),
          _("Common features that can be used for all objects in GDevelop."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/base_object/events");
  extension.AddInstructionOrExpressionGroupMetadata(_("Collision"))
      .SetIcon("res/conditions/collision24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Objects"))
      .SetIcon("res/actions/create24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Movement using forces"))
      .SetIcon("res/actions/force24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Variables"))
      .SetIcon("res/conditions/var24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Timers"))
      .SetIcon("res/actions/timer24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Visibility"))
      .SetIcon("res/actions/visibilite24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Position"))
      .SetIcon("res/actions/position24_black.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Angle"))
      .SetIcon("res/actions/direction24_black.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Size"))
      .SetIcon("res/actions/scale24_black.png");

  gd::ObjectMetadata& obj = extension.AddObject<gd::ObjectConfiguration>(
      "", _("Base object"), _("Base object"), "res/objeticon24.png");

  obj.AddCondition("PosX",
                   _("X position"),
                   _("Compare the X position of the object."),
                   _("the X position"),
                   _("Position"),
                   "res/conditions/position24_black.png",
                   "res/conditions/position_black.png")

      .AddParameter("object", _("Object"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsSimple();

  obj.AddAction("MettreX",
                _("X position"),
                _("Change the X position of an object."),
                _("the X position"),
                _("Position"),
                "res/actions/position24_black.png",
                "res/actions/position_black.png")

      .AddParameter("object", _("Object"))
      .UseStandardOperatorParameters("number",
                                     ParameterOptions::MakeNewOptions())
      .MarkAsSimple();

  obj.AddCondition("PosY",
                   _("Y position"),
                   _("Compare the Y position of an object."),
                   _("the Y position"),
                   _("Position"),
                   "res/conditions/position24_black.png",
                   "res/conditions/position_black.png")

      .AddParameter("object", _("Object"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsSimple();

  obj.AddAction("MettreY",
                _("Y position"),
                _("Change the Y position of an object."),
                _("the Y position"),
                _("Position"),
                "res/actions/position24_black.png",
                "res/actions/position_black.png")

      .AddParameter("object", _("Object"))
      .UseStandardOperatorParameters("number",
                                     ParameterOptions::MakeNewOptions())
      .MarkAsSimple();

  obj.AddAction("MettreXY",
                _("Position"),
                _("Change the position of an object."),
                _("Change the position of _PARAM0_: _PARAM1_ _PARAM2_ (x "
                  "axis), _PARAM3_ _PARAM4_ (y axis)"),
                _("Position"),
                "res/actions/position24_black.png",
                "res/actions/position_black.png")

      .AddParameter("object", _("Object"))
      .AddParameter("operator", _("Modification's sign"), "number")
      .AddParameter("expression", _("X position"))
      .AddParameter("operator", _("Modification's sign"), "number")
      .AddParameter("expression", _("Y position"))
      .MarkAsSimple();

  obj.AddAction("SetCenter",
                _("Center position"),
                _("Change the position of an object, using its center."),
                _("Change the position of the center of _PARAM0_: _PARAM1_ "
                  "_PARAM2_ (x "
                  "axis), _PARAM3_ _PARAM4_ (y axis)"),
                _("Position/Center"),
                "res/actions/position24_black.png",
                "res/actions/position_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("operator", _("Modification's sign"), "number")
      .AddParameter("expression", _("X position"))
      .AddParameter("operator", _("Modification's sign"), "number")
      .AddParameter("expression", _("Y position"))
      .MarkAsSimple();

  obj.AddExpressionAndConditionAndAction(
         "number",
         "CenterX",
         _("Center X position"),
         _("the X position of the center of rotation"),
         _("the X position of the center"),
         _("Position/Center"),
         "res/actions/position24_black.png")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndConditionAndAction(
         "number",
         "CenterY",
         _("Center Y position"),
         _("the Y position of the center of rotation"),
         _("the Y position of the center"),
         _("Position/Center"),
         "res/actions/position24_black.png")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndCondition("number",
                                "BoundingBoxLeft",
                                _("Bounding box left position"),
                                _("the bounding box (the area encapsulating "
                                  "the object) left position"),
                                _("the bounding box left position"),
                                _("Position/Bounding Box"),
                                "res/conditions/bounding-box-left_black.svg")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndCondition(
         "number",
         "BoundingBoxTop",
         _("Bounding box top position"),
         _("the bounding box (the area encapsulating the object) top position"),
         _("the bounding box top position"),
         _("Position/Bounding Box"),
         "res/conditions/bounding-box-top_black.svg")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndCondition("number",
                                "BoundingBoxRight",
                                _("Bounding box right position"),
                                _("the bounding box (the area encapsulating "
                                  "the object) right position"),
                                _("the bounding box right position"),
                                _("Position/Bounding Box"),
                                "res/conditions/bounding-box-right_black.svg")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndCondition("number",
                                "BoundingBoxBottom",
                                _("Bounding box bottom position"),
                                _("the bounding box (the area encapsulating "
                                  "the object) bottom position"),
                                _("the bounding box bottom position"),
                                _("Position/Bounding Box"),
                                "res/conditions/bounding-box-bottom_black.svg")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndCondition("number",
                                "BoundingBoxCenterX",
                                _("Bounding box center X position"),
                                _("the bounding box (the area encapsulating "
                                  "the object) center X position"),
                                _("the bounding box center X position"),
                                _("Position/Bounding Box"),
                                "res/conditions/bounding-box-center_black.svg")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddExpressionAndCondition("number",
                                "BoundingBoxCenterY",
                                _("Bounding box center Y position"),
                                _("the bounding box (the area encapsulating "
                                  "the object) center Y position"),
                                _("the bounding box center Y position"),
                                _("Position/Bounding Box"),
                                "res/conditions/bounding-box-center_black.svg")
      .AddParameter("object", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions());

  obj.AddAction("MettreAutourPos",
                _("Put around a position"),
                _("Position the center of the given object around a position, "
                  "using the specified angle "
                  "and distance."),
                _("Put _PARAM0_ around _PARAM1_;_PARAM2_, with an angle of "
                  "_PARAM4_ degrees and _PARAM3_ pixels distance."),
                _("Position"),
                "res/actions/positionAutour24.png",
                "res/actions/positionAutour.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter("expression", _("Distance"))
      .AddParameter("expression", _("Angle, in degrees"))
      .MarkAsAdvanced();

  obj.AddAction("SetAngle",
                _("Angle"),
                _("Change the angle of rotation of an object (in degrees)."),
                _("the angle"),
                _("Angle"),
                "res/actions/direction24_black.png",
                "res/actions/direction_black.png")

      .AddParameter("object", _("Object"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")));

  obj.AddAction("Rotate",
                _("Rotate"),
                _("Rotate an object, clockwise if the speed is positive, "
                  "counterclockwise otherwise."),
                _("Rotate _PARAM0_ at speed _PARAM1_ deg/second"),
                _("Angle"),
                "res/actions/rotate24_black.png",
                "res/actions/rotate_black.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angular speed (in degrees per second)"))
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsSimple();

  obj.AddAction(
         "RotateTowardAngle",
         _("Rotate toward angle"),
         _("Rotate an object towards an angle with the specified speed."),
         _("Rotate _PARAM0_ towards _PARAM1_ at speed _PARAM2_ deg/second"),
         _("Angle"),
         "res/actions/rotate24_black.png",
         "res/actions/rotate_black.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angle to rotate towards (in degrees)"))
      .AddParameter("expression", _("Angular speed (in degrees per second)"))
      .SetParameterLongDescription(_("Enter 0 for an immediate rotation."))
      .AddCodeOnlyParameter("currentScene", "");

  obj.AddAction(
         "RotateTowardPosition",
         _("Rotate toward position"),
         _("Rotate an object towards a position, with the specified speed."),
         _("Rotate _PARAM0_ towards _PARAM1_;_PARAM2_ at speed "
           "_PARAM3_ deg/second"),
         _("Angle"),
         "res/actions/rotate24_black.png",
         "res/actions/rotate_black.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter("expression", _("Angular speed (in degrees per second)"))
      .SetParameterLongDescription(_("Enter 0 for an immediate rotation."))
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  obj.AddAction(
         "AddForceXY",
         _("Add a force"),
         _("Add a force to an object. The object will move according to "
           "all of the forces it has."),
         _("Add to _PARAM0_ _PARAM3_ force of _PARAM1_ p/s on X axis and "
           "_PARAM2_ p/s on Y axis"),
         _("Movement using forces"),
         "res/actions/force24.png",
         "res/actions/force.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Speed on X axis (in pixels per second)"))
      .AddParameter("expression", _("Speed on Y axis (in pixels per second)"))
      .AddParameter("forceMultiplier", _("Force multiplier"), "", true)
      .SetDefaultValue("0");

  obj.AddAction("AddForceAL",
                _("Add a force (angle)"),
                _("Add a force to an object. The object will move according to "
                  "all of the forces it has. This action creates the force "
                  "using the specified angle and length."),
                _("Add to _PARAM0_ _PARAM3_ force, angle: _PARAM1_ degrees and "
                  "length: _PARAM2_ pixels"),
                _("Movement using forces"),
                "res/actions/force24.png",
                "res/actions/force.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angle"))
      .AddParameter("expression", _("Speed (in pixels per second)"))
      .AddParameter("forceMultiplier", _("Force multiplier"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  obj.AddAction(
         "AddForceVersPos",
         _("Add a force to move toward a position"),
         _("Add a force to an object to make it move toward a position."),
         _("Move _PARAM0_ toward _PARAM1_;_PARAM2_ with _PARAM4_ force of "
           "_PARAM3_ "
           "pixels"),
         _("Movement using forces"),
         "res/actions/force24.png",
         "res/actions/force.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter("expression", _("Speed (in pixels per second)"))
      .AddParameter("forceMultiplier", _("Force multiplier"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  obj.AddAction(
         "AddForceTournePos",
         "Add a force to move around a position",
         "Add a force to an object to make it rotate around a "
         "position.\nNote that the movement is not precise, especially if "
         "the speed is high.\nTo position an object around a position more "
         "precisely, use the actions in the category \"Position\".",
         "Rotate _PARAM0_ around _PARAM1_;_PARAM2_ at _PARAM3_ deg/sec and "
         "_PARAM4_ pixels away",
         _("Movement using forces"),
         "res/actions/forceTourne24.png",
         "res/actions/forceTourne.png")

      .AddParameter("object", _("Object"))
      .AddParameter("expression", "X position of the center")
      .AddParameter("expression", "Y position of the center")
      .AddParameter("expression", "Speed (in Degrees per seconds)")
      .AddParameter("expression", "Distance (in pixels)")
      .AddParameter("forceMultiplier", "Force multiplier")
      .SetHidden();

  obj.AddAction("Arreter",
                _("Stop the object"),
                _("Stop the object by deleting all of its forces."),
                _("Stop _PARAM0_ (remove all forces)"),
                _("Movement using forces"),
                "res/actions/arreter24.png",
                "res/actions/arreter.png")

      .AddParameter("object", _("Object"))
      .MarkAsAdvanced();

  obj.AddAction("Delete",
                _("Delete the object"),
                _("Delete the specified object."),
                _("Delete _PARAM0_"),
                _("Objects"),
                "res/actions/delete24.png",
                "res/actions/delete.png")

      .AddParameter("object", _("Object"))
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsSimple();

  obj.AddAction("ChangePlan",
                _("Z order"),
                _("Modify the Z-order of an object"),
                _("the z-order"),
                _("Layers and cameras"),
                "res/actions/planicon24.png",
                "res/actions/planicon.png")

      .AddParameter("object", _("Object"))
      .UseStandardOperatorParameters("number",
                                     ParameterOptions::MakeNewOptions());

  obj.AddAction("ChangeLayer",
                _("Layer"),
                _("Move the object to a different layer."),
                _("Put _PARAM0_ on the layer _PARAM1_"),
                _("Layers and cameras"),
                "res/actions/layer24.png",
                "res/actions/layer.png")

      .AddParameter("object", _("Object"))
      .AddParameter("layer", _("Move it to this layer"))
      .SetDefaultValue("\"\"")
      .MarkAsAdvanced();

  obj.AddAction("ModVarObjet",
                _("Change number variable"),
                _("Modify the number value of an object variable."),
                _("the variable _PARAM1_"),
                _("Variables"),
                "res/actions/var24.png",
                "res/actions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .UseStandardOperatorParameters("number",
                                     ParameterOptions::MakeNewOptions());

  obj.AddAction("ModVarObjetTxt",
                _("Change text variable"),
                _("Modify the text of an object variable."),
                _("the text of variable _PARAM1_"),
                _("Variables"),
                "res/actions/var24.png",
                "res/actions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .UseStandardOperatorParameters("string",
                                     ParameterOptions::MakeNewOptions());

  obj.AddAction("SetObjectVariableAsBoolean",
                _("Change boolean variable"),
                _("Modify the boolean value of an object variable."),
                _("Set the boolean value of variable _PARAM1_ of "
                  "_PARAM0_ to _PARAM2_"),
                _("Variables"),
                "res/actions/var24.png",
                "res/actions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  obj.AddAction(
         "ToggleObjectVariableAsBoolean",
         _("Toggle boolean variable"),
         _("Toggles the boolean value of an object variable.") + "\n" +
             _("If it was true, it will become false, and if it was false "
               "it will become true."),
         _("Toggle the boolean value of variable _PARAM1_ of "
           "_PARAM0_"),
         _("Variables"),
         "res/actions/var24.png",
         "res/actions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"));

  obj.AddCondition("ObjectVariableChildExists",
                   _("Child existence"),
                   _("Check if the specified child of the object "
                     "structure variable exists."),
                   _("Child _PARAM2_ of variable _PARAM1_ of _PARAM0_ exists"),
                   _("Variables/Arrays and structures"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Structure variable"))
      .AddParameter("string", _("Name of the child"))
      .MarkAsAdvanced();

  obj.AddAction("ObjectVariableRemoveChild",
                _("Remove a child"),
                _("Remove a child from an object structure variable."),
                _("Remove child _PARAM2_ from variable _PARAM1_ of _PARAM0_"),
                _("Variables/Arrays and structures"),
                "res/actions/var24.png",
                "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Structure variable"))
      .AddParameter("string", _("Child's name"))
      .MarkAsAdvanced();

  obj.AddAction("ObjectVariableClearChildren",
                _("Clear children"),
                _("Remove all the children from the object array or structure "
                  "variable."),
                _("Clear children from variable _PARAM1_ of _PARAM0_"),
                _("Variables/Arrays and structures"),
                "res/actions/var24.png",
                "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array or structure variable"))
      .MarkAsAdvanced();

  obj.AddAction("Cache",
                _("Hide"),
                _("Hide the specified object."),
                _("Hide _PARAM0_"),
                _("Visibility"),
                "res/actions/visibilite24.png",
                "res/actions/visibilite.png")

      .AddParameter("object", _("Object"))
      .MarkAsSimple();

  obj.AddAction("Montre",
                _("Show"),
                _("Show the specified object."),
                _("Show _PARAM0_"),
                _("Visibility"),
                "res/actions/visibilite24.png",
                "res/actions/visibilite.png")

      .AddParameter("object", _("Object"))
      .AddCodeOnlyParameter("inlineCode", "false")
      .MarkAsSimple();

  obj.AddCondition("Angle",
                   _("Angle"),
                   _("Compare the angle of the specified object."),
                   _("the angle (in degrees)"),
                   _("Angle"),
                   "res/conditions/direction24_black.png",
                   "res/conditions/direction_black.png")

      .AddParameter("object", _("Object"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")))
      .MarkAsAdvanced();

  obj.AddCondition("Plan",
                   _("Z-order"),
                   _("Compare the Z-order of the specified object."),
                   _("the Z-order"),
                   _("Layer"),
                   "res/conditions/planicon24.png",
                   "res/conditions/planicon.png")

      .AddParameter("object", _("Object"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  obj.AddCondition("Layer",
                   _("Current layer"),
                   _("Check if the object is on the specified layer."),
                   _("_PARAM0_ is on layer _PARAM1_"),
                   _("Layer"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")

      .AddParameter("object", _("Object"))
      .AddParameter("layer", _("Layer"))
      .MarkAsAdvanced();

  obj.AddCondition("Visible",
                   _("Visibility"),
                   _("Check if an object is visible."),
                   _("_PARAM0_ is visible (not marked as hidden)"),
                   _("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

      .AddParameter("object", _("Object"))
      .MarkAsSimple();

  obj.AddCondition("Invisible",
                   "Invisibility of an object",
                   "Check if an object is hidden.",
                   "_PARAM0_ is hidden",
                   _("Visibility"),
                   "res/conditions/visibilite24.png",
                   "res/conditions/visibilite.png")

      .AddParameter("object", _("Object"))
      .SetHidden();  // Inverted "Visible" condition  does the same thing.

  obj.AddCondition("Arret",
                   _("Object is stopped (no forces applied on it)"),
                   _("Check if an object is not moving"),
                   _("_PARAM0_ is stopped"),
                   _("Movement using forces"),
                   "res/conditions/arret24.png",
                   "res/conditions/arret.png")

      .AddParameter("object", _("Object"))
      .MarkAsAdvanced();

  obj.AddCondition("Vitesse",
                   _("Speed (from forces)"),
                   _("Compare the overall speed of an object"),
                   _("the overall speed"),
                   _("Movement using forces"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")

      .AddParameter("object", _("Object"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  // Deprecated
  obj.AddCondition("AngleOfDisplacement",
                   _("Angle of movement (using forces)"),
                   _("Compare the angle of movement of an object according to "
                     "the forces applied on it."),
                   _("Angle of movement of _PARAM0_ is _PARAM1_ (tolerance"
                     ": _PARAM2_ degrees)"),
                   _("Movement using forces"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")
      .SetHidden()
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angle, in degrees"))
      .AddParameter("expression", _("Tolerance, in degrees"))
      .MarkAsAdvanced();

  obj.AddCondition("IsTotalForceAngleAround",
                   _("Angle of movement (using forces)"),
                   _("Compare the angle of movement of an object according to "
                     "the forces applied on it."),
                   _("Angle of movement of _PARAM0_ is _PARAM1_ ± _PARAM2_°"),
                   _("Movement using forces"),
                   "res/conditions/vitesse24.png",
                   "res/conditions/vitesse.png")
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angle, in degrees"))
      .AddParameter("expression", _("Tolerance, in degrees"))
      .MarkAsAdvanced();

  obj.AddCondition("VarObjet",
                   _("Number variable"),
                   _("Compare the number value of an object variable."),
                   _("the variable _PARAM1_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions());

  obj.AddCondition("VarObjetTxt",
                   _("Text variable"),
                   _("Compare the text of an object variable."),
                   _("the text of variable _PARAM1_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "string", ParameterOptions::MakeNewOptions());

  obj.AddCondition("ObjectVariableAsBoolean",
                   _("Boolean variable"),
                   _("Compare the boolean value of an object variable."),
                   _("The boolean value of variable _PARAM1_ of object "
                     "_PARAM0_ is _PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .AddParameter("trueorfalse", _("Check if the value is"))
      .SetDefaultValue("true");

  obj.AddCondition("VarObjetDef",
                   "Variable defined",
                   "Check if the object variable is defined.",
                   "Variable _PARAM1 of _PARAM0_ is defined",
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")

      .AddParameter("object", _("Object"))
      .AddParameter("string", _("Variable"))
      .SetHidden();  // Deprecated.

  obj.AddAction(
         "ObjectVariablePush",
         _("Add existing variable"),
         _("Adds an existing variable to the end of an object array variable."),
         _("Add variable _PARAM2_ to array variable _PARAM1_ of _PARAM0_"),
         _("Variables/Arrays and structures"),
         "res/actions/var24.png",
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"))
      .AddParameter("scenevar", _("Scene variable with the content to add"))
      .SetParameterLongDescription(_("The content of the object variable will "
                                     "*be copied* and added at the "
                                     "end of the array."))
      .MarkAsAdvanced();

  obj.AddAction(
         "ObjectVariablePushString",
         _("Add text variable"),
         _("Adds a text (string) to the end of an object array variable."),
         _("Add text _PARAM2_ to array variable _PARAM1_ of _PARAM0_"),
         _("Variables/Arrays and structures"),
         "res/actions/var24.png",
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"))
      .AddParameter("string", _("Text to add"))
      .MarkAsAdvanced();

  obj.AddAction("ObjectVariablePushNumber",
                _("Add number variable"),
                _("Adds a number to the end of an object array variable."),
                _("Add number _PARAM2_ to array variable _PARAM1_ of _PARAM0_"),
                _("Variables/Arrays and structures"),
                "res/actions/var24.png",
                "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"))
      .AddParameter("expression", _("Number to add"))
      .MarkAsAdvanced();

  obj.AddAction(
         "ObjectVariablePushBool",
         _("Add boolean variable"),
         _("Adds a boolean to the end of an object array variable."),
         _("Add boolean _PARAM2_ to array variable _PARAM1_ of _PARAM0_"),
         _("Variables/Arrays and structures"),
         "res/actions/var24.png",
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to add"))
      .MarkAsAdvanced();

  obj.AddAction(
         "ObjectVariableRemoveAt",
         _("Remove variable by index"),
         _("Removes a variable at the specified index of an object array "
           "variable."),
         _("Remove variable at index _PARAM2_ from array variable _PARAM1_ of "
           "_PARAM0_"),
         _("Variables/Arrays and structures"),
         "res/actions/var24.png",
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  obj.AddCondition(
         "ObjectVariableChildCount",
         _("Number of children"),
         _("Compare the number of children in an object array variable."),
         _("The number of children in the array variable _PARAM1_"),
         _("Variables/Arrays and structures"),
         "res/conditions/var24.png",
         "res/conditions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  obj.AddStrExpression(
         "ArrayVariableFirstString",
         _("First text child"),
         _("Get the value of the first element of an object array variable, if "
           "it is a text (string) variable."),
         _("Variables/Arrays and structures"),
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"));

  obj.AddExpression(
         "ArrayVariableFirstNumber",
         _("First number child"),
         _("Get the value of the first element of an object array variable, if "
           "it is a number variable."),
         _("Variables/Arrays and structures"),
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"));

  obj.AddStrExpression(
         "ArrayVariableLastString",
         _("Last text child"),
         _("Get the value of the last element of an object array variable, if "
           "it is a text (string) variable."),
         _("Variables/Arrays and structures"),
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"));

  obj.AddExpression(
         "ArrayVariableLastNumber",
         _("Last number child"),
         _("Get the value of the last element of an object array variable, if "
           "it is a number variable."),
         _("Variables/Arrays and structures"),
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array variable"));

  obj.AddCondition("BehaviorActivated",
                   _("Behavior activated"),
                   _("Check if the behavior is activated for the object."),
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
                _("Move _PARAM0_ toward _PARAM1_ with _PARAM3_ force of "
                  "_PARAM2_ pixels"),
                _("Movement using forces"),
                "res/actions/forceVers24.png",
                "res/actions/forceVers.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectPtr", _("Target Object"))
      .AddParameter("expression", _("Speed (in pixels per second)"))
      .AddParameter("forceMultiplier", _("Force multiplier"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  obj.AddAction(
         "AddForceTourne",
         _("Add a force to move around an object"),
         _("Add a force to an object to make it rotate around another.\nNote "
           "that the movement is not precise, especially if the speed is "
           "high.\nTo position an object around a position more precisely, use "
           "the actions in category \"Position\"."),
         _("Rotate _PARAM0_ around _PARAM1_ at _PARAM2_ deg/sec and _PARAM3_ "
           "pixels away"),
         _("Movement using forces"),
         "res/actions/forceTourne24.png",
         "res/actions/forceTourne.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectPtr", _("Rotate around this object"))
      .AddParameter("expression", _("Speed (in degrees per second)"))
      .AddParameter("expression", _("Distance (in pixels)"))
      .AddParameter("forceMultiplier", _("Force multiplier"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  obj.AddAction("MettreAutour",
                _("Put the object around another"),
                _("Position an object around another, with the specified angle "
                  "and distance. The center of the objects are used for "
                  "positioning them."),
                _("Put _PARAM0_ around _PARAM1_, with an angle of _PARAM3_ "
                  "degrees and _PARAM2_ pixels distance."),
                _("Position"),
                "res/actions/positionAutour24.png",
                "res/actions/positionAutour.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectPtr", _("\"Center\" Object"))
      .AddParameter("expression", _("Distance"))
      .AddParameter("expression", _("Angle, in degrees"))
      .MarkAsAdvanced();

  // Deprecated action
  obj.AddAction("Rebondir",
                "Move an object away from another",
                "Move an object away from another, using forces.",
                "Move _PARAM0_ away from _PARAM1_ (only _PARAM0_ will move)",
                _("Movement using forces"),
                "res/actions/ecarter24.png",
                "res/actions/ecarter.png")

      .SetHidden()
      .AddParameter("object", _("Object"))
      .AddParameter("objectList", "Object 2 (won't move)");

  // Deprecated action
  obj.AddAction("Ecarter",
                "Move an object away from another",
                "Move an object away from another without using forces.",
                "Move _PARAM0_ away from _PARAM2_ (only _PARAM0_ will move)",
                _("Position"),
                "res/actions/ecarter24.png",
                "res/actions/ecarter.png")

      .SetHidden()
      .AddParameter("object", _("Object"))
      .AddParameter("objectList", "Object 2 (won't move)");

  obj.AddAction("SeparateFromObjects",
                _("Separate objects"),
                _("Move an object away from another using their collision "
                  "masks.\nBe sure to call this action on a reasonable number "
                  "of objects\nto avoid slowing down the game."),
                _("Move _PARAM0_ away from _PARAM1_ (only _PARAM0_ will move)"),
                _("Position"),
                "res/actions/ecarter24.png",
                "res/actions/ecarter.png")

      .AddParameter("object", _("Object"))
      .AddParameter("objectList", _("Objects (won't move)"))
      .AddParameter("yesorno",
                    _("Ignore objects that are touching each other on their "
                      "edges, but are not overlapping (default: no)"),
                    "",
                    true)
      .SetDefaultValue("no")
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

  extension
      .AddCondition("SourisSurObjet",
                    _("The cursor/touch is on an object"),
                    _("Test if the cursor is over an object, or if the object "
                      "is being touched."),
                    _("The cursor/touch is on _PARAM0_"),
                    _("Mouse and touch"),
                    "res/conditions/surObjet24.png",
                    "res/conditions/surObjet.png")

      .AddParameter("objectList", _("Object"))
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno", _("Accurate test (yes by default)"), "", true)
      .SetDefaultValue("yes")
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsSimple();

  // Deprecated and replaced by CompareObjectTimer
  obj.AddCondition(
         "ObjectTimer",
         _("Value of an object timer"),
         _("Test the elapsed time of an object timer."),
         _("The timer _PARAM1_ of _PARAM0_ is greater than _PARAM2_ seconds"),
         _("Timers"),
         "res/conditions/timer24.png",
         "res/conditions/timer.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer")
      .AddParameter("expression", _("Time in seconds"))
      .SetHidden();

  obj.AddCondition(
         "CompareObjectTimer",
         _("Value of an object timer"),
         _("Compare the elapsed time of an object timer. This condition "
           "doesn't start the timer."),
         _("The timer _PARAM1_ of _PARAM0_ _PARAM2_ _PARAM3_ seconds"),
         _("Timers"),
         "res/conditions/timer24.png",
         "res/conditions/timer.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer")
      .AddParameter("relationalOperator", _("Sign of the test"), "time")
      .AddParameter("expression", _("Time in seconds"))
      .SetManipulatedType("number");

  obj.AddCondition("ObjectTimerPaused",
                   _("Object timer paused"),
                   _("Test if specified object timer is paused."),
                   _("The timer _PARAM1_ of _PARAM0_ is paused"),
                   _("Timers"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer")
      .MarkAsAdvanced();

  obj.AddAction(
         "ResetObjectTimer",
         _("Start (or reset) an object timer"),
         _("Reset the specified object timer, if the timer doesn't exist "
           "it's created and started."),
         _("Start (or reset) the timer _PARAM1_ of _PARAM0_"),
         _("Timers"),
         "res/actions/timer24.png",
         "res/actions/timer.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer");

  obj.AddAction("PauseObjectTimer",
                _("Pause an object timer"),
                _("Pause an object timer."),
                _("Pause timer _PARAM1_ of _PARAM0_"),
                _("Timers"),
                "res/actions/pauseTimer24.png",
                "res/actions/pauseTimer.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer")
      .MarkAsAdvanced();

  obj.AddAction("UnPauseObjectTimer",
                _("Unpause an object timer"),
                _("Unpause an object timer."),
                _("Unpause timer _PARAM1_ of _PARAM0_"),
                _("Timers"),
                "res/actions/unPauseTimer24.png",
                "res/actions/unPauseTimer.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer")
      .MarkAsAdvanced();

  obj.AddAction("RemoveObjectTimer",
                _("Delete an object timer"),
                _("Delete an object timer from memory."),
                _("Delete timer _PARAM1_ of _PARAM0_ from memory"),
                _("Timers"),
                "res/actions/timer24.png",
                "res/actions/timer.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer")
      .MarkAsAdvanced();

  obj.AddExpression("X",
                    _("X position"),
                    _("X position of the object"),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("Y",
                    _("Y position"),
                    _("Y position of the object"),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("Angle",
                    _("Angle"),
                    _("Current angle, in degrees, of the object"),
                    _("Angle"),
                    "res/actions/direction_black.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("ForceX",
                    _("X coordinate of the sum of forces"),
                    _("X coordinate of the sum of forces"),
                    _("Movement using forces"),
                    "res/actions/force.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("ForceY",
                    _("Y coordinate of the sum of forces"),
                    _("Y coordinate of the sum of forces"),
                    _("Movement using forces"),
                    "res/actions/force.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("ForceAngle",
                    _("Angle of the sum of forces"),
                    _("Angle of the sum of forces (in degrees)"),
                    _("Movement using forces"),
                    "res/actions/force.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("ForceLength",
                    _("Length of the sum of forces"),
                    _("Length of the sum of forces"),
                    _("Movement using forces"),
                    "res/actions/force.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("Longueur",
                    _("Length of the sum of forces"),
                    _("Length of the sum of forces"),
                    _("Movement using forces"),
                    "res/actions/force.png")
      .AddParameter("object", _("Object"))
      .SetHidden();

  obj.AddExpression("Width",
                    _("Width"),
                    _("Width of the object"),
                    _("Size"),
                    "res/actions/scaleWidth_black.png")
      .AddParameter("object", _("Object"));

  // Deprecated
  obj.AddExpression("Largeur",
                    _("Width"),
                    _("Width of the object"),
                    _("Size"),
                    "res/actions/scaleWidth_black.png")
      .AddParameter("object", _("Object"))
      .SetHidden();

  obj.AddExpression("Height",
                    _("Height"),
                    _("Height of the object"),
                    _("Size"),
                    "res/actions/scaleHeight_black.png")
      .AddParameter("object", _("Object"));

  // Deprecated
  obj.AddExpression("Hauteur",
                    _("Height"),
                    _("Height of the object"),
                    _("Size"),
                    "res/actions/scaleHeight_black.png")
      .AddParameter("object", _("Object"))
      .SetHidden();

  obj.AddExpression("ZOrder",
                    _("Z-order"),
                    _("Z-order of an object"),
                    "",
                    "res/actions/planicon.png")
      .AddParameter("object", _("Object"));

  obj.AddExpression("Plan",
                    _("Z-order"),
                    _("Z-order of an object"),
                    _("Visibility"),
                    "res/actions/planicon.png")
      .AddParameter("object", _("Object"))
      .SetHidden();

  obj.AddExpression("Distance",
                    _("Distance between two objects"),
                    _("Distance between two objects"),
                    _("Position"),
                    "res/conditions/distance.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectPtr", _("Object"));

  obj.AddExpression("SqDistance",
                    _("Square distance between two objects"),
                    _("Square distance between two objects"),
                    _("Position"),
                    "res/conditions/distance.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectPtr", _("Object"));

  obj.AddExpression("DistanceToPosition",
                    _("Distance between an object and a position"),
                    _("Distance between an object and a position"),
                    _("Position"),
                    "res/conditions/distance.png")
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Target X position"))
      .AddParameter("expression", _("Target Y position"));

  obj.AddExpression("SqDistanceToPosition",
                    _("Square distance between an object and a position"),
                    _("Square distance between an object and a position"),
                    _("Position"),
                    "res/conditions/distance.png")
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Target X position"))
      .AddParameter("expression", _("Target Y position"));

  obj.AddExpression("Variable",
                    _("Number variable"),
                    _("Number value of an object variable"),
                    _("Variables"),
                    "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"));

  obj.AddExpression(
         "VariableChildCount",
         _("Number of children"),
         _("Number of children in an object array or structure variable"),
         _("Variables/Arrays and structures"),
         "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Array or structure variable"));

  obj.AddStrExpression("VariableString",
                       _("Text variable"),
                       _("Text of an object variable"),
                       _("Variables"),
                       "res/actions/var.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectvar", _("Variable"));

  obj.AddExpression("ObjectTimerElapsedTime",
                    _("Object timer value"),
                    _("Value of an object timer"),
                    _("Timers"),
                    "res/actions/time.png")
      .AddParameter("object", _("Object"))
      .AddParameter("identifier", _("Timer's name"), "objectTimer");

  obj.AddExpression("AngleToObject",
                    _("Angle between two objects"),
                    _("Compute the angle between two objects (in degrees). "
                      "If you need the angle to an arbitrary position, "
                      "use AngleToPosition."),
                    _("Angle"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("objectPtr", _("Object"));

  obj.AddExpression("XFromAngleAndDistance",
                    _("X position from angle and distance"),
                    _("Compute the X position when given an angle and distance "
                      "relative to the starting object. This is also known as "
                      "getting the cartesian coordinates of a 2D vector, using "
                      "its polar coordinates."),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angle, in degrees"))
      .AddParameter("expression", _("Distance"));

  obj.AddExpression("YFromAngleAndDistance",
                    _("Y position from angle and distance"),
                    _("Compute the Y position when given an angle and distance "
                      "relative to the starting object. This is also known as "
                      "getting the cartesian coordinates of a 2D vector, using "
                      "its polar coordinates."),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Angle, in degrees"))
      .AddParameter("expression", _("Distance"));

  obj.AddExpression("AngleToPosition",
                    _("Angle between an object and a position"),
                    _("Compute the angle between the object center and a "
                      "\"target\" position (in degrees). If you need the angle "
                      "between two objects, use AngleToObject."),
                    _("Angle"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("expression", _("Target X position"))
      .AddParameter("expression", _("Target Y position"));

  // Deprecated
  obj.AddAction("EnableEffect",
                _("Enable an object effect"),
                _("Enable an effect on the object"),
                _("Enable effect _PARAM1_ on _PARAM0_: _PARAM2_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("yesorno", _("Enable?"))
      .MarkAsSimple()
      .SetHidden();

  // Deprecated
  obj.AddAction("SetEffectDoubleParameter",
                _("Effect property (number)"),
                _("Change the value of a property of an effect.") + "\n" +
                    _("You can find the property names (and change the effect "
                      "names) in the effects window."),
                _("Set _PARAM2_ to _PARAM3_ for effect _PARAM1_ of _PARAM0_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Property name"))
      .AddParameter("expression", _("New value"))
      .MarkAsSimple()
      .SetHidden();

  // Deprecated
  obj.AddAction("SetEffectStringParameter",
                _("Effect property (string)"),
                _("Change the value (string) of a property of an effect.") +
                    "\n" +
                    _("You can find the property names (and change the effect "
                      "names) in the effects window."),
                _("Set _PARAM2_ to _PARAM3_ for effect _PARAM1_ of _PARAM0_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Property name"))
      .AddParameter("string", _("New value"))
      .MarkAsSimple()
      .SetHidden();

  // Deprecated
  obj.AddAction("SetEffectBooleanParameter",
                _("Effect property (enable or disable)"),
                _("Enable or disable a property of an effect.") + "\n" +
                    _("You can find the property names (and change the effect "
                      "names) in the effects window."),
                _("Enable _PARAM2_ for effect _PARAM1_ of _PARAM0_: _PARAM3_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Property name"))
      .AddParameter("yesorno", _("Enable this property"))
      .MarkAsSimple()
      .SetHidden();

  // Deprecated
  obj.AddCondition("IsEffectEnabled",
                   _("Effect is enabled"),
                   _("Check if the effect on an object is enabled."),
                   _("Effect _PARAM1_ of _PARAM0_ is enabled"),
                   _("Effects"),
                   "res/actions/effect_black.svg",
                   "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("objectEffectName", _("Effect name"))
      .MarkAsSimple()
      .SetHidden();

  obj.AddAction("SetIncludedInParentCollisionMask",
                _("Include in parent collision mask"),
                _("Include or exclude a child from its parent collision mask."),
                _("Include _PARAM0_ in parent object collision mask: _PARAM1_"),
                _("Collision"),
                "res/function32.png",
                "res/function32.png")
      .AddParameter("object", _("Object"))
      .AddParameter("yesorno", "Include in parent collision mask")
      .SetRelevantForCustomObjectEventsOnly();

  extension
      .AddAction("Create",
                 _("Create an object"),
                 _("Create an object at specified position"),
                 _("Create object _PARAM1_ at position _PARAM2_;_PARAM3_ "
                   "(layer: _PARAM4_)"),
                 "",
                 "res/actions/create24.png",
                 "res/actions/create24.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectListOrEmptyIfJustDeclared", _("Object to create"))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .MarkAsSimple();

  extension
      .AddAction("CreateByName",
                 _("Create an object from its name"),
                 _("Among the objects of the specified group, this action will "
                   "create the object with the specified name."),
                 _("Among objects _PARAM1_, create object named _PARAM2_ at "
                   "position _PARAM3_;_PARAM4_ (layer: _PARAM5_)"),
                 "",
                 "res/actions/create24.png",
                 "res/actions/create24.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectListOrEmptyIfJustDeclared",
                    _("Group of potential objects"))
      .SetParameterLongDescription(
          _("Group containing objects that can be created by the action."))
      .AddParameter("string", _("Name of the object to create"))
      .SetParameterLongDescription(_(
          "Text representing the name of the object to create. If no objects "
          "with this name are found in the group, no object will be created."))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .MarkAsAdvanced();

  extension
      .AddAction("AjoutObjConcern",
                 _("Pick all instances"),
                 _("Pick all instances of the specified object(s). When you "
                   "pick all instances, "
                   "the next conditions and actions of this event work on all "
                   "of them."),
                 _("Pick all instances of _PARAM1_"),
                 _("Objects"),
                 "res/actions/add24.png",
                 "res/actions/add.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectList", _("Object"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "AjoutHasard",
          _("Pick a random object"),
          _("Pick one object from all the specified objects. When an object "
            "is picked, the next conditions and actions of this event work "
            "only on that object."),
          _("Pick a random _PARAM1_"),
          _("Objects"),
          "res/actions/ajouthasard24.png",
          "res/actions/ajouthasard.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectList", _("Object"))
      .MarkAsSimple();

  extension
      .AddAction(
          "MoveObjects",
          _("Apply movement to all objects"),
          _("Moves all objects according to the forces they have. GDevelop "
            "calls this action at the end of the events by default."),
          _("Apply movement to all objects"),
          _("Movement using forces"),
          "res/actions/doMove24.png",
          "res/actions/doMove.png")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddCondition("SeDirige",
                    _("An object is moving toward another (using forces)"),
                    _("Check if an object moves toward another.\nThe first "
                      "object must move."),
                    _("_PARAM0_ is moving toward _PARAM1_"),
                    _("Movement using forces"),
                    "res/conditions/sedirige24.png",
                    "res/conditions/sedirige.png")
      .AddParameter("objectList", _("Object"))
      .AddParameter("objectList", _("Object 2"))
      .AddParameter("expression", _("Tolerance, in degrees"))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsAdvanced();

  extension
      .AddCondition("Distance",
                    _("Distance between two objects"),
                    _("Compare the distance between two objects.\nIf condition "
                      "is inverted, only objects that have a distance greater "
                      "than specified to any other object will be picked."),
                    _("_PARAM0_ distance to _PARAM1_ is below _PARAM2_ pixels"),
                    _("Position"),
                    "res/conditions/distance24.png",
                    "res/conditions/distance.png")
      .AddParameter("objectList", _("Object"))
      .AddParameter("objectList", _("Object 2"))
      .AddParameter("expression", _("Distance"))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsSimple();

  extension
      .AddCondition(
          "AjoutObjConcern",
          _("Pick all objects"),
          _("Pick all the specified objects. When you pick all objects, "
            "the next conditions and actions of this event work on all "
            "of them."),
          _("Pick all _PARAM1_ objects"),
          _("Objects"),
          "res/conditions/add24.png",
          "res/conditions/add.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectList", _("Object"))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "AjoutHasard",
          _("Pick a random object"),
          _("Pick one object from all the specified objects. When an object "
            "is picked, the next conditions and actions of this event work "
            "only on that object."),
          _("Pick a random _PARAM1_"),
          _("Objects"),
          "res/conditions/ajouthasard24.png",
          "res/conditions/ajouthasard.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectList", _("Object"))
      .MarkAsSimple();

  extension
      .AddCondition(
          "PickNearest",
          _("Pick nearest object"),
          _("Pick the object of this type that is nearest to the specified "
            "position. If the condition is inverted, the object farthest from "
            "the specified position is picked instead."),
          _("Pick the _PARAM0_ that is nearest to _PARAM1_;_PARAM2_"),
          _("Objects"),
          "res/conditions/distance24.png",
          "res/conditions/distance.png")
      .AddParameter("objectList", _("Object"))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsSimple();

  extension
      .AddCondition(
          "NbObjet",
          _("Number of objects"),
          _("Count how many of the specified objects are currently picked, and "
            "compare that number to a value. If previous conditions on the "
            "objects have not been used, this condition counts how many of "
            "these objects exist in the current scene."),
          _("the number of _PARAM0_ objects"),
          _("Objects"),
          "res/conditions/nbObjet24.png",
          "res/conditions/nbObjet.png")
      .AddParameter("objectList", _("Object"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsSimple()
      .SetHidden();

  extension
      .AddExpressionAndCondition(
          "number",
          "SceneInstancesCount",
          _("Number of object instances on the scene"),
          _("the number of instances of the specified objects living on the "
            "scene"),
          _("the number of _PARAM1_ living on the scene"),
          _("Objects"),
          "res/conditions/nbObjet24.png")
      .AddCodeOnlyParameter("objectsContext", "")
      .AddParameter("objectListOrEmptyWithoutPicking", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsSimple();

  extension
      .AddExpressionAndCondition(
          "number",
          "PickedInstancesCount",
          _("Number of object instances currently picked"),
          _("the number of instances picked by the previous conditions (or "
            "actions)"),
          _("the number of _PARAM0_ currently picked"),
          _("Objects"),
          "res/conditions/nbObjet24.png")
      .AddParameter("objectListOrEmptyWithoutPicking", _("Object"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsSimple();

  extension
      .AddCondition(
          "CollisionNP",
          _("Collision"),
          _("Test the collision between two objects using their collision "
            "masks."),
          _("_PARAM0_ is in collision with _PARAM1_"),
          _("Collision"),
          "res/conditions/collision24.png",
          "res/conditions/collision.png")
      .AddParameter("objectList", _("Object"))
      .AddParameter("objectList", _("Object"))
      .AddCodeOnlyParameter("conditionInverted", "")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno",
                    _("Ignore objects that are touching each other on their "
                      "edges, but are not overlapping (default: no)"),
                    "",
                    true)
      .SetDefaultValue("no")
      .MarkAsSimple();

  extension
      .AddCondition("EstTourne",
                    _("An object is turned toward another"),
                    _("Check if an object is turned toward another"),
                    _("_PARAM0_ is rotated towards _PARAM1_"),
                    _("Angle"),
                    "res/conditions/estTourne24.png",
                    "res/conditions/estTourne.png")
      .AddParameter("objectList", _("Name of the object"))
      .AddParameter("objectList", _("Name of the second object"))
      .AddParameter("expression",
                    _("Angle of tolerance, in degrees (0: minimum tolerance)"))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "Raycast",
          _("Raycast"),
          _("Sends a ray from the given source position and angle, "
            "intersecting the closest object.\nThe intersected "
            "object will become the only one taken into account.\nIf "
            "the condition is inverted, the object to be intersected "
            "will be the farthest one within the ray radius."),
          _("Cast a ray from _PARAM1_;_PARAM2_, angle: _PARAM3_ and max "
            "distance: _PARAM4_px, against _PARAM0_, and save the "
            "result in _PARAM5_, _PARAM6_"),
          _("Collision"),
          "res/conditions/raycast24.png",
          "res/conditions/raycast.png")
      .AddParameter("objectList", _("Objects to test against the ray"))
      .AddParameter("expression", _("Ray source X position"))
      .AddParameter("expression", _("Ray source Y position"))
      .AddParameter("expression", _("Ray angle (in degrees)"))
      .AddParameter("expression", _("Ray maximum distance (in pixels)"))
      .AddParameter("scenevar", _("Result X position scene variable"))
      .SetParameterLongDescription(
          _("Scene variable where to store the X position of the intersection. "
            "If no intersection is found, the variable won't be changed."))
      .AddParameter("scenevar", _("Result Y position scene variable"))
      .SetParameterLongDescription(
          _("Scene variable where to store the Y position of the intersection. "
            "If no intersection is found, the variable won't be changed."))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "RaycastToPosition",
          _("Raycast to position"),
          _("Sends a ray from the given source position to the final point, "
            "intersecting the closest object.\nThe intersected "
            "object will become the only one taken into account.\nIf "
            "the condition is inverted, the object to be intersected "
            "will be the farthest one within the ray radius."),
          _("Cast a ray from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ "
            "against _PARAM0_, and save the "
            "result in _PARAM5_, _PARAM6_"),
          _("Collision"),
          "res/conditions/raycast24.png",
          "res/conditions/raycast.png")
      .AddParameter("objectList", _("Objects to test against the ray"))
      .AddParameter("expression", _("Ray source X position"))
      .AddParameter("expression", _("Ray source Y position"))
      .AddParameter("expression", _("Ray target X position"))
      .AddParameter("expression", _("Ray target Y position"))
      .AddParameter("scenevar", _("Result X position scene variable"))
      .SetParameterLongDescription(
          _("Scene variable where to store the X position of the intersection. "
            "If no intersection is found, the variable won't be changed."))
      .AddParameter("scenevar", _("Result Y position scene variable"))
      .SetParameterLongDescription(
          _("Scene variable where to store the Y position of the intersection. "
            "If no intersection is found, the variable won't be changed."))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsAdvanced();

  extension
      .AddExpression("Count",
                     _("Number of objects"),
                     _("Count the number of the specified objects being "
                       "currently picked in the event"),
                     "",
                     "res/conditions/nbObjet.png")
      .AddParameter("objectList", _("Object"))
      .SetHidden();  // Deprecated

  obj.AddStrExpression("ObjectName",
                       _("Object name"),
                       _("Return the name of the object"),
                       "",
                       "res/conditions/text_black.png")
      .AddParameter("object", _("Object"));

  obj.AddStrExpression("Layer",
                       _("Object layer"),
                       _("Return the name of the layer the object is on"),
                       "",
                       "res/actions/layer.png")
      .AddParameter("object", _("Object"));
}

}  // namespace gd
