/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/VariablesExtension.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/Events/ExpressionsCodeGeneration.h"
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"

VariablesExtension::VariablesExtension()
{
    DECLARE_THE_EXTENSION("BuiltinVariables",
                          _("Fonctionnalités sur les variables"),
                          _("Extension permettant de manipuler les variables, integrée en standard"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("VarScene",
                   _("Variable de la scène"),
                   _("Teste si la variable correspond au test effectué."),
                   _("La variable _PARAM1_ est _PARAM3_ à _PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        //Naive implementation:
        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetSceneVariableValue(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<scene.variables.GetVariablesVector().size();++i)
                {
                    if ( scene.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetSceneVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" || instruction.GetParameters()[3].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == ">")
                    return "conditionTrue = ("+variableGetCode+" > "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "<")
                    return "conditionTrue = ("+variableGetCode+" < "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "<=")
                    return "conditionTrue = ("+variableGetCode+" <= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == ">")
                    return "conditionTrue = ("+variableGetCode+" >= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneTxt",
                   _("Texte d'une variable de la scène"),
                   _("Teste si le texte de la variable correspond au test effectué."),
                   _("Le texte de la variable _PARAM1_ est _PARAM3_ à _PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("string", _("Texte à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseTextExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetSceneVariableString(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<scene.variables.GetVariablesVector().size();++i)
                {
                    if ( scene.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetSceneVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" || instruction.GetParameters()[3].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneDef",
                   _("Tester si une variable de la scène est définie"),
                   _("Teste si la variable de la scène existe."),
                   _("La variable _PARAM1_ est définie"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("SceneVariableDefined").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobal",
                   _("Variable globale"),
                   _("Teste si la variable globale correspond au test effectué."),
                   _("La variable globale _PARAM1_ est _PARAM3_ à _PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetGlobalVariableValue(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<game.variables.GetVariablesVector().size();++i)
                {
                    if ( game.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetGlobalVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" || instruction.GetParameters()[3].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == ">")
                    return "conditionTrue = ("+variableGetCode+" > "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "<")
                    return "conditionTrue = ("+variableGetCode+" < "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "<=")
                    return "conditionTrue = ("+variableGetCode+" <= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == ">")
                    return "conditionTrue = ("+variableGetCode+" >= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalTxt",
                   _("Texte d'une variable globale"),
                   _("Teste si le texte de la variable globale correspond au test effectué."),
                   _("Le texte de la variable globale _PARAM1_ est _PARAM3_ à _PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("string", _("Texte à tester"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseTextExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetGlobalVariableString(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<game.variables.GetVariablesVector().size();++i)
                {
                    if ( game.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetGlobalVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" || instruction.GetParameters()[3].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalDef",
                   _("Tester si une variable globale est définie"),
                   _("Teste si la variable globale existe."),
                   _("La variable globale _PARAM1_ est définie"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GlobalVariableDefined").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ModVarScene",
                   _("Variable de la scène"),
                   _("Modifie une variable de la scène."),
                   _("Faire _PARAM3__PARAM2_ à la variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetSceneVariable(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<scene.variables.GetVariablesVector().size();++i)
                {
                    if ( scene.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "-")
                    return variableObtainCode+" -= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "*")
                    return variableObtainCode+" *= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "/")
                    return variableObtainCode+" /= "+expressionCode+";\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarSceneTxt",
                   _("Texte d'une variable de la scène"),
                   _("Modifie le texte d'une variable de la scène."),
                   _("Faire _PARAM3__PARAM2_ au texte de la variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("string", _("Texte"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseTextExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetSceneVariable(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<scene.variables.GetVariablesVector().size();++i)
                {
                    if ( scene.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobal",
                   _("Variable globale"),
                   _("Modifie une variable globale"),
                   _("Faire _PARAM3__PARAM2_ à la variable globale _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("expression", _("Valeur"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetGlobalVariable(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<game.variables.GetVariablesVector().size();++i)
                {
                    if ( game.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "-")
                    return variableObtainCode+" -= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "*")
                    return variableObtainCode+" *= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "/")
                    return variableObtainCode+" /= "+expressionCode+";\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobalTxt",
                   _("Texte d'une variable globale"),
                   _("Modifie le texte d'une variable globale."),
                   _("Faire _PARAM3__PARAM2_ au texte de la variable globale _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable"), "", false);
        instrInfo.AddParameter("string", _("Texte"), "", false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseTextExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetGlobalVariable(*runtimeContext->scene, \""+instruction.GetParameters()[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<game.variables.GetVariablesVector().size();++i)
                {
                    if ( game.variables.GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[3].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));


    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("Variable", _("Variable de la scène"), _("Variable de la scène"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);

        //Naive implementation:
        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariableValue").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public ExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<GDExpression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                std::string variableObtainCode = "GetSceneVariableValue(*runtimeContext->scene, \""+parameters[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<scene.variables.GetVariablesVector().size();++i)
                {
                    if ( scene.variables.GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        ExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<ExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("VariableString", _("Variable de la scène"), _("Texte d'une variable de la scène"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Nom de la variable"), "", false);

        //Naive implementation:
        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariableString").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<GDExpression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                std::string variableObtainCode = "GetSceneVariableString(*runtimeContext->scene, \""+parameters[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<scene.variables.GetVariablesVector().size();++i)
                {
                    if ( scene.variables.GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("GlobalVariable", _("Variable globale"), _("Variable globale"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable globale"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariableValue").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public ExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<GDExpression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                std::string variableObtainCode = "GetGlobalVariableValue(*runtimeContext->scene, \""+parameters[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<game.variables.GetVariablesVector().size();++i)
                {
                    if ( game.variables.GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "GetGlobalVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        ExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<ExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("GlobalVariableString", _("Variable globale"), _("Texte d'une variable globale"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Nom de la variable"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariableString").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, const std::vector<GDExpression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                std::string variableObtainCode = "GetGlobalVariableString(*runtimeContext->scene, \""+parameters[1].GetPlainString()+"\")";
                for (unsigned int i = 0;i<game.variables.GetVariablesVector().size();++i)
                {
                    if ( game.variables.GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "GetGlobalVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    DECLARE_END_STR_EXPRESSION()
    #endif
}
