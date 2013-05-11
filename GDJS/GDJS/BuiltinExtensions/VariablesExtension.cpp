/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
                          _("Builtin extension allowing to manipulate variables"),
                          "Compil Games",
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

                if ( op == "=" || op.empty() )
                    return "conditionTrue.val = runtimeScene.getVariables().get(\""+var+"\").getValue() === "+expressionCode+";";
                else if ( op == ">" || op == "<" || op == ">=" || op == "<=" || op == "!=" )
                    return "conditionTrue.val = runtimeScene.getVariables().get(\""+var+"\").getValue() "+op+" "+expressionCode+";";

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

                if ( op == "=" || op.empty() )
                    return "conditionTrue.val = runtimeScene.getVariables().get(\""+var+"\").getValue() === "+expressionCode+";";
                else if ( op == "!=" )
                    return "conditionTrue.val = runtimeScene.getVariables().get(\""+var+"\").getValue() !== "+expressionCode+";";

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
                return "conditionTrue.val = runtimeScene.getVariables().hasVariable(\""+var+"\");";
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
                    return getCode+".setValue("+expressionCode+");\n";
                else if ( op == "+" || op == "-" || op == "/" || op == "*" )
                    return getCode+".setValue("+getCode+".getValue() "+op+expressionCode+");\n";

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
                    return getCode+".setValue("+expressionCode+");\n";
                else if ( op == "+" )
                    return getCode+".setValue("+getCode+".getValue() "+op+expressionCode+");\n";

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

                if ( op == "=" || op.empty() )
                    return "conditionTrue.val = runtimeScene.getGame().getVariables().get(\""+var+"\").getValue() === "+expressionCode+";";
                else if ( op == ">" || op == "<" || op == ">=" || op == "<=" || op == "!=" )
                    return "conditionTrue.val = runtimeScene.getGame().getVariables().get(\""+var+"\").getValue() "+op+" "+expressionCode+";";

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

                if ( op == "=" || op.empty() )
                    return "conditionTrue.val = runtimeScene.getGame().getVariables().get(\""+var+"\").getValue() === "+expressionCode+";";
                else if ( op == "!=" )
                    return "conditionTrue.val = runtimeScene.getGame().getVariables().get(\""+var+"\").getValue() !== "+expressionCode+";";

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
                return "conditionTrue = runtimeScene.getGame().getVariables().hasVariable(\""+var+"\");";
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
                    return getCode+".setValue("+expressionCode+");\n";
                else if ( op == "+" || op == "-" || op == "/" || op == "*" )
                    return getCode+".setValue("+getCode+".getValue() "+op+expressionCode+");\n";

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
                    return getCode+".setValue("+expressionCode+");\n";
                else if ( op == "+" )
                    return getCode+".setValue("+getCode+".getValue() "+op+expressionCode+");\n";

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
                return "runtimeScene.getVariables().get(\""+var+"\").getValue()";
            };
        };
        gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator;

        GetAllExpressions()["Variable"]
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        //Implementation optimized for declared scene variables:
        class CodeGenerator : public gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string var = codeGenerator.ConvertToString(parameters[1].GetPlainString());
                return "runtimeScene.getVariables().get(\""+var+"\").getValue()";
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
                return "runtimeScene.getGame().getVariables().get(\""+var+"\").getValue()";
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
                return "runtimeScene.getGame().getVariables().get(\""+var+"\").getValue()";
            };
        };
        gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        GetAllStrExpressions()["GlobalVariableString"]
        .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::StrExpressionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }
}
