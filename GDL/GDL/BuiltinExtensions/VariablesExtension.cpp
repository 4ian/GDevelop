/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/VariablesExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDL/CommonTools.h"
#include "GDL/Project.h"
#include "GDL/Scene.h"

VariablesExtension::VariablesExtension()
{
    SetExtensionInformation("BuiltinVariables",
                          _("Variable features"),
                          _("Built-in extension allowing to manipulate variables"),
                          "Florian Rival",
                          "Freeware");
    #if defined(GD_IDE_ONLY)
    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Layout & scene = codeGenerator.GetLayout();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetSceneVariableValue(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetSceneVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" || instruction.GetParameters()[2].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == ">")
                    return "conditionTrue = ("+variableGetCode+" > "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "<")
                    return "conditionTrue = ("+variableGetCode+" < "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "<=")
                    return "conditionTrue = ("+variableGetCode+" <= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == ">=")
                    return "conditionTrue = ("+variableGetCode+" >= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("VarScene",
                   _("Scene variables"),
                   _("Test a variable."),
                   _("Variable _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Layout & scene = codeGenerator.GetLayout();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetSceneVariableString(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetSceneVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" || instruction.GetParameters()[2].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("VarSceneTxt",
                   _("Text of a scene variable"),
                   _("Test the text of a variable."),
                   _("The text of variable _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text to test"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }


    AddCondition("VarSceneDef",
                   _("Test if a scene variable is defined"),
                   _("Test if the scene variable exist."),
                   _("Variable _PARAM1_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("SceneVariableDefined").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");


    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Project & project = codeGenerator.GetProject();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetGlobalVariableValue(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<project.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( project.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetGlobalVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" || instruction.GetParameters()[2].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == ">")
                    return "conditionTrue = ("+variableGetCode+" > "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "<")
                    return "conditionTrue = ("+variableGetCode+" < "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "<=")
                    return "conditionTrue = ("+variableGetCode+" <= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == ">=")
                    return "conditionTrue = ("+variableGetCode+" >= "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("VarGlobal",
                   _("Global variable"),
                   _("Test the value of a global variable."),
                   _("The global variable _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }


    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Project & project = codeGenerator.GetProject();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableGetCode = "GetGlobalVariableString(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<project.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( project.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableGetCode = "IndexGetGlobalVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" || instruction.GetParameters()[2].GetPlainString().empty() )
                    return "conditionTrue = ("+variableGetCode+" == "+expressionCode+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "!=")
                    return "conditionTrue = ("+variableGetCode+" != "+expressionCode+");\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("VarGlobalTxt",
                   _("Text of a global variable"),
                   _("Test the text of a global variable."),
                   _("The text of the global variable _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text to test"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));

    }



    AddCondition("VarGlobalDef",
                   _("Test if a global variable is defined"),
                   _("Test if a global variable exists"),
                   _("Global variable _PARAM1_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the variable"))
        .codeExtraInformation.SetFunctionName("GlobalVariableDefined").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");



    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Layout & scene = codeGenerator.GetLayout();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetSceneVariable(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "-")
                    return variableObtainCode+" -= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "*")
                    return variableObtainCode+" *= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "/")
                    return variableObtainCode+" /= "+expressionCode+";\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddAction("ModVarScene",
                   _("Scene variables"),
                   _("Modify a scene variable."),
                   _("Do _PARAM2__PARAM3_ to variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));

    }

    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Layout & scene = codeGenerator.GetLayout();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetSceneVariable(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<scene.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( scene.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetSceneVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddAction("ModVarSceneTxt",
                   _("Text of a scene variable"),
                   _("Modify the text of a scene variable."),
                   _("Do _PARAM2__PARAM3_ to the text of variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));

    }

    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Project & project = codeGenerator.GetProject();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "0";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetGlobalVariable(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<project.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( project.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "-")
                    return variableObtainCode+" -= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "*")
                    return variableObtainCode+" *= "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "/")
                    return variableObtainCode+" /= "+expressionCode+";\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddAction("ModVarGlobal",
                   _("Global variable"),
                   _("Modify a global variable"),
                   _("Do _PARAM2__PARAM3_ to global variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));

    }

    {
        //Optimized implementation to speed up access to variables which are declared in scene initial variables:
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Project & project = codeGenerator.GetProject();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                //Generate the code for the expression as usual
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                    if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty()) expressionCode = "\"\"";
                }

                //Generate variable getter call.
                std::string variableObtainCode = "GetGlobalVariable(*runtimeContext->scene, \""+codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<project.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( project.GetVariables().GetVariablesVector()[i].GetName() == instruction.GetParameters()[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariable(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" )
                    return variableObtainCode+" = "+expressionCode+";\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "+")
                    return variableObtainCode+" += "+expressionCode+";\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddAction("ModVarGlobalTxt",
                   _("Text of a global variable"),
                   _("Modify the text of a global variable."),
                   _("Do _PARAM2__PARAM3_ to the text of global variable _PARAM1_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the variable"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Layout & scene = codeGenerator.GetLayout();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetSceneVariableValue(*runtimeContext->scene, \""+codeGenerator.ConvertToString(parameters[1].GetPlainString())+"\")";
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

        gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddExpression("Variable", _("Scene variables"), _("Scene variables"), _("Variables"), "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));

    }

    {
        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Layout & scene = codeGenerator.GetLayout();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetSceneVariableString(*runtimeContext->scene, \""+codeGenerator.ConvertToString(parameters[1].GetPlainString())+"\")";
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
        gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddStrExpression("VariableString", _("Scene variables"), _("Text of a scene variable"), _("Variables"), "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Name of the variable"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Project & project = codeGenerator.GetProject();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetGlobalVariableValue(*runtimeContext->scene, \""+codeGenerator.ConvertToString(parameters[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<project.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( project.GetVariables().GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariableValue(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };
        gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddExpression("GlobalVariable", _("Global variable"), _("Global variable"), _("Variables"), "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the global variable"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                const gd::Project & project = codeGenerator.GetProject();
                codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
                std::string variableObtainCode = "GetGlobalVariableString(*runtimeContext->scene, \""+codeGenerator.ConvertToString(parameters[1].GetPlainString())+"\")";
                for (unsigned int i = 0;i<project.GetVariables().GetVariablesVector().size();++i)
                {
                    if ( project.GetVariables().GetVariablesVector()[i].GetName() == parameters[1].GetPlainString() )
                    {
                        variableObtainCode = "IndexGetGlobalVariableString(*runtimeContext->scene, "+ToString(i)+")"; //Try to optimize the call when the variable position is known.
                        break;
                    }
                }

                return variableObtainCode;
            };
        };
        gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddStrExpression("GlobalVariableString", _("Global variable"), _("Text of a global variable"), _("Variables"), "res/actions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("globalvar", _("Name of the variable"))
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }
    #endif
}

