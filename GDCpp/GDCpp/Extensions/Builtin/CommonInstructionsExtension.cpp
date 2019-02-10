/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include <algorithm>
#include <set>
#include <string>
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Event.h"
#endif
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/DependenciesAnalyzer.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/Project.h"
#include "GDCpp/Events/Builtin/CppCodeEvent.h"
#include "GDCpp/Extensions/Builtin/CommonInstructionsExtension.h"
#include "GDCpp/Extensions/Builtin/CommonInstructionsTools.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/CommonTools.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/CommonInstructionsExtension.cpp"
#endif

using namespace std;

CommonInstructionsExtension::CommonInstructionsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsCommonInstructionsExtension(
      *this);

#if defined(GD_IDE_ONLY)
  GetAllConditions()["BuiltinCommonInstructions::Or"]
      .codeExtraInformation.SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& parentContext) {
            // Conditions code
            gd::String conditionsCode;
            gd::InstructionsList& conditions = instruction.GetSubInstructions();

            //"OR" condition must declare objects list, but without picking the
            // objects from the scene. Lists are either empty or come from a
            // parent event.
            set<gd::String> emptyListsNeeded;
            for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
              // Each condition inherits the context from the "Or" condition:
              // For example, two sub conditions using an object called
              // "MyObject" will both have to declare a "MyObject" object list.
              gd::EventsCodeGenerationContext context;
              context.InheritsFrom(parentContext);
              context.ForbidReuse();  // TODO: This may not be necessary

              gd::String conditionCode = codeGenerator.GenerateConditionCode(
                  conditions[cId],
                  "condition" + gd::String::From(cId) + "IsTrue",
                  context);

              conditionsCode += "{\n";

              // Create new objects lists and generate condition
              conditionsCode +=
                  codeGenerator.GenerateObjectsDeclarationCode(context);
              if (!conditions[cId].GetType().empty())
                conditionsCode += conditionCode;

              // If the condition is true : merge all objects picked in the
              // final object lists.
              conditionsCode +=
                  "if( condition" + gd::String::From(cId) + "IsTrue ) {\n";
              conditionsCode += "    conditionTrue = true;\n";
              std::set<gd::String> objectsListsToBeDeclared =
                  context.GetAllObjectsToBeDeclared();
              for (set<gd::String>::iterator it =
                       objectsListsToBeDeclared.begin();
                   it != objectsListsToBeDeclared.end();
                   ++it) {
                emptyListsNeeded.insert(*it);
                conditionsCode += "    for(std::size_t i = 0;i<" +
                                  ManObjListName(*it) + ".size();++i)\n";
                conditionsCode += "    {\n";
                conditionsCode += "        if ( find(" + ManObjListName(*it) +
                                  "final.begin(), " + ManObjListName(*it) +
                                  "final.end(), " + ManObjListName(*it) +
                                  "[i]) == " + ManObjListName(*it) +
                                  "final.end())\n";
                conditionsCode += "            " + ManObjListName(*it) +
                                  "final.push_back(" + ManObjListName(*it) +
                                  "[i]);\n";
                conditionsCode += "    }\n";
              }
              conditionsCode += "}\n";

              conditionsCode += "}\n";
            }

            gd::String declarationsCode;

            // Declarations code
            for (set<gd::String>::iterator it = emptyListsNeeded.begin();
                 it != emptyListsNeeded.end();
                 ++it) {
              //"OR" condition must declare objects list, but without getting
              // the objects from the scene. Lists are either empty or come from
              // a parent event.
              parentContext.EmptyObjectsListNeeded(*it);
              // We need to duplicate the object lists : The "final" ones will
              // be filled with objects by conditions, but they will have no
              // incidence on further conditions, as conditions use "normal"
              // ones.
              declarationsCode += "std::vector<RuntimeObject*> " +
                                  ManObjListName(*it) + "final;\n";
            }
            for (std::size_t i = 0; i < conditions.size(); ++i)
              declarationsCode +=
                  "bool condition" + gd::String::From(i) + "IsTrue = false;\n";

            // Generate code
            gd::String code;
            code += declarationsCode;
            code += conditionsCode;

            // When condition is finished, "final" objects lists become the
            // "normal" ones.
            code += "{\n";
            for (set<gd::String>::iterator it = emptyListsNeeded.begin();
                 it != emptyListsNeeded.end();
                 ++it)
              code += ManObjListName(*it) + " = " + ManObjListName(*it) +
                      "final;\n";
            code += "}\n";

            return code;
          });

  GetAllConditions()["BuiltinCommonInstructions::And"]
      .codeExtraInformation.SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& parentContext) {
            gd::String outputCode;

            outputCode += codeGenerator.GenerateConditionsListCode(
                instruction.GetSubInstructions(), parentContext);

            gd::String ifPredicat = "true";
            for (std::size_t i = 0; i < instruction.GetSubInstructions().size();
                 ++i)
              ifPredicat += " && condition" + gd::String::From(i) + "IsTrue";

            outputCode += "conditionTrue = (" + ifPredicat + ");\n";

            return outputCode;
          });

  GetAllConditions()["BuiltinCommonInstructions::Not"]
      .codeExtraInformation.SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& parentContext) {
            gd::InstructionsList& conditions = instruction.GetSubInstructions();
            gd::String outputCode;

            for (std::size_t i = 0; i < conditions.size(); ++i)
              outputCode +=
                  "bool condition" + gd::String::From(i) + "IsTrue = false;\n";

            for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
              gd::String conditionCode = codeGenerator.GenerateConditionCode(
                  conditions[cId],
                  "condition" + gd::String::From(cId) + "IsTrue",
                  parentContext);

              if (!conditions[cId].GetType().empty()) {
                for (std::size_t i = 0; i < cId;
                     ++i)  // Skip conditions if one condition is true. //TODO :
                           // Can be optimized
                {
                  if (i == 0)
                    outputCode += "if ( ";
                  else
                    outputCode += " && ";
                  outputCode += "!condition" + gd::String::From(i) + "IsTrue";
                  if (i == cId - 1) outputCode += ") ";
                }

                outputCode += "{\n" + conditionCode + "}\n";
              }
            }

            gd::String ifPredicat = "true";
            for (std::size_t i = 0; i < conditions.size(); ++i)
              ifPredicat += " && !condition" + gd::String::From(i) + "IsTrue";

            outputCode += "conditionTrue = (" + ifPredicat + ");\n";

            return outputCode;
          });

  GetAllConditions()["BuiltinCommonInstructions::Once"]
      .codeExtraInformation.SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& parentContext) {
            size_t uniqueId = (size_t)&instruction;
            return "conditionTrue = runtimeContext->TriggerOnce(" +
                   gd::String::From(uniqueId) + ");\n";
          });

  GetAllEvents()["BuiltinCommonInstructions::Standard"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::StandardEvent& event = dynamic_cast<gd::StandardEvent&>(event_);

        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String ifPredicat;
        for (std::size_t i = 0; i < event.GetConditions().size(); ++i) {
          if (i != 0) ifPredicat += " && ";
          ifPredicat += "condition" + gd::String::From(i) + "IsTrue";
        }

        gd::EventsCodeGenerationContext actionsContext;
        actionsContext.Reuse(context);
        gd::String actionsCode = codeGenerator.GenerateActionsListCode(
            event.GetActions(), actionsContext);
        if (event.HasSubEvents())  // Sub events
        {
          actionsCode += "\n{ //Subevents\n";
          actionsCode += codeGenerator.GenerateEventsListCode(
              event.GetSubEvents(), actionsContext);
          actionsCode += "} //End of subevents\n";
        }
        gd::String actionsDeclarationsCode =
            codeGenerator.GenerateObjectsDeclarationCode(actionsContext);

        gd::String outputCode;
        outputCode += conditionsCode;
        if (!ifPredicat.empty()) outputCode += "if (" + ifPredicat + ")\n";
        outputCode += "{\n";
        outputCode += actionsDeclarationsCode;
        outputCode += actionsCode;
        outputCode += "}\n";

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::Link"]
      .SetCodeGenerator([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& context) {
        if (!codeGenerator.HasProjectAndLayout()) {
          return gd::String(
              "/*Link not supported when generating code without a layout*/");
        };
        gd::LinkEvent& event = dynamic_cast<gd::LinkEvent&>(event_);

        // This function is called only when the link refers to external events
        // compiled separately (see below). We must generate code to call these
        // external events.
        gd::String outputCode;

        gd::String functionCall =
            EventsCodeNameMangler::Get()->GetExternalEventsFunctionMangledName(
                event.GetTarget()) +
            "(runtimeContext);";
        gd::String functionDeclaration =
            "void " +
            EventsCodeNameMangler::Get()->GetExternalEventsFunctionMangledName(
                event.GetTarget()) +
            "(RuntimeContext * context);";
        outputCode += functionCall + "\n";
        codeGenerator.AddGlobalDeclaration(functionDeclaration);

        return outputCode;
      })
      .SetPreprocessing([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsList& eventList,
                           std::size_t indexOfTheEventInThisList) {
        if (!codeGenerator.HasProjectAndLayout()) return;

        gd::LinkEvent& event = dynamic_cast<gd::LinkEvent&>(event_);
        gd::Project& project = codeGenerator.GetProject();
        const gd::Layout& scene = codeGenerator.GetLayout();

        // Find if the link refers to externals events...
        if (project.HasExternalEventsNamed(event.GetTarget()) &&
            event.GetIncludeConfig() == gd::LinkEvent::INCLUDE_ALL) {
          gd::ExternalEvents& linkedExternalEvents =
              project.GetExternalEvents(event.GetTarget());

          //...and check if the external events can be compiled separately
          DependenciesAnalyzer analyzer(project, linkedExternalEvents);
          if (analyzer.ExternalEventsCanBeCompiledForAScene() ==
              scene.GetName())  // Check if the link refers to events
          {                     // compiled separately.
            // There is nothing more to do for now:
            // The code calling the external events will be generated during
            // code generation (see above)
            return;
          }
        }

        // If the link does not refers to separately compiled external events,
        // just replace it by the linked events.
        event.ReplaceLinkByLinkedEvents(
            codeGenerator.GetProject(), eventList, indexOfTheEventInThisList);
      });

  GetAllEvents()["BuiltinCommonInstructions::While"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& parentContext) {
        gd::String outputCode;
        gd::WhileEvent& event = dynamic_cast<gd::WhileEvent&>(event_);

        // Context is "reset" each time the event is repeated (i.e. objects are
        // picked again)
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext);
        context.ForbidReuse();
        if (event.HasInfiniteLoopWarning() &&
            !codeGenerator.GenerateCodeForRuntime())
          codeGenerator.AddIncludeFile(
              "GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

        // Prepare codes
        gd::String whileConditionsStr =
            codeGenerator.GenerateConditionsListCode(event.GetWhileConditions(),
                                                     context);
        gd::String whileIfPredicat = "true";
        for (std::size_t i = 0; i < event.GetWhileConditions().size(); ++i)
          whileIfPredicat += " && condition" + gd::String::From(i) + "IsTrue";
        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String actionsCode =
            codeGenerator.GenerateActionsListCode(event.GetActions(), context);
        gd::String ifPredicat = "true";
        for (std::size_t i = 0; i < event.GetConditions().size(); ++i)
          ifPredicat += " && condition" + gd::String::From(i) + "IsTrue";

        // Write final code
        outputCode += "bool stopDoWhile = false;";
        if (event.HasInfiniteLoopWarning() &&
            !codeGenerator.GenerateCodeForRuntime())
          outputCode += "std::size_t loopCount = 0;";
        outputCode += "do";
        outputCode += "{\n";
        outputCode += codeGenerator.GenerateObjectsDeclarationCode(context);
        outputCode += whileConditionsStr;
        outputCode += "if (" + whileIfPredicat + ")\n";
        outputCode += "{\n";
        if (event.HasInfiniteLoopWarning() &&
            !codeGenerator.GenerateCodeForRuntime()) {
          outputCode +=
              "if (loopCount == 100000) { if ( "
              "WarnAboutInfiniteLoop(*runtimeContext->scene) ) break; }\n";
          outputCode += "loopCount++;\n\n";
        }
        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicat + ")\n";
        outputCode += "{\n";
        outputCode += actionsCode;
        outputCode += "\n{ //Subevents: \n";
        outputCode +=
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
        outputCode += "} //Subevents end.\n";
        outputCode += "}\n";
        outputCode += "} else stopDoWhile = true; \n";

        outputCode += "} while ( !stopDoWhile );\n";

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::Repeat"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& parentContext) {
        gd::String outputCode;
        gd::RepeatEvent& event = dynamic_cast<gd::RepeatEvent&>(event_);

        gd::String repeatNumberExpression = event.GetRepeatExpression();

        // Prepare expression containing how many times event must be repeated
        gd::String repeatCountCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, parentContext, "number", repeatNumberExpression);

        // Context is "reset" each time the event is repeated (i.e. objects are
        // picked again)
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext);
        context.ForbidReuse();

        // Prepare conditions/actions codes
        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String actionsCode =
            codeGenerator.GenerateActionsListCode(event.GetActions(), context);
        gd::String ifPredicat = "true";
        for (std::size_t i = 0; i < event.GetConditions().size(); ++i)
          ifPredicat += " && condition" + gd::String::From(i) + "IsTrue";

        // Prepare object declaration and sub events
        gd::String subevents =
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
        gd::String objectDeclaration =
            codeGenerator.GenerateObjectsDeclarationCode(context) + "\n";

        // Write final code
        outputCode += "int repeatCount = " + repeatCountCode + ";\n";
        outputCode +=
            "for(std::size_t repeatIndex = 0;repeatIndex < "
            "repeatCount;++repeatIndex)\n";
        outputCode += "{\n";
        outputCode += objectDeclaration;
        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicat + ")\n";
        outputCode += "{\n";
        outputCode += actionsCode;
        if (event.HasSubEvents()) {
          outputCode += "\n{ //Subevents: \n";
          outputCode += subevents;
          outputCode += "} //Subevents end.\n";
        }
        outputCode += "}\n";

        outputCode += "}\n";

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::ForEach"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& parentContext) {
        gd::String outputCode;
        gd::ForEachEvent& event = dynamic_cast<gd::ForEachEvent&>(event_);

        std::vector<gd::String> realObjects = codeGenerator.ExpandObjectsName(
            event.GetObjectToPick(), parentContext);

        if (realObjects.empty()) return gd::String("");
        for (std::size_t i = 0; i < realObjects.size(); ++i)
          parentContext.ObjectsListNeeded(realObjects[i]);

        // Context is "reset" each time the event is repeated (i.e. objects are
        // picked again)
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext);
        context.ForbidReuse();

        // Prepare conditions/actions codes
        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String actionsCode =
            codeGenerator.GenerateActionsListCode(event.GetActions(), context);
        gd::String ifPredicat = "true";
        for (std::size_t i = 0; i < event.GetConditions().size(); ++i)
          ifPredicat += " && condition" + gd::String::From(i) + "IsTrue";

        // Prepare object declaration and sub events
        gd::String subevents =
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);

        gd::String objectDeclaration =
            codeGenerator.GenerateObjectsDeclarationCode(context) + "\n";

        if (realObjects.size() !=
            1)  //(We write a slighty more simple ( and optimized ) output code
                // when only one object list is used.)
        {
          outputCode += "std::size_t forEachTotalCount = 0;";
          outputCode += "std::vector<RuntimeObject*> forEachObjects;";
          for (std::size_t i = 0; i < realObjects.size(); ++i) {
            outputCode += "std::size_t forEachCount" + gd::String::From(i) +
                          " = " + ManObjListName(realObjects[i]) +
                          ".size(); forEachTotalCount += forEachCount" +
                          gd::String::From(i) + ";";
            outputCode += "forEachObjects.insert(" +
                          gd::String(i == 0 ? "forEachObjects.begin()"
                                            : "forEachObjects.end()") +
                          ", " + ManObjListName(realObjects[i]) + ".begin(), " +
                          ManObjListName(realObjects[i]) + ".end());";
          }
        }

        // Write final code :

        // For loop declaration
        if (realObjects.size() ==
            1)  // We write a slighty more simple ( and optimized ) output code
                // when only one object list is used.
          outputCode += "for(std::size_t forEachIndex = 0;forEachIndex < " +
                        ManObjListName(realObjects[0]) +
                        ".size();++forEachIndex)\n";
        else
          outputCode +=
              "for(std::size_t forEachIndex = 0;forEachIndex < "
              "forEachTotalCount;++forEachIndex)\n";

        outputCode += "{\n";

        // Clear all concerned objects lists and keep only one object
        if (realObjects.size() == 1) {
          outputCode +=
              "std::vector<RuntimeObject*> temporaryForEachList; "
              "temporaryForEachList.push_back(" +
              ManObjListName(realObjects[0]) + "[forEachIndex]);";
          outputCode += "std::vector<RuntimeObject*> " +
                        ManObjListName(realObjects[0]) +
                        " = temporaryForEachList;\n";
        } else {
          // Declare all lists of concerned objects empty
          for (std::size_t j = 0; j < realObjects.size(); ++j)
            outputCode += "std::vector<RuntimeObject*> " +
                          ManObjListName(realObjects[j]) + ";\n";

          for (std::size_t i = 0; i < realObjects.size();
               ++i)  // Pick then only one object
          {
            gd::String count;
            for (std::size_t j = 0; j <= i; ++j) {
              if (j != 0) count += "+";
              count += "forEachCount" + gd::String::From(j);
            }

            if (i != 0) outputCode += "else ";
            outputCode += "if (forEachIndex < " + count + ") {\n";
            outputCode += "    " + ManObjListName(realObjects[i]) +
                          ".push_back(forEachObjects[forEachIndex]);\n";
            outputCode += "}\n";
          }
        }

        outputCode += "{";  // This scope is used as the for loop modified the
                            // objects list.
        outputCode += objectDeclaration;

        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicat + ")\n";
        outputCode += "{\n";
        outputCode += actionsCode;
        if (event.HasSubEvents()) {
          outputCode += "\n{ //Subevents: \n";
          outputCode += subevents;
          outputCode += "} //Subevents end.\n";
        }
        outputCode += "}\n";

        outputCode += "}";

        outputCode += "}\n";  // End of for loop

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::Group"].SetCodeGenerator(
      [](gd::BaseEvent& event,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        return codeGenerator.GenerateEventsListCode(event.GetSubEvents(),
                                                    context);
      });

  AddEvent("CppCode",
           _("C++ code (Experimental)"),
           _("Execute C++ code"),
           "",
           "res/source_cpp16.png",
           std::shared_ptr<gd::BaseEvent>(new CppCodeEvent))
      .SetCodeGenerator([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& parentContext) {
        CppCodeEvent& event = dynamic_cast<CppCodeEvent&>(event_);

        // Note: The associated source file is compiled separately ( it is
        // recognized as a Source File dependency by DependenciesAnalyzer and
        // compiled by CodeCompilationHelpers);

        // Generate the code to call the associated source file
        gd::String functionPrototype =
            "void " + event.GetFunctionToCall() + "(" +
            (event.GetPassSceneAsParameter() ? "RuntimeScene & scene" : "") +
            ((event.GetPassSceneAsParameter() &&
              event.GetPassObjectListAsParameter())
                 ? ", "
                 : "") +
            (event.GetPassObjectListAsParameter()
                 ? "std::vector<RuntimeObject*> objectsList"
                 : "") +
            ");";
        codeGenerator.AddGlobalDeclaration(functionPrototype + "\n");

        gd::String outputCode;
        outputCode += "{";

        // Prepare objects list if needed
        if (event.GetPassObjectListAsParameter()) {
          std::vector<gd::String> realObjects = codeGenerator.ExpandObjectsName(
              event.GetObjectToPassAsParameter(), parentContext);

          outputCode += "std::vector<RuntimeObject*> functionObjects;";
          for (std::size_t i = 0; i < realObjects.size(); ++i) {
            parentContext.ObjectsListNeeded(realObjects[i]);
            outputCode += "functionObjects.insert(" +
                          gd::String(i == 0 ? "functionObjects.begin()"
                                            : "functionObjects.end()") +
                          ", " + ManObjListName(realObjects[i]) + ".begin(), " +
                          ManObjListName(realObjects[i]) + ".end());";
          }
        }

        gd::String functionCall =
            event.GetFunctionToCall() + "(" +
            (event.GetPassSceneAsParameter() ? "*runtimeContext->scene" : "") +
            ((event.GetPassSceneAsParameter() &&
              event.GetPassObjectListAsParameter())
                 ? ", "
                 : "") +
            (event.GetPassObjectListAsParameter() ? "functionObjects" : "") +
            ");";
        outputCode += "" + functionCall + "\n";

        outputCode += "}";
        return outputCode;
      });

  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "sfml-audio-2.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "sfml-graphics-2.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "sfml-network-2.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "sfml-window-2.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "sfml-system-2.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "libsndfile-1.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "openal32.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "mingwm10.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "libgcc_s_sjlj-1.dll"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Windows", "libstdc++-6.dll"));

  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libFLAC.so.8"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libfreetype.so.6"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libGLEW.so.1.5"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libGLEW.so.1.8"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libGLEW.so.1.10"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libopenal.so.0"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libopenal.so.1"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libsfml-audio.so.2"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libsfml-graphics.so.2"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libsfml-network.so.2"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libsfml-system.so.2"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libsfml-window.so.2"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Linux", "libsndfile.so.1"));

  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Mac", "libsfml-audio.2.0.dylib"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Mac", "libsfml-graphics.2.0.dylib"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Mac", "libsfml-network.2.0.dylib"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Mac", "libsfml-system.2.0.dylib"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Mac", "libsfml-window.2.0.dylib"));
  supplementaryRuntimeFiles.push_back(
      std::pair<gd::String, gd::String>("Mac", "sndfile"));
#endif
}
