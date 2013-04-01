#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Object.h"
#include "GDL/RuntimeObject.h"

BaseObjectExtension::BaseObjectExtension()
{
    DECLARE_THE_EXTENSION("BuiltinObject",
                          _("Base object"),
                          _("Base object"),
                          "Compil Games",
                          "Freeware")

    DeclareExtensionFirstPart();
    DeclareExtensionSecondPart();
}

void BaseObjectExtension::DeclareExtensionFirstPart()
{
    //Declaration of all objects available
    DECLARE_OBJECT("",
                   _("Base object"),
                   _("Base object"),
                   "res/objeticon24.png",
                   &CreateBaseObject,
                   &DestroyBaseObject,
                   &CreateBaseRuntimeObject,
                   &DestroyBaseRuntimeObject,
                   "");

        #if defined(GD_IDE_ONLY)
        DECLARE_OBJECT_CONDITION("PosX",
                       _("Test X position of an object"),
                       _("Test the X position of the objext"),
                       _("The X position of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("X position"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetX").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("MettreX",
                       _("X position of an object"),
                       _("Change the X position of an object."),
                       _("Do _PARAM2__PARAM1_ to the X position of _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Value"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("SetX").SetManipulatedType("number").SetAssociatedGetter("GetX");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("PosY",
                       _("Test Y position of an object"),
                       _("Test the Y position of an object"),
                       _("The Y position of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Y position"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetY").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("MettreY",
                       _("Y position of an object"),
                       _("Change the Y position of an object."),
                       _("Do _PARAM2__PARAM1_ to the Y position of _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Value"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("SetY").SetManipulatedType("number").SetAssociatedGetter("GetY");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreXY",
                       _("Position of an object"),
                       _("Change the position of an object."),
                       _("Do _PARAM2__PARAM1_;_PARAM4__PARAM3_ to the position of _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("X position"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);
            instrInfo.AddParameter("expression", _("Y position"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("SetXY");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreAutourPos",
                       _("Put an object around a position"),
                       _("Position an object around a position, with specified angle and distance."),
                       _("Put _PARAM0_ around _PARAM1_;_PARAM2_, with an angle of _PARAM4_° and _PARAM3_ pixels distance."),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("X position"), "", false);
            instrInfo.AddParameter("expression", _("Y position"), "", false);
            instrInfo.AddParameter("expression", _("Distance"), "", false);
            instrInfo.AddParameter("expression", _("Angle, in degrees"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("PutAroundAPosition");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceXY",
                       _("Add a force to an object"),
                       _("Add a force to an object. The object will move according to\nall forces it owns. This action create the force with its X and Y coordinates."),
                       _("Add to _PARAM0_ a force of _PARAM1_ p/s on X axis and _PARAM2_ p/s on Y axis"),
                       _("Displacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("X coordinate of moving"), "", false);
            instrInfo.AddParameter("expression", _("Y coordinate of moving"), "", false);
            instrInfo.AddParameter("expression", _("Damping ( Default : 0 )"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("AddForce");

        DECLARE_END_OBJECT_ACTION()
        DECLARE_OBJECT_ACTION("AddForceAL",
                       _("Add a force ( angle )"),
                       _("Add a force to an object. The object will move according to\nall forces it owns. This action creates the force using the specified angle and length."),
                       _("Add to _PARAM0_ a force, angle : _PARAM1_° and length : _PARAM2_ pixels"),
                       _("Displacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Angle"), "", false);
            instrInfo.AddParameter("expression", _("Length ( in pixels )"), "", false);
            instrInfo.AddParameter("expression", _("Damping ( Default : 0 )"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("AddForceUsingPolarCoordinates");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceVersPos",
                       _("Add a force so as to move to a position"),
                       _("Add a force to an object so as it moves to the position."),
                       _("Move _PARAM0_ to _PARAM1_;_PARAM2_ with a force of _PARAM3_ pixels"),
                       _("Displacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("X position"), "", false);
            instrInfo.AddParameter("expression", _("Y position"), "", false);
            instrInfo.AddParameter("expression", _("Length ( in pixels )"), "", false);
            instrInfo.AddParameter("expression", _("Damping ( Default : 0 )"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("AddForceTowardPosition");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceTournePos",
                       _("Add a force so as to move around a position"),
                       _("Add a force to an object so as it rotates toward a position.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                       _("Rotate _PARAM0_ around _PARAM1_;_PARAM2_ with _PARAM3_°/sec and _PARAM4_ pixels away"),
                       _("Displacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("X position of the center"), "", false);
            instrInfo.AddParameter("expression", _("Y position of the center"), "", false);
            instrInfo.AddParameter("expression", _("Speed ( in Degrees per seconds )"), "", false);
            instrInfo.AddParameter("expression", _("Distance ( in pixels )"), "", false);
            instrInfo.AddParameter("expression", _("Damping ( Default : 0 )"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("AddForceToMoveAround");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Arreter",
                       _("Stop the object"),
                       _("Stop the object by deleting all its forces."),
                       _("Stop the object _PARAM0_"),
                       _("Displacement"),
                       "res/actions/arreter24.png",
                       "res/actions/arreter.png");

            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("ClearForce");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Delete",
                       _("Delete an object"),
                       _("Delete the specified object."),
                       _("Delete object _PARAM0_"),
                       _("Objects"),
                       "res/actions/delete24.png",
                       "res/actions/delete.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddCodeOnlyParameter("currentScene","");

            instrInfo.cppCallingInformation.SetFunctionName("DeleteFromScene");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Duplicate",
                       _("Duplicate an object"),
                       _("Create a copy of an object"),
                       _("Duplicate the object _PARAM0_"),
                       _("Objects"),
                       "res/actions/duplicate24.png",
                       "res/actions/duplicate.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddCodeOnlyParameter("currentScene", "");
            instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");

            instrInfo.cppCallingInformation.SetFunctionName("Duplicate");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangePlan",
                       _("Change Z order of an object"),
                       _("Modify the z order of an object"),
                       _("Do _PARAM2__PARAM1_ to z-Order of _PARAM0_"),
                       _("Z order"),
                       "res/actions/planicon24.png",
                       "res/actions/planicon.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Value"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("SetZOrder").SetAssociatedGetter("GetZOrder").SetManipulatedType("number");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeLayer",
                       _("Change an object's layer"),
                       _("Change the layer where is the object."),
                       _("Put _PARAM0_ on the layer _PARAM1_"),
                       _("Layers and cameras"),
                       "res/actions/layer24.png",
                       "res/actions/layer.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("layer", _("Put on the layer ( base layer if empty )"), "", false).SetDefaultValue("\"\"");

            instrInfo.cppCallingInformation.SetFunctionName("SetLayer");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ModVarObjet",
                       _("Modify a variable of an object"),
                       _("Modify the value of a variable of an object"),
                       _("Do _PARAM3__PARAM2_ to variable _PARAM1_ of _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);
            instrInfo.AddParameter("expression", _("Value"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("number");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ModVarObjetTxt",
                       _("Modify the text of a variable of an object"),
                       _("Modify the text of a variable of an object"),
                       _("Do _PARAM3__PARAM2_ to the text of variable _PARAM1_ of _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);
            instrInfo.AddParameter("string", _("Text"), "", false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("string");

        DECLARE_END_OBJECT_ACTION()


        DECLARE_OBJECT_ACTION("Cache",
                       _("Hide an object"),
                       _("Hide the specified object."),
                       _("Hide the object _PARAM0_"),
                       _("Visibility"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png");

            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("SetHidden");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Montre",
                       _("Show an object"),
                       _("Show the specified object"),
                       _("Show object _PARAM0_"),
                       _("Visibility"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddCodeOnlyParameter("inlineCode", "false");

            instrInfo.cppCallingInformation.SetFunctionName("SetHidden");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("Plan",
                       _("Test the Z order of an object"),
                       _("Test the z-order of the specified object."),
                       _("The Z Order of _PARAM0_ is _PARAM2_ _PARAM1_"),
                       _("Z order"),
                       "res/conditions/planicon.png",
                       "res/conditions/planicon.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Z order"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetZOrder").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Layer",
                       _("Test the layer of an object"),
                       _("Test if the object is on the specified layer."),
                       _("_PARAM0_ is on layer _PARAM1_"),
                       _("Layer"),
                       "res/conditions/layer24.png",
                       "res/conditions/layer.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("layer", _("Layer"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Layer"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsOnLayer");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Visible",
                       _("Visibility of an object"),
                       _("Test if an object is not hidden."),
                       _("The object _PARAM0_ is visible"),
                       _("Visibility"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png");

            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsVisible");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Invisible",
                       _("Invisibility of an object"),
                       _("Test if an object is hidden."),
                       _("_PARAM0_ is hidden"),
                       _("Visibility"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png");

            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsHidden");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Arret",
                       _("An object is stopped"),
                       _("Test if an object does not move"),
                       _("_PARAM0_ is stopped"),
                       _("Displacement"),
                       "res/conditions/arret24.png",
                       "res/conditions/arret.png");

            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsStopped");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Vitesse",
                       _("Speed of the object"),
                       _("Test the overall speed of an object"),
                       _("The speed of _PARAM0_ is _PARAM2_ _PARAM1_"),
                       _("Displacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Speed"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceLength").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AngleOfDisplacement",
                       _("Angle of moving"),
                       _("Test the angle of displacement of an object"),
                       _("The angle of displacement of _PARAM0_ is _PARAM1_ ( tolerance : _PARAM2_° )"),
                       _("Displacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("expression", _("Angle, in degrees"), "", false);
            instrInfo.AddParameter("expression", _("Tolerance"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TestAngleOfDisplacement");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjet",
                       _("Object's variable"),
                       _("Test the value of a variable of an object."),
                       _("Variable _PARAM1_ of _PARAM0_ is _PARAM3__PARAM2_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);
            instrInfo.AddParameter("expression", _("Value to test"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjetTxt",
                       _("Text of variable of an object"),
                       _("Test the text of variable of an object."),
                       _("The text of variable _PARAM1_ of _PARAM0_ is _PARAM3__PARAM2_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);
            instrInfo.AddParameter("string", _("Text to test"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("string");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjetDef",
                       _("Variable defined"),
                       _("Test "),
                       _("Variable _PARAM1 of _PARAM0_ is defined"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().HasVariableNamed");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AutomatismActivated",
                       _("Automatism activated"),
                       _("Return true if the automatism is activated for the object."),
                       _("Automatism _PARAM1_ of _PARAM0_ is activated"),
                       _("Automatisms"),
                       "res/automatism24.png",
                       "res/automatism16.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("automatism", _("Automatism"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("AutomatismActivated");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("ActivateAutomatism",
                       _("De/activate an automatism"),
                       _("De/activate the automatism for the object."),
                       _("Activate automatism _PARAM1_ of _PARAM0_: _PARAM2_"),
                       _("Automatisms"),
                       "res/automatism24.png",
                       "res/automatism16.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("automatism", _("Automatism"), "", false);
            instrInfo.AddParameter("yesorno", _("Activate \?"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("ActivateAutomatism");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceVers",
                       _("Add a force so as to move to an object"),
                       _("Add a force to an object so as it moves to another."),
                       _("Move _PARAM0_ to _PARAM1_ with a force of _PARAM2_ pixels"),
                       _("Displacement"),
                       "res/actions/forceVers24.png",
                       "res/actions/forceVers.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Target Object"), "", false);
            instrInfo.AddParameter("expression", _("Length in pixel"), "", false);
            instrInfo.AddParameter("expression", _("Damping ( Default : 0 )"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("AddForceTowardObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceTourne",
                       _("Add a force so as to move around an object"),
                       _("Add a force to an object so as it rotates around another.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                       _("Rotate _PARAM0_ around _PARAM1_ with _PARAM2_°/sec and _PARAM3_ pixels away"),
                       _("Displacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Rotate around this object"), "", false);
            instrInfo.AddParameter("expression", _("Speed ( Degrees per second )"), "", false);
            instrInfo.AddParameter("expression", _("Distance ( in pixel )"), "", false);
            instrInfo.AddParameter("expression", _("Damping ( Default : 0 )"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreAutour",
                       _("Put an object around another"),
                       _("Position an object around another, with the specified angle and distance."),
                       _("Put _PARAM0_ around _PARAM1_, with an angle of _PARAM3_° and _PARAM2_ pixels distance."),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("\"Center\" Object"), "", false);
            instrInfo.AddParameter("expression", _("Distance"), "", false);
            instrInfo.AddParameter("expression", _("Angle, in degrees"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("PutAroundObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        //Deprecated action
        DECLARE_OBJECT_ACTION("Rebondir",
                       _("Move an object away from another"),
                       _("Move an object away from another, using forces."),
                       _("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                       _("Displacement"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png");

            instrInfo.SetHidden();
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Object 2 ( won't move )"), "", false);
            instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("SeparateObjectsWithForces").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        //Deprecated action
        DECLARE_OBJECT_ACTION("Ecarter",
                       _("Move an object away from another"),
                       _("Move an object away from another without using forces."),
                       _("Move away _PARAM0_ of _PARAM2_ ( only _PARAM0_ will move )"),
                       _("Position"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png");

            instrInfo.SetHidden();
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Object 2 ( won't move )"), "", false);
            instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("SeparateObjectsWithoutForces").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("SeparateFromObjects",
                       _("Separate two objects"),
                       _("Move an object away from another using their collision masks.\nBe sure to call this action on a reasonable number of objects so as\nnot to slow down the game."),
                       _("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                       _("Position"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png");

            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Objects"), "", false);
            instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("SeparateFromObjects").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_EXPRESSION("X", _("X position"), _("X position of the object"), _("Position"), "res/actions/position.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetX");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Y", _("Y position"), _("Y position of the object"), _("Position"), "res/actions/position.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetY");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceX", _("Average X coordinates of forces"), _("Average X coordinates of forces"), _("Displacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceX");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceY", _("Average Y coordinates of forces"), _("Average Y coordinates of forces"), _("Displacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceY");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceAngle", _("Average angle of the forces"), _("Average angle of the forces"), _("Displacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceAngle");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Angle", _("Average angle of the forces"), _("Average angle of the forces"), _("Displacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("TotalForceAngle");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceLength", _("Average length of the forces"), _("Average length of the forces"), _("Displacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceLength");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Longueur", _("Average length of the forces"), _("Average length of the forces"), _("Displacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("TotalForceLength");
        DECLARE_END_OBJECT_EXPRESSION()


        DECLARE_OBJECT_EXPRESSION("Width", _("Object's width"), _("Object's width"), _("Size"), "res/actions/scaleWidth.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetWidth");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Largeur", _("Object's width"), _("Object's width"), _("Size"), "res/actions/scaleWidth.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("GetWidth");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Height", _("Object's height"), _("Object's height"), _("Size"), "res/actions/scaleHeight.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetHeight");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Hauteur", _("Object's height"), _("Object's height"), _("Size"), "res/actions/scaleHeight.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("GetHeight");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ZOrder", _("Z order of an object"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetZOrder");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Plan", _("Z order of an object"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
            instrInfo.AddParameter("object", _("Object"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("GetZOrder");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Distance", _("Distance between two objects"), _("Distance between two objects"), _("Position"), "res/conditions/distance.png")
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("GetDistanceWithObject");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("SqDistance", _("Square distance between two objects"), _("Square distance between two objects"), _("Position"), "res/conditions/distance.png")
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("GetSqDistanceWithObject");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Variable", _("Object's variable"), _("Object's variable"), _("Variables"), "res/actions/var.png")
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().GetVariableValue");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_STR_EXPRESSION("VariableString", _("Object's variable"), _("Text of variable of an object"), _("Variables"), "res/actions/var.png")
            instrInfo.AddParameter("object", _("Object"), "", false);
            instrInfo.AddParameter("objectvar", _("Name of the variable"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetVariables().GetVariableString");
        DECLARE_END_OBJECT_STR_EXPRESSION()
        #endif

    DECLARE_END_OBJECT()
}

