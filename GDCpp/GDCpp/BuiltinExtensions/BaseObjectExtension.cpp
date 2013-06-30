#include "GDCpp/BuiltinExtensions/BaseObjectExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"

BaseObjectExtension::BaseObjectExtension()
{
    SetExtensionInformation("BuiltinObject",
                          _("Base object"),
                          _("Base object"),
                          "Florian Rival",
                          "Freeware");

    DeclareExtensionFirstPart();
    DeclareExtensionSecondPart();
}

void BaseObjectExtension::DeclareExtensionFirstPart()
{
    //Declaration of all objects available
    {
        gd::ObjectMetadata & obj = AddObject("",
                   _("Base object"),
                   _("Base object"),
                   "res/objeticon24.png",
                   &CreateBaseObject,
                   &DestroyBaseObject);

        AddRuntimeObject(obj, "", &CreateBaseRuntimeObject, &DestroyBaseRuntimeObject);

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
            .codeExtraInformation.SetFunctionName("GetX").SetManipulatedType("number");

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
            .codeExtraInformation.SetFunctionName("SetX").SetManipulatedType("number").SetAssociatedGetter("GetX");


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
            .codeExtraInformation.SetFunctionName("GetY").SetManipulatedType("number");

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
            .codeExtraInformation.SetFunctionName("SetY").SetManipulatedType("number").SetAssociatedGetter("GetY");


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
            .codeExtraInformation.SetFunctionName("SetXY");


        obj.AddAction("MettreAutourPos",
                       _("Put an object around a position"),
                       _("Position an object around a position, with specified angle and distance."),
                       _("Put _PARAM0_ around _PARAM1_;_PARAM2_, with an angle of _PARAM4_° and _PARAM3_ pixels distance."),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png")

            .AddParameter("object", _("Object"))
            .AddParameter("expression", _("X position"))
            .AddParameter("expression", _("Y position"))
            .AddParameter("expression", _("Distance"))
            .AddParameter("expression", _("Angle, in degrees"))
            .codeExtraInformation.SetFunctionName("PutAroundAPosition");


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
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .codeExtraInformation.SetFunctionName("AddForce");

        obj.AddAction("AddForceAL",
                       _("Add a force ( angle )"),
                       _("Add a force to an object. The object will move according to\nall forces it owns. This action creates the force using the specified angle and length."),
                       _("Add to _PARAM0_ a force, angle : _PARAM1_° and length : _PARAM2_ pixels"),
                       _("Displacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png")

            .AddParameter("object", _("Object"))
            .AddParameter("expression", _("Angle"))
            .AddParameter("expression", _("Length ( in pixels )"))
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .codeExtraInformation.SetFunctionName("AddForceUsingPolarCoordinates");


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
            .AddParameter("expression", _("Length ( in pixels )"))
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .codeExtraInformation.SetFunctionName("AddForceTowardPosition");


        obj.AddAction("AddForceTournePos",
                       _("Add a force so as to move around a position"),
                       _("Add a force to an object so as it rotates toward a position.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                       _("Rotate _PARAM0_ around _PARAM1_;_PARAM2_ with _PARAM3_°/sec and _PARAM4_ pixels away"),
                       _("Displacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png")

            .AddParameter("object", _("Object"))
            .AddParameter("expression", _("X position of the center"))
            .AddParameter("expression", _("Y position of the center"))
            .AddParameter("expression", _("Speed ( in Degrees per seconds )"))
            .AddParameter("expression", _("Distance ( in pixels )"))
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .codeExtraInformation.SetFunctionName("AddForceToMoveAround");


        obj.AddAction("Arreter",
                       _("Stop the object"),
                       _("Stop the object by deleting all its forces."),
                       _("Stop the object _PARAM0_"),
                       _("Displacement"),
                       "res/actions/arreter24.png",
                       "res/actions/arreter.png")

            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("ClearForce");


        obj.AddAction("Delete",
                       _("Delete an object"),
                       _("Delete the specified object."),
                       _("Delete object _PARAM0_"),
                       _("Objects"),
                       "res/actions/delete24.png",
                       "res/actions/delete.png")

            .AddParameter("object", _("Object"))
            .AddCodeOnlyParameter("currentScene","")
            .codeExtraInformation.SetFunctionName("DeleteFromScene");

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
            .codeExtraInformation.SetFunctionName("SetZOrder").SetAssociatedGetter("GetZOrder").SetManipulatedType("number");


        obj.AddAction("ChangeLayer",
                       _("Change an object's layer"),
                       _("Change the layer where is the object."),
                       _("Put _PARAM0_ on the layer _PARAM1_"),
                       _("Layers and cameras"),
                       "res/actions/layer24.png",
                       "res/actions/layer.png")

            .AddParameter("object", _("Object"))
            .AddParameter("layer", _("Put on the layer ( base layer if empty )")).SetDefaultValue("\"\"")
            .codeExtraInformation.SetFunctionName("SetLayer");


        obj.AddAction("ModVarObjet",
                       _("Modify a variable of an object"),
                       _("Modify the value of a variable of an object"),
                       _("Do _PARAM2__PARAM3_ to variable _PARAM1_ of _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("number");


        obj.AddAction("ModVarObjetTxt",
                       _("Modify the text of a variable of an object"),
                       _("Modify the text of a variable of an object"),
                       _("Do _PARAM2__PARAM3_ to the text of variable _PARAM1_ of _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("string", _("Text"))
            .codeExtraInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("string");



        obj.AddAction("Cache",
                       _("Hide an object"),
                       _("Hide the specified object."),
                       _("Hide the object _PARAM0_"),
                       _("Visibility"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png")

            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("SetHidden");


        obj.AddAction("Montre",
                       _("Show an object"),
                       _("Show the specified object"),
                       _("Show object _PARAM0_"),
                       _("Visibility"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png")

            .AddParameter("object", _("Object"))
            .AddCodeOnlyParameter("inlineCode", "false")
            .codeExtraInformation.SetFunctionName("SetHidden");


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
            .codeExtraInformation.SetFunctionName("GetZOrder").SetManipulatedType("number");

        obj.AddCondition("Layer",
                       _("Test the layer of an object"),
                       _("Test if the object is on the specified layer."),
                       _("_PARAM0_ is on layer _PARAM1_"),
                       _("Layer"),
                       "res/conditions/layer24.png",
                       "res/conditions/layer.png")

            .AddParameter("object", _("Object"))
            .AddParameter("layer", _("Layer"))
            .codeExtraInformation.SetFunctionName("IsOnLayer");

        obj.AddCondition("Visible",
                       _("Visibility of an object"),
                       _("Test if an object is not hidden."),
                       _("The object _PARAM0_ is visible"),
                       _("Visibility"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png")

            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("IsVisible");

        obj.AddCondition("Invisible",
                       _("Invisibility of an object"),
                       _("Test if an object is hidden."),
                       _("_PARAM0_ is hidden"),
                       _("Visibility"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png")

            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("IsHidden");

        obj.AddCondition("Arret",
                       _("An object is stopped"),
                       _("Test if an object does not move"),
                       _("_PARAM0_ is stopped"),
                       _("Displacement"),
                       "res/conditions/arret24.png",
                       "res/conditions/arret.png")

            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("IsStopped");

        obj.AddCondition("Vitesse",
                       _("Speed of the object"),
                       _("Test the overall speed of an object"),
                       _("The speed of _PARAM0_ is _PARAM2_ _PARAM1_"),
                       _("Displacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png")

            .AddParameter("object", _("Object"))
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Speed"))
            .codeExtraInformation.SetFunctionName("TotalForceLength").SetManipulatedType("number");

        obj.AddCondition("AngleOfDisplacement",
                       _("Angle of moving"),
                       _("Test the angle of displacement of an object"),
                       _("The angle of displacement of _PARAM0_ is _PARAM1_ ( tolerance : _PARAM2_° )"),
                       _("Displacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png")

            .AddParameter("object", _("Object"))
            .AddParameter("expression", _("Angle, in degrees"))
            .AddParameter("expression", _("Tolerance"))
            .codeExtraInformation.SetFunctionName("TestAngleOfDisplacement");

        obj.AddCondition("VarObjet",
                       _("Object's variable"),
                       _("Test the value of a variable of an object."),
                       _("Variable _PARAM1_ of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("number");

        obj.AddCondition("VarObjetTxt",
                       _("Text of variable of an object"),
                       _("Test the text of variable of an object."),
                       _("The text of variable _PARAM1_ of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("string", _("Text to test"))
            .codeExtraInformation.SetFunctionName("GetVariables().ObtainVariable").SetManipulatedType("string");

        obj.AddCondition("VarObjetDef",
                       _("Variable defined"),
                       _("Test "),
                       _("Variable _PARAM1 of _PARAM0_ is defined"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .codeExtraInformation.SetFunctionName("GetVariables().HasVariableNamed");

        obj.AddCondition("AutomatismActivated",
                       _("Automatism activated"),
                       _("Return true if the automatism is activated for the object."),
                       _("Automatism _PARAM1_ of _PARAM0_ is activated"),
                       _("Automatisms"),
                       "res/automatism24.png",
                       "res/automatism16.png")

            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"))
            .codeExtraInformation.SetFunctionName("AutomatismActivated");

        obj.AddAction("ActivateAutomatism",
                       _("De/activate an automatism"),
                       _("De/activate the automatism for the object."),
                       _("Activate automatism _PARAM1_ of _PARAM0_: _PARAM2_"),
                       _("Automatisms"),
                       "res/automatism24.png",
                       "res/automatism16.png")

            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"))
            .AddParameter("yesorno", _("Activate \?"))
            .codeExtraInformation.SetFunctionName("ActivateAutomatism");


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
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .codeExtraInformation.SetFunctionName("AddForceTowardObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


        obj.AddAction("AddForceTourne",
                       _("Add a force so as to move around an object"),
                       _("Add a force to an object so as it rotates around another.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                       _("Rotate _PARAM0_ around _PARAM1_ with _PARAM2_°/sec and _PARAM3_ pixels away"),
                       _("Displacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectPtr", _("Rotate around this object"))
            .AddParameter("expression", _("Speed ( Degrees per second )"))
            .AddParameter("expression", _("Distance ( in pixel )"))
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .codeExtraInformation.SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


        obj.AddAction("MettreAutour",
                       _("Put an object around another"),
                       _("Position an object around another, with the specified angle and distance."),
                       _("Put _PARAM0_ around _PARAM1_, with an angle of _PARAM3_° and _PARAM2_ pixels distance."),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectPtr", _("\"Center\" Object"))
            .AddParameter("expression", _("Distance"))
            .AddParameter("expression", _("Angle, in degrees"))
            .codeExtraInformation.SetFunctionName("PutAroundObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


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
            .AddParameter("objectList", _("Object 2 ( won't move )"))
            .codeExtraInformation.SetFunctionName("SeparateObjectsWithForces").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


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
            .AddParameter("objectList", _("Object 2 ( won't move )"))
            .codeExtraInformation.SetFunctionName("SeparateObjectsWithoutForces").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


        obj.AddAction("SeparateFromObjects",
                       _("Separate two objects"),
                       _("Move an object away from another using their collision masks.\nBe sure to call this action on a reasonable number of objects so as\nnot to slow down the game."),
                       _("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                       _("Position"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectList", _("Objects"))
            .codeExtraInformation.SetFunctionName("SeparateFromObjects").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


        obj.AddExpression("X", _("X position"), _("X position of the object"), _("Position"), "res/actions/position.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("GetX");

        obj.AddExpression("Y", _("Y position"), _("Y position of the object"), _("Position"), "res/actions/position.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("GetY");

        obj.AddExpression("ForceX", _("Average X coordinates of forces"), _("Average X coordinates of forces"), _("Displacement"), "res/actions/force.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("TotalForceX");

        obj.AddExpression("ForceY", _("Average Y coordinates of forces"), _("Average Y coordinates of forces"), _("Displacement"), "res/actions/force.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("TotalForceY");

        obj.AddExpression("ForceAngle", _("Average angle of the forces"), _("Average angle of the forces"), _("Displacement"), "res/actions/force.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("TotalForceAngle");

        obj.AddExpression("Angle", _("Average angle of the forces"), _("Average angle of the forces"), _("Displacement"), "res/actions/force.png")
            .AddParameter("object", _("Object"))

            .SetHidden()
            .codeExtraInformation.SetFunctionName("TotalForceAngle");

        obj.AddExpression("ForceLength", _("Average length of the forces"), _("Average length of the forces"), _("Displacement"), "res/actions/force.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("TotalForceLength");

        obj.AddExpression("Longueur", _("Average length of the forces"), _("Average length of the forces"), _("Displacement"), "res/actions/force.png")
            .AddParameter("object", _("Object"))

            .SetHidden()
            .codeExtraInformation.SetFunctionName("TotalForceLength");


        obj.AddExpression("Width", _("Object's width"), _("Object's width"), _("Size"), "res/actions/scaleWidth.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("GetWidth");

        obj.AddExpression("Largeur", _("Object's width"), _("Object's width"), _("Size"), "res/actions/scaleWidth.png")
            .AddParameter("object", _("Object"))

            .SetHidden()
            .codeExtraInformation.SetFunctionName("GetWidth");

        obj.AddExpression("Height", _("Object's height"), _("Object's height"), _("Size"), "res/actions/scaleHeight.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("GetHeight");

        obj.AddExpression("Hauteur", _("Object's height"), _("Object's height"), _("Size"), "res/actions/scaleHeight.png")
            .AddParameter("object", _("Object"))

            .SetHidden()
            .codeExtraInformation.SetFunctionName("GetHeight");

        obj.AddExpression("ZOrder", _("Z order of an object"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
            .AddParameter("object", _("Object"))
            .codeExtraInformation.SetFunctionName("GetZOrder");

        obj.AddExpression("Plan", _("Z order of an object"), _("Z order of an object"), _("Visibility"), "res/actions/planicon.png")
            .AddParameter("object", _("Object"))

            .SetHidden()
            .codeExtraInformation.SetFunctionName("GetZOrder");

        obj.AddExpression("Distance", _("Distance between two objects"), _("Distance between two objects"), _("Position"), "res/conditions/distance.png")
            .AddParameter("object", _("Object"))
            .AddParameter("objectPtr", _("Object"))
            .codeExtraInformation.SetFunctionName("GetDistanceWithObject");

        obj.AddExpression("SqDistance", _("Square distance between two objects"), _("Square distance between two objects"), _("Position"), "res/conditions/distance.png")
            .AddParameter("object", _("Object"))
            .AddParameter("objectPtr", _("Object"))
            .codeExtraInformation.SetFunctionName("GetSqDistanceWithObject");

        obj.AddExpression("Variable", _("Object's variable"), _("Object's variable"), _("Variables"), "res/actions/var.png")
            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .codeExtraInformation.SetFunctionName("GetVariables().GetVariableValue");

        obj.AddStrExpression("VariableString", _("Object's variable"), _("Text of variable of an object"), _("Variables"), "res/actions/var.png")
            .AddParameter("object", _("Object"))
            .AddParameter("objectvar", _("Name of the variable"))
            .codeExtraInformation.SetFunctionName("GetVariables().GetVariableString");
        #endif

    }
}

