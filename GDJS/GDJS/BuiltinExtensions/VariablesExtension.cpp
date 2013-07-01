/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "GDJS/BuiltinExtensions/VariablesExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

VariablesExtension::VariablesExtension()
{
    SetExtensionInformation("BuiltinVariables",
                          _("Variable features"),
                          _("Built-in extension allowing to manipulate variables"),
                          "Florian Rival",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinVariables");

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "0";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string boolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";

                if ( op == "=" || op.empty() )
                    return boolean+" = runtimeScene.getVariables().get(\""+var+"\").getAsNumber() === "+expressionCode+";";
                else if ( op == ">" || op == "<" || op == ">=" || op == "<=" || op == "!=" )
                    return boolean+" = runtimeScene.getVariables().get(\""+var+"\").getAsNumber() "+op+" "+expressionCode+";";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllConditions()["VarScene"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "\"\"";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string boolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";

                if ( op == "=" || op.empty() )
                    return boolean+" = runtimeScene.getVariables().get(\""+var+"\").getAsString() === "+expressionCode+";";
                else if ( op == "!=" )
                    return boolean+" = runtimeScene.getVariables().get(\""+var+"\").getAsString() !== "+expressionCode+";";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllConditions()["VarSceneTxt"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string boolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";
                return boolean+" = runtimeScene.getVariables().hasVariable(\""+var+"\");";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllConditions()["VarSceneDef"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "0";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string getCode = "runtimeScene.getVariables().get(\""+var+"\")";

                if ( op == "=" )
                    return getCode+".setNumber("+expressionCode+");\n";
                else if ( op == "+" )
                    return getCode+".add("+expressionCode+");\n";
                else if ( op == "-" )
                    return getCode+".sub("+expressionCode+");\n";
                else if ( op == "*" )
                    return getCode+".mul("+expressionCode+");\n";
                else if ( op == "/" )
                    return getCode+".div("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarScene"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "\"\"";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string getCode = "runtimeScene.getVariables().get(\""+var+"\")";

                if ( op == "=" )
                    return getCode+".setString("+expressionCode+");\n";
                else if ( op == "+" )
                    return getCode+".concatenate("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarSceneTxt"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "0";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string boolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";

                if ( op == "=" || op.empty() )
                    return boolean+" = runtimeScene.getGame().getVariables().get(\""+var+"\").getAsNumber() === "+expressionCode+";";
                else if ( op == ">" || op == "<" || op == ">=" || op == "<=" || op == "!=" )
                    return boolean+" = runtimeScene.getGame().getVariables().get(\""+var+"\").getAsNumber() "+op+" "+expressionCode+";";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllConditions()["VarGlobal"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "\"\"";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string boolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";

                if ( op == "=" || op.empty() )
                    return boolean+" = runtimeScene.getGame().getVariables().get(\""+var+"\").getAsString() === "+expressionCode+";";
                else if ( op == "!=" )
                    return boolean+" = runtimeScene.getGame().getVariables().get(\""+var+"\").getAsString() !== "+expressionCode+";";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllConditions()["VarGlobalTxt"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string boolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";
                return boolean+" = runtimeScene.getGame().getVariables().hasVariable(\""+var+"\");";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllConditions()["VarGlobalDef"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "0";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string getCode = "runtimeScene.getGame().getVariables().get(\""+var+"\")";

                if ( op == "=" )
                    return getCode+".setNumber("+expressionCode+");\n";
                else if ( op == "+" )
                    return getCode+".add("+expressionCode+");\n";
                else if ( op == "-" )
                    return getCode+".sub("+expressionCode+");\n";
                else if ( op == "*" )
                    return getCode+".mul("+expressionCode+");\n";
                else if ( op == "/" )
                    return getCode+".div("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarGlobal"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[3].GetPlainString());
                if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "\"\"";

                std::string op = instruction.GetParameters()[2].GetPlainString();
                std::string var = codeGenerator.ConvertToString(instruction.GetParameters()[1].GetPlainString());
                std::string getCode = "runtimeScene.getGame().getVariables().get(\""+var+"\")";

                if ( op == "=" )
                    return getCode+".setString("+expressionCode+");\n";
                else if ( op == "+" )
                    return getCode+".concatenate("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarGlobalTxt"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }

    {
        class CodeGenerator : public gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(parameters[1].GetPlainString());
                return "runtimeScene.getVariables().get(\""+var+"\").getAsNumber()";
            };
        };
        gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator;

        GetAllExpressions()["Variable"]
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        class CodeGenerator : public gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(parameters[1].GetPlainString());
                return "runtimeScene.getVariables().get(\""+var+"\").getAsString()";
            };
        };
        gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        GetAllStrExpressions()["VariableString"]
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }
    {
        class CodeGenerator : public gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(parameters[1].GetPlainString());
                return "runtimeScene.getGame().getVariables().get(\""+var+"\").getAsNumber()";
            };
        };
        gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator;

        GetAllExpressions()["GlobalVariable"]
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(parameters[1].GetPlainString());
                return "runtimeScene.getGame().getVariables().get(\""+var+"\").getAsString()";
            };
        };
        gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        GetAllStrExpressions()["GlobalVariableString"]
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }
}
