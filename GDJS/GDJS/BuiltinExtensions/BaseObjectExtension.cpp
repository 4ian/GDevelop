#include "BaseObjectExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

BaseObjectExtension::BaseObjectExtension()
{
    SetExtensionInformation("BuiltinObject",
                          _("Base object"),
                          _("Base object"),
                          "Compil Games",
                          "Freeware");
    CloneExtension("Game Develop C++ platform", "BuiltinObject");

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
    objectConditions["VarObjet"].codeExtraInformation
        .SetFunctionName("getVariableValue").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjetTxt"].codeExtraInformation
        .SetFunctionName("getVariableValue").SetIncludeFile("runtimeobject.js");
    objectConditions["VarObjetDef"].codeExtraInformation
        .SetFunctionName("hasVariable").SetIncludeFile("runtimeobject.js");
    objectActions["ModVarObjet"].codeExtraInformation
        .SetFunctionName("setVariableValue").SetAssociatedGetter("getVariableValue").SetIncludeFile("runtimeobject.js");
    objectActions["ModVarObjetTxt"].codeExtraInformation
        .SetFunctionName("setVariableValue").SetAssociatedGetter("getVariableValue").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceXY"].codeExtraInformation
        .SetFunctionName("addForce").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceAL"].codeExtraInformation
        .SetFunctionName("addPolarForce").SetIncludeFile("runtimeobject.js");
    objectActions["AddForceVersPos"].codeExtraInformation
        .SetFunctionName("addForceTowardPosition").SetIncludeFile("runtimeobject.js");
    objectActions["Arreter"].codeExtraInformation
        .SetFunctionName("clearForces").SetIncludeFile("runtimeobject.js");
    objectConditions["Arret"].codeExtraInformation
        .SetFunctionName("hasNoForces").SetIncludeFile("runtimeobject.js");
    objectConditions["Vitesse"].codeExtraInformation
        .SetFunctionName("getAverageForce().getLength()").SetIncludeFile("runtimeobject.js");
    objectConditions["AngleOfDisplacement"].codeExtraInformation
        .SetFunctionName("averageForceAngleIs").SetIncludeFile("runtimeobject.js");

    objectExpressions["X"].codeExtraInformation.SetFunctionName("getX");
    objectExpressions["Y"].codeExtraInformation.SetFunctionName("getY");
    objectExpressions["ZOrder"].codeExtraInformation.SetFunctionName("getZOrder");
    objectExpressions["Plan"].codeExtraInformation.SetFunctionName("getZOrder");
    objectExpressions["Width"].codeExtraInformation.SetFunctionName("getWidth");
    objectExpressions["Height"].codeExtraInformation.SetFunctionName("getHeight");
    objectExpressions["Largeur"].codeExtraInformation.SetFunctionName("getWidth"); //Deprecated
    objectExpressions["Hauteur"].codeExtraInformation.SetFunctionName("getHeight"); //Deprecated
    objectExpressions["Variable"].codeExtraInformation.SetFunctionName("getVariableValue");
    objectStrExpressions["VariableString"].codeExtraInformation.SetFunctionName("getVariableValue");
    objectExpressions["ForceX"].codeExtraInformation.SetFunctionName("getAverageForce().getX()");
    objectExpressions["ForceY"].codeExtraInformation.SetFunctionName("getAverageForce().getY()");
    objectExpressions["ForceAngle"].codeExtraInformation.SetFunctionName("getAverageForce().getAngle()");
    objectExpressions["Angle"].codeExtraInformation.SetFunctionName("getAverageForce().getAngle()"); //Deprecated
    objectExpressions["ForceLength"].codeExtraInformation.SetFunctionName("getAverageForce().getLength()");
    objectExpressions["Longueur"].codeExtraInformation.SetFunctionName("getAverageForce().getLength()"); //Deprecated
    objectExpressions["Distance"].codeExtraInformation.SetFunctionName("getDistanceFrom");
    objectExpressions["SqDistance"].codeExtraInformation.SetFunctionName("getSqDistanceFrom");

    GetAllActions()["Create"].codeExtraInformation
        .SetFunctionName("gdjs.createObjectOnScene");
    /*GetAllActions()["CreateByName"].codeExtraInformation
        .SetFunctionName("gdjs.createObjectOnScene");*/ //TODO
    GetAllExpressions()["Count"].codeExtraInformation
        .SetFunctionName("gdjs.pickedObjectsCount");
    GetAllConditions()["NbObjet"].codeExtraInformation
        .SetFunctionName("gdjs.pickedObjectsCount");
    GetAllConditions()["CollisionNP"].codeExtraInformation
        .SetFunctionName("gdjs.objectTools.hitBoxesCollisionTest");

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
                        newX = ManObjListName(realObjects[i])+"[i].getX() "+op1 + expression1Code;
                    else
                        return "";
                    std::string op2 = instruction.GetParameter(3).GetPlainString();
                    if ( op2 == "=" || op2.empty() )
                        newY = expression2Code;
                    else if ( op2 == "/" || op2 == "*" || op2 == "-" || op2 == "+" )
                        newY = ManObjListName(realObjects[i])+"[i].getY() "+op2 + expression2Code;
                    else
                        return "";

                    std::string call = ManObjListName(realObjects[i])+"[i].setPosition("+newX+","+newY+")";

                    outputCode += "for(var i = 0, len = "+ManObjListName(realObjects[i])+".length ;i < len;++i) {\n";
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

    /*[""].codeExtraInformation
        .SetFunctionName("changeXY").SetIncludeFile("runtimeobject.js");*/ //TODO

/*
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
            .codeExtraInformation.SetFunctionName("AddForceTowardObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");


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
            .codeExtraInformation.SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");


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
            .codeExtraInformation.SetFunctionName("PutAroundObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");


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
            .codeExtraInformation.SetFunctionName("SeparateObjectsWithForces").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");


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
            .codeExtraInformation.SetFunctionName("SeparateObjectsWithoutForces").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");


        obj.AddAction("SeparateFromObjects",
                       _("Separate two objects"),
                       _("Move an object away from another using their collision masks.\nBe sure to call this action on a reasonable number of objects so as\nnot to slow down the game."),
                       _("Move away _PARAM0_ of _PARAM1_ ( only _PARAM0_ will move )"),
                       _("Position"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png")

            .AddParameter("object", _("Object"))
            .AddParameter("objectList", _("Objects"))
            .codeExtraInformation.SetFunctionName("SeparateFromObjects").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

*/
/*
    AddAction("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM3_ "),
                   _("Objects"),
                   "res/actions/add24.png",
                   "res/actions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .codeExtraInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM3_ "),
                   _("Objects"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .codeExtraInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("SeDirige",
                   _("An object is moving to another"),
                   _("Test if an object moves towards another.\nThe first object must move."),
                   _("_PARAM0_ is moving to _PARAM1_"),
                   _("Displacement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object 2"))
        .AddParameter("expression", _("Angle of tolerance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("MovesToward").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");



    AddCondition("Distance",
                   _("Distance between two objects"),
                   _("Test the distance between two objects."),
                   _("The distance between _PARAM0_ and _PARAM1_ is _PARAM4__PARAM5_"),
                   _("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("objectList", _("Object"))
        .AddParameter("objectList", _("Object 2"))
        .AddParameter("expression", _("Distance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("DistanceBetweenObjects").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");



    AddCondition("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM3_ "),
                   _("Objects"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .codeExtraInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");



    AddCondition("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM3_ "),
                   _("Objects"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectList", _("Object"))
        .codeExtraInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
*/
}
