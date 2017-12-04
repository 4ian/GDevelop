/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "BaseObjectExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

BaseObjectExtension::BaseObjectExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(*this);

    SetExtensionInformation("BuiltinObject",
                          _("Base object"),
                          _("Base object"),
                          "Florian Rival",
                          "Open source (MIT License)");

    std::map<gd::String, gd::InstructionMetadata > & objectActions = GetAllActionsForObject("");
    std::map<gd::String, gd::InstructionMetadata > & objectConditions = GetAllConditionsForObject("");
    std::map<gd::String, gd::ExpressionMetadata > & objectExpressions = GetAllExpressionsForObject("");
    std::map<gd::String, gd::ExpressionMetadata > & objectStrExpressions = GetAllStrExpressionsForObject("");

    objectActions["MettreX"].SetFunctionName("setX").SetGetter("getX").SetIncludeFile("runtimeobject.js");
    objectActions["MettreY"].SetFunctionName("setY").SetGetter("getY").SetIncludeFile("runtimeobject.js");
    objectConditions["PosX"].SetFunctionName("getX").SetIncludeFile("runtimeobject.js");
    objectConditions["PosY"].SetFunctionName("getY").SetIncludeFile("runtimeobject.js");
    objectActions["SetAngle"].SetFunctionName("setAngle").SetGetter("getAngle").SetIncludeFile("runtimeobject.js");
    objectConditions["Angle"].SetFunctionName("getAngle").SetIncludeFile("runtimeobject.js");
    objectActions["Rotate"].SetFunctionName("rotate").SetIncludeFile("runtimeobject.js");
    objectActions["RotateTowardAngle"].SetFunctionName("rotateTowardAngle").SetIncludeFile("runtimeobject.js");
    objectActions["RotateTowardPosition"].SetFunctionName("rotateTowardPosition").SetIncludeFile("runtimeobject.js");
    objectActions["ChangeLayer"].SetFunctionName("setLayer").SetIncludeFile("runtimeobject.js");
    objectConditions["Layer"].SetFunctionName("isOnLayer").SetIncludeFile("runtimeobject.js");
    objectActions["ChangePlan"].SetFunctionName("setZOrder").SetGetter("getZOrder").SetIncludeFile("runtimeobject.js");
    objectConditions["Plan"].SetFunctionName("getZOrder").SetIncludeFile("runtimeobject.js");
    objectActions["Cache"].SetFunctionName("hide").SetIncludeFile("runtimeobject.js");
    objectActions["Montre"].SetFunctionName("hide").SetIncludeFile("runtimeobject.js");
    objectConditions["Visible"].SetFunctionName("isVisible").SetIncludeFile("runtimeobject.js");
    objectConditions["Invisible"].SetFunctionName("isHidden").SetIncludeFile("runtimeobject.js");
    objectActions["Delete"].SetFunctionName("deleteFromScene");
    objectActions["MettreAutourPos"].SetFunctionName("putAround");
    objectActions["MettreAutour"].SetFunctionName("putAroundObject").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjet"].SetFunctionName("getVariableNumber").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjetTxt"].SetFunctionName("getVariableString").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjetDef"].SetFunctionName("hasVariable").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceXY"].SetFunctionName("addForce").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceAL"].SetFunctionName("addPolarForce").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceVersPos"].SetFunctionName("addForceTowardPosition").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceVers"].SetFunctionName("addForceTowardObject").SetIncludeFile("runtimeobject.js");
    objectActions["Arreter"].SetFunctionName("clearForces").SetIncludeFile("runtimeobject.js");
    objectConditions["Arret"].SetFunctionName("hasNoForces").SetIncludeFile("runtimeobject.js");
    objectConditions["Vitesse"].SetFunctionName("getAverageForce().getLength").SetIncludeFile("runtimeobject.js");
    objectConditions["AngleOfDisplacement"].SetFunctionName("averageForceAngleIs").SetIncludeFile("runtimeobject.js");
    objectActions["SeparateFromObjects"].SetFunctionName("separateFromObjectsList").SetIncludeFile("runtimeobject.js");
    objectActions["Ecarter"].codeExtraInformation //Deprecated
        .SetFunctionName("separateObjectsWithoutForces").SetIncludeFile("runtimeobject.js");
    objectActions["Rebondir"].codeExtraInformation //Deprecated
        .SetFunctionName("separateObjectsWithForces").SetIncludeFile("runtimeobject.js");
    objectConditions["BehaviorActivated"].SetFunctionName("behaviorActivated").SetIncludeFile("runtimeobject.js");
    objectActions["ActivateBehavior"].SetFunctionName("activateBehavior").SetIncludeFile("runtimeobject.js");
    objectConditions["ObjectVariableChildExists"].SetFunctionName("variableChildExists").SetIncludeFile("runtimeobject.js");
    objectActions["ObjectVariableRemoveChild"].SetFunctionName("variableRemoveChild").SetIncludeFile("runtimeobject.js");
    objectActions["ObjectVariableClearChildren"].SetFunctionName("variableClearChildren").SetIncludeFile("runtimeobject.js");
    objectConditions["CollisionPoint"].SetFunctionName("isCollidingWithPoint").SetIncludeFile("runtimeobject.js");

    objectExpressions["X"].SetFunctionName("getX");
    objectExpressions["Y"].SetFunctionName("getY");
    objectExpressions["ZOrder"].SetFunctionName("getZOrder");
    objectExpressions["Plan"].SetFunctionName("getZOrder"); //Deprecated
    objectExpressions["Width"].SetFunctionName("getWidth");
    objectExpressions["Height"].SetFunctionName("getHeight");
    objectExpressions["Largeur"].SetFunctionName("getWidth"); //Deprecated
    objectExpressions["Hauteur"].SetFunctionName("getHeight"); //Deprecated
    objectExpressions["Variable"].SetFunctionName("gdjs.RuntimeObject.getVariableNumber").SetStatic();
    objectStrExpressions["VariableString"].SetFunctionName("gdjs.RuntimeObject.getVariableString").SetStatic();
    objectExpressions["VariableChildCount"].SetFunctionName("gdjs.RuntimeObject.getVariableChildCount").SetStatic();
    objectExpressions["ForceX"].SetFunctionName("getAverageForce().getX");
    objectExpressions["ForceY"].SetFunctionName("getAverageForce().getY");
    objectExpressions["ForceAngle"].SetFunctionName("getAverageForce().getAngle");
    objectExpressions["Angle"].SetFunctionName("getAngle");
    objectExpressions["ForceLength"].SetFunctionName("getAverageForce().getLength");
    objectExpressions["Longueur"].SetFunctionName("getAverageForce().getLength"); //Deprecated
    objectExpressions["Distance"].SetFunctionName("getDistanceToObject");
    objectExpressions["SqDistance"].SetFunctionName("getSqDistanceToObject");


    GetAllActions()["Create"].SetFunctionName("gdjs.evtTools.object.createObjectOnScene");
    GetAllActions()["CreateByName"].SetFunctionName("gdjs.evtTools.object.createObjectFromGroupOnScene");
    GetAllExpressions()["Count"].SetFunctionName("gdjs.evtTools.object.pickedObjectsCount");
    GetAllConditions()["NbObjet"].SetFunctionName("gdjs.evtTools.object.pickedObjectsCount");
    GetAllConditions()["CollisionNP"]
        .AddCodeOnlyParameter("currentScene", "") //We need an extra parameter pointing to the scene.
        .SetFunctionName("gdjs.evtTools.object.hitBoxesCollisionTest");
    GetAllConditions()["Distance"].SetFunctionName("gdjs.evtTools.object.distanceTest");
    GetAllConditions()["SeDirige"].SetFunctionName("gdjs.evtTools.object.movesTowardTest");
    GetAllConditions()["EstTourne"].SetFunctionName("gdjs.evtTools.object.turnedTowardTest");

    GetAllActions()["AjoutObjConcern"].SetFunctionName("gdjs.evtTools.object.pickAllObjects");
    GetAllConditions()["AjoutObjConcern"].SetFunctionName("gdjs.evtTools.object.pickAllObjects");
    GetAllActions()["AjoutHasard"].SetFunctionName("gdjs.evtTools.object.pickRandomObject");
    GetAllConditions()["AjoutHasard"].SetFunctionName("gdjs.evtTools.object.pickRandomObject");
    GetAllConditions()["PickNearest"].SetFunctionName("gdjs.evtTools.object.pickNearestObject");

    objectActions["ModVarObjet"].SetFunctionName("returnVariable")
        .SetManipulatedType("number")
        .SetMutators({
            {"=", "setNumber"},
            {"+", "add"},
            {"-", "sub"},
            {"*", "mul"},
            {"/", "div"},
        })
        .SetIncludeFile("runtimeobject.js");
    objectActions["ModVarObjetTxt"].SetFunctionName("returnVariable")
        .SetManipulatedType("string")
        .SetMutators({
            {"=", "setString"},
            {"+", "concatenate"},
        })
        .SetIncludeFile("runtimeobject.js");

    GetAllActions()["MoveObjects"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction &, gd::EventsCodeGenerator &, gd::EventsCodeGenerationContext &) {
            return "runtimeScene.updateObjectsForces();";
        });

    objectActions["MettreXY"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) -> gd::String {
            gd::String outputCode;

            std::vector<gd::String> realObjects = codeGenerator.ExpandObjectsName(instruction.GetParameter(0).GetPlainString(), context);
            for (std::size_t i = 0;i<realObjects.size();++i)
            {
                context.SetCurrentObject(realObjects[i]);
                context.ObjectsListNeeded(realObjects[i]);

                gd::String newX, newY;

                gd::String expression1Code;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expression1Code, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expression1Code.empty())
                        expression1Code = "0";
                }

                gd::String expression2Code;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expression2Code, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[4].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expression2Code.empty())
                        expression2Code = "0";
                }

                gd::String op1 = instruction.GetParameter(1).GetPlainString();
                if ( op1 == "=" || op1.empty() )
                    newX = expression1Code;
                else if ( op1 == "/" || op1 == "*" || op1 == "-" || op1 == "+" )
                    newX = codeGenerator.GetObjectListName(realObjects[i], context)+"[i].getX() "+op1 + expression1Code;
                else
                    return "";
                gd::String op2 = instruction.GetParameter(3).GetPlainString();
                if ( op2 == "=" || op2.empty() )
                    newY = expression2Code;
                else if ( op2 == "/" || op2 == "*" || op2 == "-" || op2 == "+" )
                    newY = codeGenerator.GetObjectListName(realObjects[i], context)+"[i].getY() "+op2 + expression2Code;
                else
                    return "";

                gd::String call = codeGenerator.GetObjectListName(realObjects[i], context)+"[i].setPosition("+newX+","+newY+")";

                outputCode += "for(var i = 0, len = "+codeGenerator.GetObjectListName(realObjects[i], context)+".length ;i < len;++i) {\n";
                outputCode += "    "+call+";\n";
                outputCode += "}\n";

                context.SetNoCurrentObject();
            }

            return outputCode;
        });

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*
        obj.AddAction("AddForceTournePos",
                       _("Add a force so as to move around a position"),
                       _("Add a force to an object so as it rotates toward a position.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                       _("Rotate _PARAM0_ around _PARAM1_;_PARAM2_ with _PARAM3_�/sec and _PARAM4_ pixels away"),
                       _("Displacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png")

            .AddParameter("object", _("Object"))
            .AddParameter("expression", _("X position of the center"))
            .AddParameter("expression", _("Y position of the center"))
            .AddParameter("expression", _("Speed ( in Degrees per seconds )"))
            .AddParameter("expression", _("Distance ( in pixels )"))
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .SetFunctionName("AddForceToMoveAround");

        obj.AddAction("AddForceTourne",
                       _("Add a force so as to move around an object"),
                       _("Add a force to an object so as it rotates around another.\nNote that the moving is not precise, especially if the speed is high.\nTo position an object around a position more precisly, use the actions in the category  \"Position\"."),
                       _("Rotate _PARAM0_ around _PARAM1_ with _PARAM2_�/sec and _PARAM3_ pixels away"),
                       _("Displacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectPtr", _("Rotate around this object"))
            .AddParameter("expression", _("Speed ( Degrees per second )"))
            .AddParameter("expression", _("Distance ( in pixel )"))
            .AddParameter("expression", _("Damping ( Default : 0 )"))
            .SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
*/
}

}
