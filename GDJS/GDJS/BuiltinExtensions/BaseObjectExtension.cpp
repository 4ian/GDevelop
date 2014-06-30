/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "BaseObjectExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
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
                          "Open source (LGPL)");

    std::map<std::string, gd::InstructionMetadata > & objectActions = GetAllActionsForObject("");
    std::map<std::string, gd::InstructionMetadata > & objectConditions = GetAllConditionsForObject("");
    std::map<std::string, gd::ExpressionMetadata > & objectExpressions = GetAllExpressionsForObject("");
    std::map<std::string, gd::StrExpressionMetadata > & objectStrExpressions = GetAllStrExpressionsForObject("");

    objectActions["MettreX"].codeExtraInformation
        .SetFunctionName("setX").SetAssociatedGetter("getX").SetIncludeFile("runtimeobject.js");
    objectActions["MettreY"].codeExtraInformation
        .SetFunctionName("setY").SetAssociatedGetter("getY").SetIncludeFile("runtimeobject.js");
    objectConditions["PosX"].codeExtraInformation
        .SetFunctionName("getX").SetIncludeFile("runtimeobject.js");
    objectConditions["PosY"].codeExtraInformation
        .SetFunctionName("getY").SetIncludeFile("runtimeobject.js");
    objectActions["SetAngle"].codeExtraInformation
        .SetFunctionName("setAngle").SetAssociatedGetter("getAngle").SetIncludeFile("runtimeobject.js");
    objectConditions["Angle"].codeExtraInformation
        .SetFunctionName("getAngle").SetIncludeFile("runtimeobject.js");
    objectActions["Rotate"].codeExtraInformation
        .SetFunctionName("rotate").SetIncludeFile("runtimeobject.js");
    objectActions["RotateTowardAngle"].codeExtraInformation
        .SetFunctionName("rotateTowardAngle").SetIncludeFile("runtimeobject.js");
    objectActions["RotateTowardPosition"].codeExtraInformation
        .SetFunctionName("rotateTowardPosition").SetIncludeFile("runtimeobject.js");
    objectActions["ChangeLayer"].codeExtraInformation
        .SetFunctionName("setLayer").SetIncludeFile("runtimeobject.js");
    objectConditions["Layer"].codeExtraInformation
        .SetFunctionName("isOnLayer").SetIncludeFile("runtimeobject.js");
    objectActions["ChangePlan"].codeExtraInformation
        .SetFunctionName("setZOrder").SetAssociatedGetter("getZOrder").SetIncludeFile("runtimeobject.js");
    objectConditions["Plan"].codeExtraInformation
        .SetFunctionName("getZOrder").SetIncludeFile("runtimeobject.js");
    objectActions["Cache"].codeExtraInformation
        .SetFunctionName("hide").SetIncludeFile("runtimeobject.js");
    objectActions["Montre"].codeExtraInformation
        .SetFunctionName("hide").SetIncludeFile("runtimeobject.js");
    objectConditions["Visible"].codeExtraInformation
        .SetFunctionName("isVisible").SetIncludeFile("runtimeobject.js");
    objectConditions["Invisible"].codeExtraInformation
        .SetFunctionName("isHidden").SetIncludeFile("runtimeobject.js");
    objectActions["Delete"].codeExtraInformation
        .SetFunctionName("deleteFromScene");
    objectActions["MettreAutourPos"].codeExtraInformation
        .SetFunctionName("putAround");
    objectActions["MettreAutour"].codeExtraInformation
        .SetFunctionName("putAroundObject").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjet"].codeExtraInformation
        .SetFunctionName("getVariableNumber").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjetTxt"].codeExtraInformation
        .SetFunctionName("getVariableString").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjetDef"].codeExtraInformation
        .SetFunctionName("hasVariable").SetIncludeFile("runtimeobject.js");
    objectActions["ModVarObjet"].codeExtraInformation
        .SetFunctionName("setVariableNumber").SetManipulatedType("number").SetAssociatedGetter("getVariableNumber").SetIncludeFile("runtimeobject.js");
    objectActions["ModVarObjetTxt"].codeExtraInformation
        .SetFunctionName("setVariableString").SetManipulatedType("number").SetAssociatedGetter("getVariableString").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceXY"].codeExtraInformation
        .SetFunctionName("addForce").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceAL"].codeExtraInformation
        .SetFunctionName("addPolarForce").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceVersPos"].codeExtraInformation
        .SetFunctionName("addForceTowardPosition").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceVers"].codeExtraInformation
        .SetFunctionName("addForceTowardObject").SetIncludeFile("runtimeobject.js");
    objectActions["Arreter"].codeExtraInformation
        .SetFunctionName("clearForces").SetIncludeFile("runtimeobject.js");
    objectConditions["Arret"].codeExtraInformation
        .SetFunctionName("hasNoForces").SetIncludeFile("runtimeobject.js");
    objectConditions["Vitesse"].codeExtraInformation
        .SetFunctionName("getAverageForce().getLength").SetIncludeFile("runtimeobject.js");
    objectConditions["AngleOfDisplacement"].codeExtraInformation
        .SetFunctionName("averageForceAngleIs").SetIncludeFile("runtimeobject.js");
    objectActions["SeparateFromObjects"].codeExtraInformation
        .SetFunctionName("separateFromObjects").SetIncludeFile("runtimeobject.js");
    objectActions["Ecarter"].codeExtraInformation //Deprecated
        .SetFunctionName("separateObjectsWithoutForces").SetIncludeFile("runtimeobject.js");
    objectActions["Rebondir"].codeExtraInformation //Deprecated
        .SetFunctionName("separateObjectsWithForces").SetIncludeFile("runtimeobject.js");
    objectConditions["AutomatismActivated"].codeExtraInformation
        .SetFunctionName("automatismActivated").SetIncludeFile("runtimeobject.js");
    objectActions["ActivateAutomatism"].codeExtraInformation
        .SetFunctionName("activateAutomatism").SetIncludeFile("runtimeobject.js");
    objectConditions["ObjectVariableChildExists"].codeExtraInformation
        .SetFunctionName("variableChildExists").SetIncludeFile("runtimeobject.js");
    objectActions["ObjectVariableRemoveChild"].codeExtraInformation
        .SetFunctionName("variableRemoveChild").SetIncludeFile("runtimeobject.js");

    objectExpressions["X"].codeExtraInformation.SetFunctionName("getX");
    objectExpressions["Y"].codeExtraInformation.SetFunctionName("getY");
    objectExpressions["ZOrder"].codeExtraInformation.SetFunctionName("getZOrder");
    objectExpressions["Plan"].codeExtraInformation.SetFunctionName("getZOrder"); //Deprecated
    objectExpressions["Width"].codeExtraInformation.SetFunctionName("getWidth");
    objectExpressions["Height"].codeExtraInformation.SetFunctionName("getHeight");
    objectExpressions["Largeur"].codeExtraInformation.SetFunctionName("getWidth"); //Deprecated
    objectExpressions["Hauteur"].codeExtraInformation.SetFunctionName("getHeight"); //Deprecated
    objectExpressions["Variable"].codeExtraInformation.SetFunctionName("gdjs.RuntimeObject.getVariableNumber").SetStatic();
    objectStrExpressions["VariableString"].codeExtraInformation.SetFunctionName("gdjs.RuntimeObject.getVariableString").SetStatic();
    objectExpressions["ForceX"].codeExtraInformation.SetFunctionName("getAverageForce().getX");
    objectExpressions["ForceY"].codeExtraInformation.SetFunctionName("getAverageForce().getY");
    objectExpressions["ForceAngle"].codeExtraInformation.SetFunctionName("getAverageForce().getAngle");
    objectExpressions["Angle"].codeExtraInformation.SetFunctionName("getAngle");
    objectExpressions["ForceLength"].codeExtraInformation.SetFunctionName("getAverageForce().getLength");
    objectExpressions["Longueur"].codeExtraInformation.SetFunctionName("getAverageForce().getLength"); //Deprecated
    objectExpressions["Distance"].codeExtraInformation.SetFunctionName("getDistanceFrom");
    objectExpressions["SqDistance"].codeExtraInformation.SetFunctionName("getSqDistanceFrom");


    GetAllActions()["Create"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.createObjectOnScene");
    GetAllActions()["CreateByName"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.createObjectFromGroupOnScene");
    GetAllExpressions()["Count"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.pickedObjectsCount");
    GetAllConditions()["NbObjet"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.pickedObjectsCount");
    GetAllConditions()["CollisionNP"]
        .AddCodeOnlyParameter("currentScene", "") //We need an extra parameter pointing to the scene.
        .codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.hitBoxesCollisionTest");
    GetAllConditions()["Distance"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.distanceTest");
    GetAllConditions()["SeDirige"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.movesTowardTest");
    GetAllConditions()["EstTourne"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.turnedTowardTest");

    GetAllActions()["AjoutObjConcern"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.pickAllObjects");
    GetAllConditions()["AjoutObjConcern"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.pickAllObjects");
    GetAllActions()["AjoutHasard"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.pickRandomObject");
    GetAllConditions()["AjoutHasard"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.pickRandomObject");


    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
        public:
            virtual std::string GenerateCode(gd::Instruction &, gd::EventsCodeGenerator &, gd::EventsCodeGenerationContext &)
            {
                return "runtimeScene.updateObjectsForces();";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;

        GetAllActions()["MoveObjects"].codeExtraInformation
            .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
        public:
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string outputCode;

                std::vector<std::string> realObjects = codeGenerator.ExpandObjectsName(instruction.GetParameter(0).GetPlainString(), context);
                for (unsigned int i = 0;i<realObjects.size();++i)
                {
                    context.SetCurrentObject(realObjects[i]);
                    context.ObjectsListNeeded(realObjects[i]);

                    std::string newX, newY;

                    std::string expression1Code;
                    {
                        gd::CallbacksForGeneratingExpressionCode callbacks(expression1Code, codeGenerator, context);
                        gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                        if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expression1Code.empty())
                            expression1Code = "0";
                    }

                    std::string expression2Code;
                    {
                        gd::CallbacksForGeneratingExpressionCode callbacks(expression2Code, codeGenerator, context);
                        gd::ExpressionParser parser(instruction.GetParameters()[4].GetPlainString());
                        if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expression2Code.empty())
                            expression2Code = "0";
                    }

                    std::string op1 = instruction.GetParameter(1).GetPlainString();
                    if ( op1 == "=" || op1.empty() )
                        newX = expression1Code;
                    else if ( op1 == "/" || op1 == "*" || op1 == "-" || op1 == "+" )
                        newX = codeGenerator.GetObjectListName(realObjects[i], context)+"[i].getX() "+op1 + expression1Code;
                    else
                        return "";
                    std::string op2 = instruction.GetParameter(3).GetPlainString();
                    if ( op2 == "=" || op2.empty() )
                        newY = expression2Code;
                    else if ( op2 == "/" || op2 == "*" || op2 == "-" || op2 == "+" )
                        newY = codeGenerator.GetObjectListName(realObjects[i], context)+"[i].getY() "+op2 + expression2Code;
                    else
                        return "";

                    std::string call = codeGenerator.GetObjectListName(realObjects[i], context)+"[i].setPosition("+newX+","+newY+")";

                    outputCode += "for(var i = 0, len = "+codeGenerator.GetObjectListName(realObjects[i], context)+".length ;i < len;++i) {\n";
                    outputCode += "    "+call+";\n";
                    outputCode += "}\n";

                    context.SetNoCurrentObject();
                }

                return outputCode;
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;

        objectActions["MettreXY"].codeExtraInformation
            .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }

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
            .codeExtraInformation.SetFunctionName("AddForceToMoveAround");

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
            .codeExtraInformation.SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
*/
}

}
