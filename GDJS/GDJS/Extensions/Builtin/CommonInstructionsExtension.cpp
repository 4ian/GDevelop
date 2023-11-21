/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "CommonInstructionsExtension.h"

#include <algorithm>
#include <set>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachChildVariableEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDJS/Events/Builtin/JsCodeEvent.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"

using namespace std;
using namespace gd;

namespace gdjs {

CommonInstructionsExtension::CommonInstructionsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsCommonInstructionsExtension(
      *this);

  GetAllConditions()["Toujours"].SetFunctionName(
      "gdjs.evtTools.common.logicalNegation");
  GetAllConditions()["BuiltinCommonInstructions::Always"].SetFunctionName(
      "gdjs.evtTools.common.logicalNegation");

  GetAllConditions()["Egal"].SetCustomCodeGenerator(
      [](gd::Instruction &instruction, gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &context) {
        gd::String value1Code =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameter(0).GetPlainString());

        gd::String operatorString = instruction.GetParameter(1).GetPlainString();

        gd::String value2Code =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameter(2).GetPlainString());

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue", context);

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() ? "!" : "") + "(" +
               codeGenerator.GenerateRelationalOperation(
                   operatorString, value1Code, value2Code) +
               ");\n";
      });
  GetAllConditions()["BuiltinCommonInstructions::CompareNumbers"]
      .codeExtraInformation = GetAllConditions()["Egal"].codeExtraInformation;

  GetAllConditions()["StrEqual"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String value1Code =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                instruction.GetParameter(0).GetPlainString());

        gd::String operatorString = instruction.GetParameter(1).GetPlainString();

        gd::String value2Code =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                instruction.GetParameter(2).GetPlainString());

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue", context);

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() ? "!" : "") + "(" +
               codeGenerator.GenerateRelationalOperation(
                   operatorString, value1Code, value2Code) +
               ");\n";
      });
  GetAllConditions()["BuiltinCommonInstructions::CompareStrings"]
      .codeExtraInformation =
      GetAllConditions()["StrEqual"].codeExtraInformation;

  GetAllEvents()["BuiltinCommonInstructions::Link"]
      .SetCodeGenerator([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& context) {
        return "/*Link should not have any generated code. You probably "
               "wrongly used a link in events without a layout.*/";
      })
      .SetPreprocessing([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsList& eventList,
                           unsigned int indexOfTheEventInThisList) {
        if (!codeGenerator.HasProjectAndLayout()) return;

        gd::LinkEvent& event = dynamic_cast<gd::LinkEvent&>(event_);
        event.ReplaceLinkByLinkedEvents(
            codeGenerator.GetProject(), eventList, indexOfTheEventInThisList);
      });

  GetAllEvents()["BuiltinCommonInstructions::Standard"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::StandardEvent& event = dynamic_cast<gd::StandardEvent&>(event_);

        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String ifPredicate =
            event.GetConditions().empty()
                ? ""
                : codeGenerator.GenerateBooleanFullName(
                      "isConditionTrue",
                      context);

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
        if (!ifPredicate.empty()) outputCode += "if (" + ifPredicate + ") ";
        outputCode += "{\n";
        outputCode += actionsDeclarationsCode;
        outputCode += actionsCode;
        outputCode += "}\n";

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::Comment"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        // If we do not add a code generator to the comments,
        // they will be stripped as considered as not implemented by the
        // platform.
        return "";
      });

  GetAllConditions()["BuiltinCommonInstructions::Or"]
      .SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& parentContext) {
            // Conditions code
            gd::String conditionsCode;
            gd::InstructionsList& conditions = instruction.GetSubInstructions();

            // The Or "return" true by setting the upper boolean to true.
            // So, it needs to be initialized to false.
            conditionsCode += codeGenerator.GenerateUpperScopeBooleanFullName(
                                    "isConditionTrue", parentContext) +
                                " = false;\n";
            //"OR" condition must declare objects list, but without picking the
            // objects from the scene. Lists are either empty or come from a
            // parent event.
            set<gd::String> emptyListsNeeded;
            for (unsigned int cId = 0; cId < conditions.size(); ++cId) {
              // Each condition inherits the context from the "Or" condition:
              // For example, two sub conditions using an object called
              // "MyObject" will both have to declare a "MyObject" object list.
              gd::EventsCodeGenerationContext context;
              context.InheritsFrom(parentContext);
              context.ForbidReuse();   // TODO: This may not be necessary (to be investigated/heavily tested).

              gd::String conditionCode = codeGenerator.GenerateConditionCode(
                  conditions[cId],
                  "isConditionTrue",
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
                  "if(" +
                  codeGenerator.GenerateBooleanFullName(
                      "isConditionTrue", context) +
                  ") {\n";
              conditionsCode += "    " +
                                codeGenerator.GenerateUpperScopeBooleanFullName(
                                    "isConditionTrue", context) +
                                " = true;\n";
              std::set<gd::String> objectsListsToBeDeclared =
                  context.GetAllObjectsToBeDeclared();
              for (set<gd::String>::iterator it =
                       objectsListsToBeDeclared.begin();
                   it != objectsListsToBeDeclared.end();
                   ++it) {
                emptyListsNeeded.insert(*it);
                gd::String objList =
                    codeGenerator.GetObjectListName(*it, context);
                gd::String finalObjList =
                    codeGenerator.GetCodeNamespaceAccessor() +
                    ManObjListName(*it) +
                    gd::String::From(parentContext.GetContextDepth()) + "_" +
                    gd::String::From(parentContext.GetCurrentConditionDepth()) +
                    "final";
                conditionsCode += "    for (let j = 0, jLen = " + objList +
                                  ".length; j < jLen ; ++j) {\n";
                conditionsCode += "        if ( " + finalObjList + ".indexOf(" +
                                  objList + "[j]) === -1 )\n";
                conditionsCode += "            " + finalObjList + ".push(" +
                                  objList + "[j]);\n";
                conditionsCode += "    }\n";
              }
              conditionsCode += "}\n";

              conditionsCode += "}\n";
            }

            gd::String declarationsCode;

            // Declarations code
            gd::String codeNamespace = codeGenerator.GetCodeNamespaceAccessor();
            for (set<gd::String>::iterator it = emptyListsNeeded.begin();
                 it != emptyListsNeeded.end();
                 ++it) {
              //"OR" condition must declare objects list, but without getting
              // the objects from the scene. Lists are either empty or come from
              // a parent event.
              parentContext.ObjectsListNeededOrEmptyIfJustDeclared(*it);
              // We need to duplicate the object lists : The "final" ones will
              // be filled with objects by conditions, but they will have no
              // incidence on further conditions, as conditions use "normal"
              // ones.
              gd::String finalObjList =
                  codeNamespace + ManObjListName(*it) +
                  gd::String::From(parentContext.GetContextDepth()) + "_" +
                  gd::String::From(parentContext.GetCurrentConditionDepth()) +
                  "final";
              codeGenerator.AddGlobalDeclaration(finalObjList + " = [];\n");
              declarationsCode += finalObjList + ".length = 0;\n";
            }
            declarationsCode += "let " +
                                codeGenerator.GenerateBooleanFullName(
                                    "isConditionTrue", parentContext) +
                                " = false;\n";

            // Generate code
            gd::String code;
            code += declarationsCode;
            code += conditionsCode;

            // When condition is finished, "final" objects lists become the
            // "normal" ones.
            code += "{\n";
            for (set<gd::String>::iterator it = emptyListsNeeded.begin();
                 it != emptyListsNeeded.end();
                 ++it) {
              gd::String finalObjList =
                  codeNamespace + ManObjListName(*it) +
                  gd::String::From(parentContext.GetContextDepth()) + "_" +
                  gd::String::From(parentContext.GetCurrentConditionDepth()) +
                  "final";
              code += "gdjs.copyArray(" + finalObjList + ", " +
                      codeGenerator.GetObjectListName(*it, parentContext) +
                      ");\n";
            }
            code += "}\n";

            return code;
          });

  GetAllConditions()["BuiltinCommonInstructions::And"]
      .SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& parentContext) {
            gd::String outputCode;

            outputCode += codeGenerator.GenerateConditionsListCode(
                instruction.GetSubInstructions(), parentContext);

            outputCode += codeGenerator.GenerateUpperScopeBooleanFullName(
                              "isConditionTrue", parentContext) +
                          " = " +
                          codeGenerator.GenerateBooleanFullName(
                              "isConditionTrue", parentContext) +
                          ";\n";

            return outputCode;
          });

  GetAllConditions()["BuiltinCommonInstructions::Not"]
      .SetCustomCodeGenerator(
          [](gd::Instruction &instruction,
             gd::EventsCodeGenerator &codeGenerator,
             gd::EventsCodeGenerationContext &parentContext) {
            gd::String outputCode;

            outputCode += codeGenerator.GenerateConditionsListCode(
                instruction.GetSubInstructions(), parentContext);

            outputCode += codeGenerator.GenerateUpperScopeBooleanFullName(
                              "isConditionTrue", parentContext) +
                          " = !" +
                          codeGenerator.GenerateBooleanFullName(
                              "isConditionTrue", parentContext) +
                          ";\n";
            ;

            return outputCode;
          });

  GetAllConditions()["BuiltinCommonInstructions::Once"]
      .SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& context) {
            size_t uniqueId = codeGenerator.GenerateSingleUsageUniqueIdFor(
                instruction.GetOriginalInstruction().lock().get());
            gd::String outputCode = codeGenerator.GenerateUpperScopeBooleanFullName(
                                        "isConditionTrue", context) +
                                    " = ";
            gd::String contextObjectName = codeGenerator.HasProjectAndLayout()
                                               ? "runtimeScene"
                                               : "eventsFunctionContext";
            outputCode += contextObjectName +
                          ".getOnceTriggers().triggerOnce(" +
                          gd::String::From(uniqueId) + ");\n";
            return outputCode;
          });

  GetAllEvents()["BuiltinCommonInstructions::While"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& parentContext) {
        gd::WhileEvent& event = dynamic_cast<gd::WhileEvent&>(event_);

        // Prevent code generation if the event is empty, as this would
        // get the game stuck in a never ending loop.
        if (event.GetWhileConditions().empty() &&
            event.GetConditions().empty() && event.GetActions().empty())
          return gd::String(
              "\n// While event not generated to prevent an infinite loop.\n");

        gd::String outputCode;

        // Context is "reset" each time the event is repeated (i.e. objects
        // are picked again)
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext);
        context.ForbidReuse();

        // Prepare codes
        gd::String whileConditionsStr =
            codeGenerator.GenerateConditionsListCode(event.GetWhileConditions(),
                                                     context);
        gd::String whileIfPredicate = "true";
        if (!event.GetWhileConditions().empty())
          whileIfPredicate =
              codeGenerator.GenerateBooleanFullName("isConditionTrue", context);

        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String actionsCode =
            codeGenerator.GenerateActionsListCode(event.GetActions(), context);
        gd::String ifPredicate = "true";
        if (!event.GetConditions().empty())
          ifPredicate =
              codeGenerator.GenerateBooleanFullName("isConditionTrue", context);

        // Write final code
        gd::String whileBoolean =
            codeGenerator.GenerateBooleanFullName("stopDoWhile", context);
        outputCode += "let " + whileBoolean + " = false;\n";
        outputCode += "do {\n";
        outputCode += codeGenerator.GenerateObjectsDeclarationCode(context);
        outputCode += whileConditionsStr;
        outputCode += "if (" + whileIfPredicate + ") {\n";
        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicate + ") {\n";
        outputCode += actionsCode;
        outputCode += "\n{ //Subevents: \n";
        // TODO: check (and heavily test) if sub events should be generated before
        // the call to GenerateObjectsDeclarationCode.
        outputCode +=
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
        outputCode += "} //Subevents end.\n";
        outputCode += "}\n";
        outputCode += "} else " + whileBoolean + " = true; \n";

        outputCode += "} while (!" + whileBoolean + ");\n";

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::ForEachChildVariable"]
      .SetCodeGenerator([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& parentContext) {
        gd::String outputCode;
        gd::ForEachChildVariableEvent& event =
            dynamic_cast<gd::ForEachChildVariableEvent&>(event_);

        // Context is "reset" each time the event is repeated (i.e. objects are
        // picked again)
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext);
        context.ForbidReuse();

        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String actionsCode =
            codeGenerator.GenerateActionsListCode(event.GetActions(), context);
        gd::String ifPredicate = event.GetConditions().empty()
                                    ? "true"
                                    : codeGenerator.GenerateBooleanFullName(
                                          "isConditionTrue", context);

        // Prepare object declaration and sub events
        gd::String subevents =
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
        gd::String objectDeclaration =
            codeGenerator.GenerateObjectsDeclarationCode(context) + "\n";

        // Write final code
        gd::String structureChildVariableName =
            "structureChildVariable" +
            gd::String::From(context.GetContextDepth());
        gd::String iterableReferenceVariableName =
            "iterableReference" + gd::String::From(context.GetContextDepth());
        gd::String iteratorKeyVariableName =
            "iteratorKey" + gd::String::From(context.GetContextDepth());

        bool valueIteratorExists =
            !event.GetValueIteratorVariableName().empty();
        bool keyIteratorExists = !event.GetKeyIteratorVariableName().empty();

        // clang-format off
        // Define references to variables (if they exist)
        if (keyIteratorExists)
          outputCode +=
              "const $KEY_ITERATOR_REFERENCE = "
              "$KEY_ITERATOR_VARIABLE_ACCESSOR;\n";
        if (valueIteratorExists)
          outputCode +=
              "const $VALUE_ITERATOR_REFERENCE = "
              "$VALUE_ITERATOR_VARIABLE_ACCESSOR;\n";
        outputCode +=
            "const $ITERABLE_REFERENCE = $ITERABLE_VARIABLE_ACCESSOR;\n";

        // Do not execute the loop on non iterables
        outputCode += "if(!$ITERABLE_REFERENCE.isPrimitive()) {\n";

        // Begin the for loop
        outputCode +=
            "for(\n"
            "    const $ITERATOR_KEY in \n"
            "    $ITERABLE_REFERENCE.getType() === \"structure\"\n"
            "      ? $ITERABLE_REFERENCE.getAllChildren()\n"
            "      : $ITERABLE_REFERENCE.getType() === \"array\"\n"
            "        ? $ITERABLE_REFERENCE.getAllChildrenArray()\n"
            "        : []\n"
            ") {\n";

        // If variables are defined, store the value in them
        if (keyIteratorExists)
          outputCode +=
              "    if($ITERABLE_REFERENCE.getType() === \"structure\")\n"
              "        $KEY_ITERATOR_REFERENCE.setString($ITERATOR_KEY);\n"
              "    else if($ITERABLE_REFERENCE.getType() === \"array\")\n"
              "        $KEY_ITERATOR_REFERENCE.setNumber($ITERATOR_KEY);\n";

        if(valueIteratorExists) outputCode +=
            "    const $STRUCTURE_CHILD_VARIABLE = $ITERABLE_REFERENCE.getChild($ITERATOR_KEY)\n"
            "    $VALUE_ITERATOR_REFERENCE.castTo($STRUCTURE_CHILD_VARIABLE.getType())\n"
            "    if($STRUCTURE_CHILD_VARIABLE.isPrimitive()) {\n"
            "        $VALUE_ITERATOR_REFERENCE.setValue($STRUCTURE_CHILD_VARIABLE.getValue());\n"
            "    } else if ($STRUCTURE_CHILD_VARIABLE.getType() === \"structure\") {\n"
            "        // Structures are passed by reference like JS objects\n"
            "        $VALUE_ITERATOR_REFERENCE.replaceChildren($STRUCTURE_CHILD_VARIABLE.getAllChildren());\n"
            "    } else if ($STRUCTURE_CHILD_VARIABLE.getType() === \"array\") {\n"
            "        // Arrays are passed by reference like JS objects\n"
            "        $VALUE_ITERATOR_REFERENCE.replaceChildrenArray($STRUCTURE_CHILD_VARIABLE.getAllChildrenArray());\n"
            "    } else console.warn(\"Cannot identify type: \", type);\n";
        // clang-format on

        // Now do the rest of standard event code generation
        outputCode += objectDeclaration;
        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicate + ")\n";
        outputCode += "{\n";
        outputCode += actionsCode;
        if (event.HasSubEvents()) {
          outputCode += "\n{ //Subevents: \n";
          outputCode += subevents;
          outputCode += "} //Subevents end.\n";
        }
        outputCode += "}\n";
        // End of standard event code generation

        // End the for loop
        outputCode += "}\n";

        // End the condition block
        outputCode += "}\n";

        if (valueIteratorExists) {
          gd::String iteratorReferenceVariableName =
              "valueIteratorReference" +
              gd::String::From(context.GetContextDepth());
          outputCode =
              outputCode
                  .FindAndReplace(
                      "$VALUE_ITERATOR_VARIABLE_ACCESSOR",
                      gd::ExpressionCodeGenerator::GenerateExpressionCode(
                          codeGenerator,
                          context,
                          "scenevar",
                          event.GetValueIteratorVariableName()))
                  .FindAndReplace("$VALUE_ITERATOR_REFERENCE",
                                  iteratorReferenceVariableName);
        }

        if (keyIteratorExists) {
          gd::String iteratorReferenceVariableName =
              "keyIteratorReference" +
              gd::String::From(context.GetContextDepth());
          outputCode =
              outputCode
                  .FindAndReplace(
                      "$KEY_ITERATOR_VARIABLE_ACCESSOR",
                      gd::ExpressionCodeGenerator::GenerateExpressionCode(
                          codeGenerator,
                          context,
                          "scenevar",
                          event.GetKeyIteratorVariableName()))
                  .FindAndReplace("$KEY_ITERATOR_REFERENCE",
                                  iteratorReferenceVariableName);
        }
        return outputCode
            .FindAndReplace("$ITERATOR_KEY", iteratorKeyVariableName)
            .FindAndReplace("$STRUCTURE_CHILD_VARIABLE",
                            structureChildVariableName)
            .FindAndReplace("$ITERABLE_REFERENCE",
                            iterableReferenceVariableName)
            .FindAndReplace("$ITERABLE_VARIABLE_ACCESSOR",
                            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                                codeGenerator,
                                context,
                                "scenevar",
                                event.GetIterableVariableName()));
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
        gd::String ifPredicate = "true";
        if (!event.GetConditions().empty())
          ifPredicate =
              codeGenerator.GenerateBooleanFullName("isConditionTrue", context);

        // Prepare object declaration and sub events
        gd::String subevents =
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
        gd::String objectDeclaration =
            codeGenerator.GenerateObjectsDeclarationCode(context) + "\n";

        // Write final code
        gd::String repeatCountVar =
            "repeatCount" + gd::String::From(context.GetContextDepth());
        gd::String repeatIndexVar =
            "repeatIndex" + gd::String::From(context.GetContextDepth());
        outputCode += "const " + repeatCountVar + " = " + repeatCountCode + ";\n";
        outputCode += "for (let " + repeatIndexVar + " = 0;" + repeatIndexVar +
                      " < " + repeatCountVar + ";++" + repeatIndexVar + ") {\n";
        outputCode += objectDeclaration;
        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicate + ")\n";
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

        std::vector<gd::String> realObjects = codeGenerator.GetObjectsContainersList().ExpandObjectName(
            event.GetObjectToPick(), parentContext.GetCurrentObject());

        if (realObjects.empty()) return gd::String("");
        for (unsigned int i = 0; i < realObjects.size(); ++i)
          parentContext.ObjectsListNeeded(realObjects[i]);

        // Context is "reset" each time the event is repeated (i.e. objects are
        // picked again)
        gd::EventsCodeGenerationContext context;
        context.InheritsFrom(parentContext);
        context.ForbidReuse(); // TODO: This may not be necessary (to be investigated/heavily tested).

        for (unsigned int i = 0; i < realObjects.size(); ++i)
          context.EmptyObjectsListNeeded(realObjects[i]);

        // Prepare conditions/actions codes
        gd::String conditionsCode = codeGenerator.GenerateConditionsListCode(
            event.GetConditions(), context);
        gd::String actionsCode =
            codeGenerator.GenerateActionsListCode(event.GetActions(), context);
        gd::String ifPredicate = "true";
        if (!event.GetConditions().empty())
          ifPredicate =
              codeGenerator.GenerateBooleanFullName("isConditionTrue", context);

        // Prepare object declaration and sub events
        gd::String subevents =
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);

        gd::String objectDeclaration =
            codeGenerator.GenerateObjectsDeclarationCode(context) + "\n";

        gd::String forEachTotalCountVar =
            codeGenerator.GetCodeNamespaceAccessor() + "forEachTotalCount" +
            gd::String::From(context.GetContextDepth());
        codeGenerator.AddGlobalDeclaration(forEachTotalCountVar + " = 0;\n");
        gd::String forEachIndexVar =
            codeGenerator.GetCodeNamespaceAccessor() + "forEachIndex" +
            gd::String::From(context.GetContextDepth());
        codeGenerator.AddGlobalDeclaration(forEachIndexVar + " = 0;\n");
        gd::String forEachObjectsList =
            codeGenerator.GetCodeNamespaceAccessor() + "forEachObjects" +
            gd::String::From(context.GetContextDepth());
        codeGenerator.AddGlobalDeclaration(forEachObjectsList + " = [];\n");

        if (realObjects.size() !=
            1)  //(We write a slightly more simple ( and optimized ) output code
                // when only one object list is used.)
        {
          outputCode += forEachTotalCountVar + " = 0;\n";
          outputCode += forEachObjectsList + ".length = 0;\n";
          for (unsigned int i = 0; i < realObjects.size(); ++i) {
            gd::String forEachCountVar =
                codeGenerator.GetCodeNamespaceAccessor() + "forEachCount" +
                gd::String::From(i) + "_" +
                gd::String::From(context.GetContextDepth());
            codeGenerator.AddGlobalDeclaration(forEachCountVar + " = 0;\n");

            outputCode +=
                forEachCountVar + " = " +
                codeGenerator.GetObjectListName(realObjects[i], parentContext) +
                ".length;\n";
            outputCode +=
                forEachTotalCountVar + " += " + forEachCountVar + ";\n";
            outputCode +=
                forEachObjectsList + ".push.apply(" + forEachObjectsList + "," +
                codeGenerator.GetObjectListName(realObjects[i], parentContext) +
                ");\n";
          }
        }

        // Write final code :

        // For loop declaration
        if (realObjects.size() ==
            1)  // We write a slightly more simple ( and optimized ) output code
                // when only one object list is used.
          outputCode +=
              "for (" + forEachIndexVar + " = 0;" + forEachIndexVar + " < " +
              codeGenerator.GetObjectListName(realObjects[0], parentContext) +
              ".length;++" + forEachIndexVar + ") {\n";
        else
          outputCode += "for (" + forEachIndexVar + " = 0;" + forEachIndexVar +
                        " < " + forEachTotalCountVar + ";++" + forEachIndexVar +
                        ") {\n";

        // Empty object lists declaration
        outputCode += objectDeclaration;

        // Pick one object
        if (realObjects.size() == 1) {
          // We write a slightly more simple ( and optimized ) output code
          // when only one object list is used.
          gd::String temporary = codeGenerator.GetCodeNamespaceAccessor() +
                                 "forEachTemporary" +
                                 gd::String::From(context.GetContextDepth());
          codeGenerator.AddGlobalDeclaration(temporary + " = null;\n");
          outputCode +=
              temporary + " = " +
              codeGenerator.GetObjectListName(realObjects[0], parentContext) +
              "[" + forEachIndexVar + "];\n";

          outputCode +=
              codeGenerator.GetObjectListName(realObjects[0], context) +
              ".push(" + temporary + ");\n";
        } else {
          // Generate the code to pick only one object in the lists
          for (unsigned int i = 0; i < realObjects.size(); ++i) {
            gd::String count;
            for (unsigned int j = 0; j <= i; ++j) {
              gd::String forEachCountVar =
                  codeGenerator.GetCodeNamespaceAccessor() + "forEachCount" +
                  gd::String::From(j) + "_" +
                  gd::String::From(context.GetContextDepth());

              if (j != 0) count += "+";
              count += forEachCountVar;
            }

            if (i != 0) outputCode += "else ";
            outputCode += "if (" + forEachIndexVar + " < " + count + ") {\n";
            outputCode +=
                "    " +
                codeGenerator.GetObjectListName(realObjects[i], context) +
                ".push(" + forEachObjectsList + "[" + forEachIndexVar + "]);\n";
            outputCode += "}\n";
          }
        }

        outputCode += conditionsCode;
        outputCode += "if (" + ifPredicate + ") {\n";
        outputCode += actionsCode;
        if (event.HasSubEvents()) {
          outputCode += "\n{ //Subevents: \n";
          outputCode += subevents;
          outputCode += "} //Subevents end.\n";
        }
        outputCode += "}\n";

        outputCode += "}\n";  // End of for loop

        return outputCode;
      });

  GetAllEvents()["BuiltinCommonInstructions::Group"].SetCodeGenerator(
      [](gd::BaseEvent& event_,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String outputCode;
        gd::GroupEvent& event = dynamic_cast<gd::GroupEvent&>(event_);

        outputCode +=
            codeGenerator.GenerateProfilerSectionBegin(event.GetName());
        outputCode +=
            codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
        outputCode += codeGenerator.GenerateProfilerSectionEnd(event.GetName());

        return outputCode;
      });

  AddEvent("JsCode",
           _("Javascript code"),
           _("Insert some Javascript code into events"),
           "",
           "res/source_cpp16.png",
           std::shared_ptr<gd::BaseEvent>(new JsCodeEvent))
      .SetCodeGenerator([](gd::BaseEvent& event_,
                           gd::EventsCodeGenerator& codeGenerator,
                           gd::EventsCodeGenerationContext& parentContext) {
        JsCodeEvent& event = dynamic_cast<JsCodeEvent&>(event_);

        gd::String functionName = codeGenerator.GetCodeNamespaceAccessor() +
                                  "userFunc" + gd::String::From(&event);
        gd::String functionParameters = "runtimeScene";
        gd::String callArguments = "runtimeScene";
        if (!event.GetParameterObjects().empty()) {
          functionParameters += ", objects";
          callArguments += ", objects";
        }
        if (!codeGenerator.HasProjectAndLayout()) {
          functionParameters += ", eventsFunctionContext";
          callArguments +=
              ", typeof eventsFunctionContext !== \'undefined\' ? "
              "eventsFunctionContext : undefined";
        }

        // Generate the function code
        gd::String functionCode;
        functionCode +=
            functionName + " = function GDJSInlineCode(" + functionParameters + ") {\n";
        functionCode += event.IsUseStrict() ? "\"use strict\";\n" : "";
        functionCode += event.GetInlineCode();
        functionCode += "\n};\n";
        codeGenerator.AddCustomCodeOutsideMain(functionCode);

        // Generate the code to call the function
        gd::String callingCode;
        if (!event.GetParameterObjects().empty()) {
          std::vector<gd::String> realObjects = codeGenerator.GetObjectsContainersList().ExpandObjectName(
              event.GetParameterObjects(), parentContext.GetCurrentObject());

          callingCode += "var objects = [];\n";
          for (unsigned int i = 0; i < realObjects.size(); ++i) {
            parentContext.ObjectsListNeeded(realObjects[i]);
            callingCode +=
                "objects.push.apply(objects," +
                codeGenerator.GetObjectListName(realObjects[i], parentContext) +
                ");\n";
          }
        }

        callingCode += functionName + "(" + callArguments + ");\n";
        return callingCode;
      });
}

}  // namespace gdjs
