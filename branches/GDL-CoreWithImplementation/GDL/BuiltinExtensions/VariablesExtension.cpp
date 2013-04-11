/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
                          _("Variable features"),
                          _("Builtin extension allowing to manipulate variables"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("VarScene",
                   _("Scene variables"),
                   _("Test a variable."),
                   _("Variable _PARAM1_ is _PARAM3__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        //Naive implementation:
        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetSceneVariableValue(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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
                else if ( instruction.GetParameters()[3].GetPlainString() == ">=")
                    return "conditionTrue = ("+variableGetCode+" >= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneTxt",
                   _("Text of a scene variable"),
                   _("Test the text of a variable."),
                   _("The text of variable _PARAM1_ is _PARAM3__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("string", _("Text to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseStringExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetSceneVariableString(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneDef",
                   _("Test if a scene variable is defined"),
                   _("Test if the scene variable exist."),
                   _("Variable _PARAM1_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("SceneVariableDefined").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobal",
                   _("Global variable"),
                   _("Test the value of a global variable."),
                   _("The global variable _PARAM1_ is _PARAM3__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetGlobalVariableValue(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<game.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( game.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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
                else if ( instruction.GetParameters()[3].GetPlainString() == ">=")
                    return "conditionTrue = ("+variableGetCode+" >= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[3].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalTxt",
                   _("Text of a global variable"),
                   _("Test the text of a global variable."),
                   _("The text of the global variable _PARAM1_ is _PARAM3__PARAM2_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("string", _("Text to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseStringExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetGlobalVariableString(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<game.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( game.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalDef",
                   _("Test if a global variable is defined"),
                   _("Test if a global variable exists"),
                   _("Global variable _PARAM1_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the variable"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GlobalVariableDefined").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ModVarScene",
                   _("Scene variables"),
                   _("Modify a scene variable."),
                   _("Do _PARAM3__PARAM2_ to variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetSceneVariable(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarSceneTxt",
                   _("Text of a scene variable"),
                   _("Modify the text of a scene variable."),
                   _("Do _PARAM3__PARAM2_ to the text of variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("string", _("Text"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseStringExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetSceneVariable(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobal",
                   _("Global variable"),
                   _("Modify a global variable"),
                   _("Do _PARAM3__PARAM2_ to global variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetGlobalVariable(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<game.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( game.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobalTxt",
                   _("Text of a global variable"),
                   _("Modify the text of a global variable."),
                   _("Do _PARAM3__PARAM2_ to the text of global variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the variable"), "", false);
        instrInfo.AddParameter("string", _("Text"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariable").SetManipulatedType("string").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    CallbacksForGeneratingExpressionCode callbacks(expressionCode, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseStringExpression(game, scene, callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetGlobalVariable(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<game.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( game.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
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

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));


    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("Variable", _("Scene variables"), _("Scene variables"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);

        //Naive implementation:
        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariableValue").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::ExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetSceneVariableValue(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(parameters[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        gd::ExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("VariableString", _("Scene variables"), _("Text of a scene variable"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Name of the variable"), "", false);

        //Naive implementation:
        //instrInfo.cppCallingInformation.SetFunctionName("GetSceneVariableString").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetSceneVariableString(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(parameters[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("GlobalVariable", _("Global variable"), _("Global variable"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the global variable"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariableValue").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::ExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetGlobalVariableValue(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(parameters[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<game.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( game.GetVariables().GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        gd::ExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("GlobalVariableString", _("Global variable"), _("Text of a global variable"), _("Variables"), "res/actions/var.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("globalvar", _("Name of the variable"), "", false);

        //instrInfo.cppCallingInformation.SetFunctionName("GetGlobalVariableString").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const gd::Layout & scene, const std::vector<gd::Expression> & parameters, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetGlobalVariableString(*runtimeContext->scene, \""+EventsCodeGenerator::ConvertToCppString(parameters[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<game.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( game.GetVariables().GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };

        gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    DECLARE_END_STR_EXPRESSION()
    #endif
}

