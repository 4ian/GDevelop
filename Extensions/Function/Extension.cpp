/**

GDevelop - Function Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCpp/CppPlatform.h"
#include "GDCpp/Project.h"
#include "GDCpp/Scene.h"
#include "GDCpp/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/Instruction.h"
#endif
#include "FunctionEvent.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("Function",
                              _("Function events"),
                              _("Extension allowing to use events behaving as functions."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)

        {
            class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
                {
                    std::string functionName = instruction.GetParameter(0).GetPlainString();
                    const gd::Project & project = codeGenerator.GetProject();
                    const gd::Layout & layout = codeGenerator.GetLayout();

                    const FunctionEvent * functionEvent = FunctionEvent::SearchForFunctionInEvents(project, layout.GetEvents(), functionName);
                    if ( !functionEvent )
                    {
                        std::cout << "Function \""+functionName+"\" not found!" << std::endl;
                        return "//Function \""+functionName+"\" not found.\n";
                    }

                    codeGenerator.AddGlobalDeclaration("void "+FunctionEvent::MangleFunctionName(layout, *functionEvent)+"(RuntimeContext *, std::map <std::string, std::vector<RuntimeObject*> *>, std::vector<std::string> &);\n");
                    std::string code;

                    //Generate code for objects passed as arguments
                    std::string objectsAsArgumentCode;
                    {
                        objectsAsArgumentCode += "runtimeContext->ClearObjectListsMap()";
                        std::vector<std::string> realObjects = codeGenerator.ExpandObjectsName(functionEvent->GetObjectsPassedAsArgument(), context);
                        for (unsigned int i = 0;i<realObjects.size();++i)
                        {
                            context.EmptyObjectsListNeeded(realObjects[i]);
                            objectsAsArgumentCode += ".AddObjectListToMap(\""+codeGenerator.ConvertToString(realObjects[i])+"\", "+ManObjListName(realObjects[i])+")";
                        }
                        objectsAsArgumentCode += ".ReturnObjectListsMap()";
                    }

                    //Generate code for evaluating parameters
                    code += "std::vector<std::string> functionParameters;\n";
                    for (unsigned int i = 1;i<8;++i)
                    {
                        std::string parameterCode;
                        gd::CallbacksForGeneratingExpressionCode callbacks(parameterCode, codeGenerator, context);
                        gd::ExpressionParser parser(instruction.GetParameter(i).GetPlainString());
                        parser.ParseStringExpression(CppPlatform::Get(), project, layout, callbacks);
                        if (parameterCode.empty()) parameterCode = "\"\"";

                        code += "functionParameters.push_back("+parameterCode+");\n";
                    }

                    code += FunctionEvent::MangleFunctionName(layout, *functionEvent)+"(runtimeContext, "+objectsAsArgumentCode+", functionParameters);\n";
                    return code;
                };
            };

            gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

            AddAction("LaunchFunction",
                           _("Launch a function"),
                           _("Launch a function"),
                           _("Launch _PARAM0_ (_PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_, _PARAM5_, _PARAM6_, _PARAM7_)"),
                           _("Functions"),
                           "res/actions/function24.png",
                           "res/actions/function.png")

                .AddParameter("", _("Name of the function"))
                .AddParameter("string", _("Parameter 1"), "", true)
                .AddParameter("string", _("Parameter 2"), "", true)
                .AddParameter("string", _("Parameter 3"), "", true)
                .AddParameter("string", _("Parameter 4"), "", true)
                .AddParameter("string", _("Parameter 5"), "", true)
                .AddParameter("string", _("Parameter 6"), "", true)
                .AddParameter("string", _("Parameter 7"), "", true)
                .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
        }

        {

            class CodeGen : public gd::EventMetadata::CodeGenerator
            {
                virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator,
                                             gd::EventsCodeGenerationContext & /* The function has nothing to do with the current context */)
                {
                    FunctionEvent & event = dynamic_cast<FunctionEvent&>(event_);
                    const gd::Layout & layout = codeGenerator.GetLayout();

                    //Declaring function prototype.
                    codeGenerator.AddGlobalDeclaration("void "+FunctionEvent::MangleFunctionName(layout, event)+"(RuntimeContext *, std::map <std::string, std::vector<RuntimeObject*> *>, std::vector<std::string> &);\n");

                    //Generating function code:
                    std::string functionCode;
                    functionCode += "\nvoid "+FunctionEvent::MangleFunctionName(layout, event)+"(RuntimeContext * runtimeContext, std::map <std::string, std::vector<RuntimeObject*> *> objectsListsMap, std::vector<std::string> & currentFunctionParameters)\n{\n";

                    gd::EventsCodeGenerationContext callerContext;
                    {
                        std::vector<std::string> realObjects = codeGenerator.ExpandObjectsName(event.GetObjectsPassedAsArgument(), callerContext);
                        for (unsigned int i = 0;i<realObjects.size();++i)
                        {
                            callerContext.EmptyObjectsListNeeded(realObjects[i]);
                            functionCode += "std::vector<RuntimeObject*> "+ManObjListName(realObjects[i]) + ";\n";
                            functionCode += "if ( objectsListsMap[\""+realObjects[i]+"\"] != NULL ) "+ManObjListName(realObjects[i])+" = *objectsListsMap[\""+realObjects[i]+"\"];\n";
                        }
                    }
                    functionCode += "{";

                    gd::EventsCodeGenerationContext context;
                    context.InheritsFrom(callerContext);

                    //Generating function body code
                    std::string conditionsCode = codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);
                    std::string actionsCode = codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                    std::string subeventsCode = codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);

                    functionCode += codeGenerator.GenerateObjectsDeclarationCode(context);
                    std::string ifPredicat = "true";
                    for (unsigned int i = 0;i<event.GetConditions().size();++i)
                        ifPredicat += " && condition"+ToString(i)+"IsTrue";

                    functionCode += conditionsCode;
                    functionCode += "if (" +ifPredicat+ ")\n";
                    functionCode += "{\n";
                    functionCode += actionsCode;
                    if ( event.HasSubEvents() ) //Sub events
                    {
                        functionCode += "\n{\n";
                        functionCode += subeventsCode;
                        functionCode += "}\n";
                    }
                    functionCode += "}\n";

                    functionCode += "}\n"; //Context end
                    functionCode += "}\n"; //Function end
                    codeGenerator.AddCustomCodeOutsideMain(functionCode);

                    return "";
                }
            };
            gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

            AddEvent("Function",
                    _("Function"),
                    _("Function event : An event which is launched only thanks to action \"Launch a function\""),
                    "",
                    "res/function.png",
                    boost::shared_ptr<gd::BaseEvent>(new FunctionEvent))
                .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
        }

        {
            class CodeGenerator : public gd::ExpressionCodeGenerationInformation::CustomCodeGenerator
            {
                virtual std::string GenerateCode(const std::vector<gd::Expression> & parameters, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
                {
                    codeGenerator.AddIncludeFile("Function/FunctionTools.h");
                    const gd::Project & game = codeGenerator.GetProject();
                    const gd::Layout & scene = codeGenerator.GetLayout();

                    //Ensure currentFunctionParameters vector is always existing.
                    std::string mainFakeParameters = "std::vector<std::string> currentFunctionParameters;\n";
                    if (codeGenerator.GetCustomCodeInMain().find(mainFakeParameters) == std::string::npos)
                        codeGenerator.AddCustomCodeInMain(mainFakeParameters);

                    //Generate code for evaluating index
                    std::string expression;
                    gd::CallbacksForGeneratingExpressionCode callbacks(expression, codeGenerator, context);
                    gd::ExpressionParser parser(parameters[0].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), game, scene, callbacks) || expression.empty()) expression = "0";

                    std::string code;

                    code += "GDpriv::FunctionTools::GetSafelyStringFromVector(currentFunctionParameters, "+expression+")";

                    return code;
                };
            };

            gd::ExpressionCodeGenerationInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

            AddStrExpression("Parameter",
                           _("Parameter of the current function"),
                           _("Return the text contained in a parameter of the currently launched function"),
                           _("Function"),
                           "res/function.png")
                .AddParameter("expression", _("Index of the parameter (Parameters start at 0!)"))
                .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>(codeGenerator));
        }
        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
