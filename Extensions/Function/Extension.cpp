/**

GDevelop - Function Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCpp/Extensions/CppPlatform.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/Project/Project.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Parsers/ExpressionParser.h"
#endif
#include "FunctionEvent.h"

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  Extension() {
    SetExtensionInformation("Function",
                            _("Function events"),
                            _("This Extension allows you to use events that "
                              "behave like functions."),
                            "Florian Rival",
                            "Open source (MIT License)");

#if defined(GD_IDE_ONLY)

    AddAction("LaunchFunction",
              _("Launch a function"),
              _("Launch a function"),
              _("Launch _PARAM0_ (_PARAM1_, _PARAM2_, _PARAM3_, _PARAM4_, "
                "_PARAM5_, _PARAM6_, _PARAM7_)"),
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
        .codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                   gd::EventsCodeGenerator& codeGenerator,
                                   gd::EventsCodeGenerationContext& context) {
          gd::String functionName =
              instruction.GetParameter(0).GetPlainString();

          if (!codeGenerator.HasProjectAndLayout()) {
            return gd::String(
                "/*Function generation not supported without layout*/");
          }

          const gd::Project& project = codeGenerator.GetProject();
          const gd::Layout& layout = codeGenerator.GetLayout();

          const FunctionEvent* functionEvent =
              FunctionEvent::SearchForFunctionInEvents(
                  project, layout.GetEvents(), functionName);
          if (!functionEvent) {
            std::cout << "Function \"" + functionName + "\" not found!"
                      << std::endl;
            return "//Function \"" + functionName + "\" not found.\n";
          }

          codeGenerator.AddGlobalDeclaration(
              "void " +
              FunctionEvent::MangleFunctionName(layout, *functionEvent) +
              "(RuntimeContext *, std::map <gd::String, "
              "std::vector<RuntimeObject*> *>, std::vector<gd::String> &);\n");
          gd::String code;

          // Generate code for objects passed as arguments
          gd::String objectsAsArgumentCode;
          {
            objectsAsArgumentCode += "runtimeContext->ClearObjectListsMap()";
            std::vector<gd::String> realObjects =
                codeGenerator.ExpandObjectsName(
                    functionEvent->GetObjectsPassedAsArgument(), context);
            for (std::size_t i = 0; i < realObjects.size(); ++i) {
              context.EmptyObjectsListNeeded(realObjects[i]);
              objectsAsArgumentCode +=
                  ".AddObjectListToMap(\"" +
                  codeGenerator.ConvertToString(realObjects[i]) + "\", " +
                  ManObjListName(realObjects[i]) + ")";
            }
            objectsAsArgumentCode += ".ReturnObjectListsMap()";
          }

          // Generate code for evaluating parameters
          code += "std::vector<gd::String> functionParameters;\n";
          for (std::size_t i = 1; i < 8; ++i) {
            gd::String parameterCode =
                gd::ExpressionCodeGenerator::GenerateExpressionCode(
                    codeGenerator,
                    context,
                    "string",
                    instruction.GetParameter(i).GetPlainString());

            code += "functionParameters.push_back(" + parameterCode + ");\n";
          }

          code += FunctionEvent::MangleFunctionName(layout, *functionEvent) +
                  "(runtimeContext, " + objectsAsArgumentCode +
                  ", functionParameters);\n";
          return code;
        });

    AddEvent("Function",
             _("Function"),
             _("Function event : An event that can only be launched by the "
               "action named \"Launch a function\""),
             "",
             "res/function.png",
             std::make_shared<FunctionEvent>())
        .SetCodeGenerator(
            [](gd::BaseEvent& event_, gd::EventsCodeGenerator& codeGenerator, gd::EventsCodeGenerationContext& /* The function has nothing to do with the current context */) {
              FunctionEvent& event = dynamic_cast<FunctionEvent&>(event_);

              if (!codeGenerator.HasProjectAndLayout())
                return "/*Function generation not supported without layout*/";
              const gd::Layout& layout = codeGenerator.GetLayout();

              // Declaring function prototype.
              codeGenerator.AddGlobalDeclaration(
                  "void " + FunctionEvent::MangleFunctionName(layout, event) +
                  "(RuntimeContext *, std::map <gd::String, "
                  "std::vector<RuntimeObject*> *>, std::vector<gd::String> "
                  "&);\n");

              // Generating function code:
              gd::String functionCode;
              functionCode +=
                  "\nvoid " + FunctionEvent::MangleFunctionName(layout, event) +
                  "(RuntimeContext * runtimeContext, std::map <gd::String, "
                  "std::vector<RuntimeObject*> *> objectsListsMap, "
                  "std::vector<gd::String> & currentFunctionParameters)\n{\n";

              gd::EventsCodeGenerationContext callerContext;
              {
                std::vector<gd::String> realObjects =
                    codeGenerator.ExpandObjectsName(
                        event.GetObjectsPassedAsArgument(), callerContext);
                for (std::size_t i = 0; i < realObjects.size(); ++i) {
                  callerContext.EmptyObjectsListNeeded(realObjects[i]);
                  functionCode += "std::vector<RuntimeObject*> " +
                                  ManObjListName(realObjects[i]) + ";\n";
                  functionCode +=
                      "if ( objectsListsMap[\"" + realObjects[i] +
                      "\"] != NULL ) " + ManObjListName(realObjects[i]) +
                      " = *objectsListsMap[\"" + realObjects[i] + "\"];\n";
                }
              }
              functionCode += "{";

              gd::EventsCodeGenerationContext context;
              context.InheritsFrom(callerContext);

              // Generating function body code
              gd::String conditionsCode =
                  codeGenerator.GenerateConditionsListCode(
                      event.GetConditions(), context);
              gd::String actionsCode = codeGenerator.GenerateActionsListCode(
                  event.GetActions(), context);
              gd::String subeventsCode = codeGenerator.GenerateEventsListCode(
                  event.GetSubEvents(), context);

              functionCode +=
                  codeGenerator.GenerateObjectsDeclarationCode(context);
              gd::String ifPredicat = "true";
              for (std::size_t i = 0; i < event.GetConditions().size(); ++i)
                ifPredicat += " && condition" + gd::String::From(i) + "IsTrue";

              functionCode += conditionsCode;
              functionCode += "if (" + ifPredicat + ")\n";
              functionCode += "{\n";
              functionCode += actionsCode;
              if (event.HasSubEvents())  // Sub events
              {
                functionCode += "\n{\n";
                functionCode += subeventsCode;
                functionCode += "}\n";
              }
              functionCode += "}\n";

              functionCode += "}\n";  // Context end
              functionCode += "}\n";  // Function end
              codeGenerator.AddCustomCodeOutsideMain(functionCode);

              return "";
            });

    AddStrExpression("Parameter",
                     _("Parameter of the current function"),
                     _("Return the text contained in a parameter of the "
                       "currently-launched function"),
                     _("Function"),
                     "res/function.png")
        .AddParameter("expression",
                      _("Index of the parameter (Parameters start at 0!)"))
        .codeExtraInformation.SetCustomCodeGenerator(
            [](const std::vector<gd::Expression>& parameters,
               gd::EventsCodeGenerator& codeGenerator,
               gd::EventsCodeGenerationContext& context) {
              codeGenerator.AddIncludeFile("Function/FunctionTools.h");

              // Ensure currentFunctionParameters vector is always existing.
              gd::String mainFakeParameters =
                  "std::vector<gd::String> currentFunctionParameters;\n";
              if (codeGenerator.GetCustomCodeInMain().find(
                      mainFakeParameters) == gd::String::npos)
                codeGenerator.AddCustomCodeInMain(mainFakeParameters);

              // Generate code for evaluating index
              gd::String expression =
                  gd::ExpressionCodeGenerator::GenerateExpressionCode(
                      codeGenerator,
                      context,
                      "number",
                      parameters[0].GetPlainString());

              gd::String code;

              code +=
                  "GDpriv::FunctionTools::GetSafelyStringFromVector("
                  "currentFunctionParameters, " +
                  expression + ")";

              return code;
            });
#endif

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new Extension;
}
