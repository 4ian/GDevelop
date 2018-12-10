/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include <algorithm>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Metadata/EventMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/Extensions/JsPlatform.h"

using namespace std;

namespace gdjs {

gd::String EventsCodeGenerator::GenerateSceneEventsCompleteCode(
    gd::Project& project,
    const gd::Layout& scene,
    const gd::EventsList& events,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  // Prepare the global context
  unsigned int maxDepthLevelReached = 0;
  gd::EventsCodeGenerationContext context(&maxDepthLevelReached);
  EventsCodeGenerator codeGenerator(project, scene);

  // Generate whole events code
  // Preprocessing then code generation can make changes to the events, so we
  // need to do the work on a copy of the events.
  gd::EventsList generatedEvents = events;
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);
  codeGenerator.PreprocessEventList(generatedEvents);
  gd::String wholeEventsCode =
      codeGenerator.GenerateEventsListCode(generatedEvents, context);

  // Extra declarations needed by events
  gd::String globalDeclarations;
  for (auto& declaration : codeGenerator.GetCustomGlobalDeclaration())
    globalDeclarations += declaration + "\n";

  // Global objects lists
  auto allObjectsDeclarationsAndResets =
      codeGenerator.GenerateAllObjectsDeclarationsAndResets(
          maxDepthLevelReached);
  gd::String globalObjectLists = allObjectsDeclarationsAndResets.first;
  gd::String globalObjectListsReset = allObjectsDeclarationsAndResets.second;

  codeGenerator.AddAllObjectsIncludeFiles();

  // "Booleans" used by conditions
  gd::String globalConditionsBooleans =
      codeGenerator.GenerateAllConditionsBooleanDeclarations();

  gd::String output =
      codeGenerator.GetCodeNamespace() + " = {};\n" + globalDeclarations +
      globalObjectLists + "\n" + globalConditionsBooleans + "\n\n" +
      codeGenerator.GetCustomCodeOutsideMain() + "\n\n" +
      codeGenerator.GetCodeNamespaceAccessor() +
      "func = function(runtimeScene) {\n" +
      "runtimeScene.getOnceTriggers().startNewFrame();\n" +
      globalObjectListsReset + "\n" + codeGenerator.GetCustomCodeInMain() +
      wholeEventsCode + "\n" + "return;\n" + "}\n";

  // Export the symbols to avoid them being stripped by the Closure Compiler:
  output += "gdjs['" +
            gd::SceneNameMangler::GetMangledSceneName(scene.GetName()) +
            "Code']" + " = " + codeGenerator.GetCodeNamespace() + ";\n";

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateEventsFunctionCode(
    gd::Project& project,
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::ObjectsContainer objectsAndGroups;
  gd::ObjectsContainer
      emptyObjectsAndGroups;  // As opposed to layout events, we don't have
                              // objects in the "outer" scope.
  gd::ParameterMetadataTools::ParametersToObjectsContainer(
      project, eventsFunction.GetParameters(), objectsAndGroups);

  // Prepare the global context
  unsigned int maxDepthLevelReached = 0;
  gd::EventsCodeGenerationContext context(&maxDepthLevelReached);
  EventsCodeGenerator codeGenerator(emptyObjectsAndGroups, objectsAndGroups);

  // Generate whole events code
  // Preprocessing then code generation can make changes to the events, so we
  // need to do the work on a copy of the events.
  gd::EventsList generatedEvents = eventsFunction.GetEvents();
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.PreprocessEventList(generatedEvents);
  gd::String wholeEventsCode =
      codeGenerator.GenerateEventsListCode(generatedEvents, context);

  // Extra declarations needed by events
  gd::String globalDeclarations;
  for (auto& declaration : codeGenerator.GetCustomGlobalDeclaration())
    globalDeclarations += declaration + "\n";

  // Global objects lists
  auto allObjectsDeclarationsAndResets =
      codeGenerator.GenerateAllObjectsDeclarationsAndResets(
          maxDepthLevelReached);
  gd::String globalObjectLists = allObjectsDeclarationsAndResets.first;
  gd::String globalObjectListsReset = allObjectsDeclarationsAndResets.second;

  codeGenerator.AddAllObjectsIncludeFiles();

  // "Booleans" used by conditions
  gd::String globalConditionsBooleans =
      codeGenerator.GenerateAllConditionsBooleanDeclarations();

  gd::String output =
      codeGenerator.GetCodeNamespace() + " = {};\n" + globalDeclarations +
      globalObjectLists + "\n" + globalConditionsBooleans + "\n\n" +
      codeGenerator.GetCustomCodeOutsideMain() + "\n\n" +
      codeGenerator.GetCodeNamespaceAccessor() + "func = function(" +
      codeGenerator.GenerateEventsFunctionParameterDeclarationsList(
          eventsFunction.GetParameters()) +
      ") {\n" +
      codeGenerator.GenerateEventsFunctionContext(
          eventsFunction.GetParameters()) +
      "\n" + globalObjectListsReset + "\n" +
      codeGenerator.GetCustomCodeInMain() + wholeEventsCode + "\n" +
      codeGenerator.GenerateEventsFunctionReturn(eventsFunction) + "\n" + "}\n";

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateEventsFunctionParameterDeclarationsList(
    const vector<gd::ParameterMetadata>& parameters) {
  gd::String declaration = "runtimeScene";
  for (const auto& parameter : parameters) {
    declaration += ", " + (parameter.GetName().empty() ? "_" : parameter.GetName());
  }
  declaration += ", parentEventsFunctionContext";

  return declaration;
}

gd::String EventsCodeGenerator::GenerateEventsFunctionContext(
    const vector<gd::ParameterMetadata>& parameters) {
  gd::String objectsGetters;
  gd::String objectsCreators;
  gd::String argumentsGetters;
  for (const auto& parameter : parameters) {
    if (parameter.GetName().empty()) continue;

    if (gd::ParameterMetadata::IsObject(parameter.GetType())) {
      // Generate getter that will be used to get the lists of objects passed
      // as parameters
      objectsGetters +=
          "if (objectName === " + ConvertToStringExplicit(parameter.GetName()) +
          "&& !!" + parameter.GetName() + ") return gdjs.objectsListsToArray(" +
          parameter.GetName() + ");\n";

      // Generate creator functions that will be used to create new objects. We
      // need to check if the function was given the context of the calling
      // function (parentEventsFunctionContext). If this is the case, use it to
      // create the new object as the object names used in the function are not
      // the same as the objects available in the scene.
      gd::String objectNameCode = parameter.GetName() + ".firstKey()";
      objectsCreators +=
          "if (objectName === " + ConvertToStringExplicit(parameter.GetName()) +
          "&& !!" + parameter.GetName() +
          ") return parentEventsFunctionContext ? "
          "parentEventsFunctionContext.createObject(" +
          objectNameCode + ") : runtimeScene.createObject(" + objectNameCode +
          ");\n";
    } else {
      argumentsGetters +=
          "if (argName === " + ConvertToStringExplicit(parameter.GetName()) +
          ") return " + parameter.GetName() + ";\n";
    }
  }

  return gd::String("var eventsFunctionContext = {\n") +
         "  getObjects: function(objectName) {\n" + objectsGetters +
         "    return [];"
         "  },\n" +
         "  createObject: function(objectName) {\n" + objectsCreators +
         "    return null;\n" +
         "  },\n"
         "  getArgument: function(argName) {\n" +
         argumentsGetters + "    return \"\";\n" + "  }\n" + "};\n";
}

gd::String EventsCodeGenerator::GenerateEventsFunctionReturn(
    const gd::EventsFunction& eventsFunction) {
  if (eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
    return "return !!eventsFunctionContext.returnValue;";
  } else if (eventsFunction.GetFunctionType() ==
             gd::EventsFunction::Expression) {
    return "return Number(eventsFunctionContext.returnValue) || 0;";
  } else if (eventsFunction.GetFunctionType() ==
             gd::EventsFunction::StringExpression) {
    return "return \"\" + eventsFunctionContext.returnValue;";
  }

  return "return;";
}

std::pair<gd::String, gd::String>
EventsCodeGenerator::GenerateAllObjectsDeclarationsAndResets(
    unsigned int maxDepthLevelReached) {
  gd::String globalObjectLists;
  gd::String globalObjectListsReset;

  auto generateDeclarations =
      [this,
       &maxDepthLevelReached,
       &globalObjectLists,
       &globalObjectListsReset](const gd::Object& object) {
        // Generate declarations for the objects lists
        for (unsigned int j = 1; j <= maxDepthLevelReached; ++j) {
          globalObjectLists += GetCodeNamespaceAccessor() +
                               ManObjListName(object.GetName()) +
                               gd::String::From(j) + "= [];\n";
          globalObjectListsReset += GetCodeNamespaceAccessor() +
                                    ManObjListName(object.GetName()) +
                                    gd::String::From(j) + ".length = 0;\n";
        }
      };

  for (std::size_t i = 0; i < globalObjectsAndGroups.GetObjectsCount(); ++i)
    generateDeclarations(globalObjectsAndGroups.GetObject(i));

  for (std::size_t i = 0; i < objectsAndGroups.GetObjectsCount(); ++i)
    generateDeclarations(objectsAndGroups.GetObject(i));

  return std::make_pair(globalObjectLists, globalObjectListsReset);
}

void EventsCodeGenerator::AddAllObjectsIncludeFiles() {
  auto addIncludeFiles = [this](const gd::Object& object) {
    gd::String type = gd::GetTypeOfObject(
        GetGlobalObjectsAndGroups(), GetObjectsAndGroups(), object.GetName());

    // Ensure needed files are included for the object type and its behaviors.
    const gd::ObjectMetadata& metadata =
        gd::MetadataProvider::GetObjectMetadata(JsPlatform::Get(), type);
    AddIncludeFiles(metadata.includeFiles);

    std::vector<gd::String> behaviors = object.GetAllBehaviorNames();
    for (std::size_t j = 0; j < behaviors.size(); ++j) {
      const gd::BehaviorMetadata& metadata =
          gd::MetadataProvider::GetBehaviorMetadata(
              JsPlatform::Get(),
              object.GetBehavior(behaviors[j]).GetTypeName());
      AddIncludeFiles(metadata.includeFiles);
    }
  };

  for (std::size_t i = 0; i < globalObjectsAndGroups.GetObjectsCount(); ++i)
    addIncludeFiles(globalObjectsAndGroups.GetObject(i));

  for (std::size_t i = 0; i < objectsAndGroups.GetObjectsCount(); ++i)
    addIncludeFiles(objectsAndGroups.GetObject(i));
}

gd::String EventsCodeGenerator::GenerateAllConditionsBooleanDeclarations() {
  gd::String globalConditionsBooleans;
  for (unsigned int i = 0; i <= GetMaxCustomConditionsDepth(); ++i) {
    globalConditionsBooleans += GetCodeNamespaceAccessor() + "conditionTrue_" +
                                gd::String::From(i) + " = {val:false};\n";
    for (std::size_t j = 0; j <= GetMaxConditionsListsSize(); ++j) {
      globalConditionsBooleans += GetCodeNamespaceAccessor() + "condition" +
                                  gd::String::From(j) + "IsTrue_" +
                                  gd::String::From(i) + " = {val:false};\n";
    }
  }

  return globalConditionsBooleans;
}

gd::String EventsCodeGenerator::GenerateObjectFunctionCall(
    gd::String objectListName,
    const gd::ObjectMetadata& objMetadata,
    const gd::ExpressionCodeGenerationInformation& codeInfo,
    gd::String parametersStr,
    gd::String defaultOutput,
    gd::EventsCodeGenerationContext& context) {
  if (codeInfo.staticFunction)
    return "(" + codeInfo.functionCallName + "(" + parametersStr + "))";
  if (context.GetCurrentObject() == objectListName &&
      !context.GetCurrentObject().empty())
    return "(" + GetObjectListName(objectListName, context) + "[i]." +
           codeInfo.functionCallName + "(" + parametersStr + "))";
  else
    return "(( " + GetObjectListName(objectListName, context) +
           ".length === 0 ) ? " + defaultOutput + " :" +
           GetObjectListName(objectListName, context) + "[0]." +
           codeInfo.functionCallName + "(" + parametersStr + "))";
}

gd::String EventsCodeGenerator::GenerateObjectBehaviorFunctionCall(
    gd::String objectListName,
    gd::String behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const gd::ExpressionCodeGenerationInformation& codeInfo,
    gd::String parametersStr,
    gd::String defaultOutput,
    gd::EventsCodeGenerationContext& context) {
  if (codeInfo.staticFunction)
    return "(" + codeInfo.functionCallName + "(" + parametersStr + "))";
  if (context.GetCurrentObject() == objectListName &&
      !context.GetCurrentObject().empty())
    return "(" + GetObjectListName(objectListName, context) +
           "[i].getBehavior(\"" + behaviorName + "\")." +
           codeInfo.functionCallName + "(" + parametersStr + "))";
  else
    return "(( " + GetObjectListName(objectListName, context) +
           ".length === 0 ) ? " + defaultOutput + " :" +
           GetObjectListName(objectListName, context) + "[0].getBehavior(\"" +
           behaviorName + "\")." + codeInfo.functionCallName + "(" +
           parametersStr + "))";
}

gd::String EventsCodeGenerator::GenerateFreeCondition(
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    const gd::String& returnBoolean,
    bool conditionInverted,
    gd::EventsCodeGenerationContext& context) {
  // Generate call
  gd::String predicat;
  if (instrInfos.codeExtraInformation.type == "number" ||
      instrInfos.codeExtraInformation.type == "string") {
    predicat = GenerateRelationalOperatorCall(
        instrInfos,
        arguments,
        instrInfos.codeExtraInformation.functionCallName);
  } else {
    predicat = instrInfos.codeExtraInformation.functionCallName + "(" +
               GenerateArgumentsList(arguments) + ")";
  }

  // Add logical not if needed
  bool conditionAlreadyTakeCareOfInversion = false;
  for (std::size_t i = 0; i < instrInfos.parameters.size();
       ++i)  // Some conditions already have a "conditionInverted" parameter
  {
    if (instrInfos.parameters[i].type == "conditionInverted")
      conditionAlreadyTakeCareOfInversion = true;
  }
  if (!conditionAlreadyTakeCareOfInversion && conditionInverted)
    predicat = GenerateNegatedPredicat(predicat);

  // Generate condition code
  return GenerateBooleanFullName(returnBoolean, context) +
         ".val = " + predicat + ";\n";
}

gd::String EventsCodeGenerator::GenerateObjectCondition(
    const gd::String& objectName,
    const gd::ObjectMetadata& objInfo,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    const gd::String& returnBoolean,
    bool conditionInverted,
    gd::EventsCodeGenerationContext& context) {
  gd::String conditionCode;

  // Prepare call
  gd::String objectFunctionCallNamePart =
      GetObjectListName(objectName, context) + "[i]." +
      instrInfos.codeExtraInformation.functionCallName;

  // Create call
  gd::String predicat;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    predicat = GenerateRelationalOperatorCall(
        instrInfos, arguments, objectFunctionCallNamePart, 1);
  } else {
    predicat = objectFunctionCallNamePart + "(" +
               GenerateArgumentsList(arguments, 1) + ")";
  }
  if (conditionInverted) predicat = GenerateNegatedPredicat(predicat);

  // Generate whole condition code
  conditionCode +=
      "for(var i = 0, k = 0, l = " + GetObjectListName(objectName, context) +
      ".length;i<l;++i) {\n";
  conditionCode += "    if ( " + predicat + " ) {\n";
  conditionCode += "        " +
                   GenerateBooleanFullName(returnBoolean, context) +
                   ".val = true;\n";
  conditionCode += "        " + GetObjectListName(objectName, context) +
                   "[k] = " + GetObjectListName(objectName, context) + "[i];\n";
  conditionCode += "        ++k;\n";
  conditionCode += "    }\n";
  conditionCode += "}\n";
  conditionCode += GetObjectListName(objectName, context) + ".length = k;";

  return conditionCode;
}

gd::String EventsCodeGenerator::GenerateBehaviorCondition(
    const gd::String& objectName,
    const gd::String& behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    const gd::String& returnBoolean,
    bool conditionInverted,
    gd::EventsCodeGenerationContext& context) {
  gd::String conditionCode;

  // Prepare call
  gd::String objectFunctionCallNamePart =
      GetObjectListName(objectName, context) + "[i].getBehavior(\"" +
      behaviorName + "\")." + instrInfos.codeExtraInformation.functionCallName;

  // Create call
  gd::String predicat;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    predicat = GenerateRelationalOperatorCall(
        instrInfos, arguments, objectFunctionCallNamePart, 2);
  } else {
    predicat = objectFunctionCallNamePart + "(" +
               GenerateArgumentsList(arguments, 2) + ")";
  }
  if (conditionInverted) predicat = GenerateNegatedPredicat(predicat);

  // Verify that object has behavior.
  vector<gd::String> behaviors = gd::GetBehaviorsOfObject(
      globalObjectsAndGroups, objectsAndGroups, objectName);
  if (find(behaviors.begin(), behaviors.end(), behaviorName) ==
      behaviors.end()) {
    cout << "Bad behavior requested" << endl;
  } else {
    conditionCode +=
        "for(var i = 0, k = 0, l = " + GetObjectListName(objectName, context) +
        ".length;i<l;++i) {\n";
    conditionCode += "    if ( " + predicat + " ) {\n";
    conditionCode += "        " +
                     GenerateBooleanFullName(returnBoolean, context) +
                     ".val = true;\n";
    conditionCode += "        " + GetObjectListName(objectName, context) +
                     "[k] = " + GetObjectListName(objectName, context) +
                     "[i];\n";
    conditionCode += "        ++k;\n";
    conditionCode += "    }\n";
    conditionCode += "}\n";
    conditionCode += GetObjectListName(objectName, context) + ".length = k;";
  }

  return conditionCode;
}

gd::String EventsCodeGenerator::GenerateObjectAction(
    const gd::String& objectName,
    const gd::ObjectMetadata& objInfo,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context) {
  gd::String actionCode;

  // Prepare call
  gd::String objectPart = GetObjectListName(objectName, context) + "[i].";

  // Create call
  gd::String call;
  if (instrInfos.codeExtraInformation.type == "number" ||
      instrInfos.codeExtraInformation.type == "string") {
    if (instrInfos.codeExtraInformation.accessType ==
        gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor)
      call = GenerateOperatorCall(
          instrInfos,
          arguments,
          objectPart + instrInfos.codeExtraInformation.functionCallName,
          objectPart +
              instrInfos.codeExtraInformation.optionalAssociatedInstruction,
          1);
    else if (instrInfos.codeExtraInformation.accessType ==
             gd::InstructionMetadata::ExtraInformation::Mutators)
      call = GenerateMutatorCall(
          instrInfos,
          arguments,
          objectPart + instrInfos.codeExtraInformation.functionCallName,
          1);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos,
          arguments,
          objectPart + instrInfos.codeExtraInformation.functionCallName,
          1);
  } else {
    call = objectPart + instrInfos.codeExtraInformation.functionCallName + "(" +
           GenerateArgumentsList(arguments, 1) + ")";
  }

  actionCode +=
      "for(var i = 0, len = " + GetObjectListName(objectName, context) +
      ".length ;i < len;++i) {\n";
  actionCode += "    " + call + ";\n";
  actionCode += "}\n";

  return actionCode;
}

gd::String EventsCodeGenerator::GenerateBehaviorAction(
    const gd::String& objectName,
    const gd::String& behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context) {
  gd::String actionCode;

  // Prepare call
  // Add a static_cast if necessary
  gd::String objectPart = GetObjectListName(objectName, context) +
                          "[i].getBehavior(\"" + behaviorName + "\").";

  // Create call
  gd::String call;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    if (instrInfos.codeExtraInformation.accessType ==
        gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor)
      call = GenerateOperatorCall(
          instrInfos,
          arguments,
          objectPart + instrInfos.codeExtraInformation.functionCallName,
          objectPart +
              instrInfos.codeExtraInformation.optionalAssociatedInstruction,
          2);
    else if (instrInfos.codeExtraInformation.accessType ==
             gd::InstructionMetadata::ExtraInformation::Mutators)
      call = GenerateMutatorCall(
          instrInfos,
          arguments,
          objectPart + instrInfos.codeExtraInformation.functionCallName,
          2);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos,
          arguments,
          objectPart + instrInfos.codeExtraInformation.functionCallName,
          2);
  } else {
    call = objectPart + instrInfos.codeExtraInformation.functionCallName + "(" +
           GenerateArgumentsList(arguments, 2) + ")";
  }

  // Verify that object has behavior.
  vector<gd::String> behaviors = gd::GetBehaviorsOfObject(
      globalObjectsAndGroups, objectsAndGroups, objectName);
  if (find(behaviors.begin(), behaviors.end(), behaviorName) ==
      behaviors.end()) {
    cout << "Bad behavior requested for an action" << endl;
  } else {
    actionCode +=
        "for(var i = 0, len = " + GetObjectListName(objectName, context) +
        ".length ;i < len;++i) {\n";
    actionCode += "    " + call + ";\n";
    actionCode += "}\n";
  }

  return actionCode;
}

gd::String EventsCodeGenerator::GetObjectListName(
    const gd::String& name, const gd::EventsCodeGenerationContext& context) {
  return GetCodeNamespaceAccessor() + ManObjListName(name) +
         gd::String::From(context.GetLastDepthObjectListWasNeeded(name));
}

gd::String EventsCodeGenerator::GenerateObjectsDeclarationCode(
    gd::EventsCodeGenerationContext& context) {
  auto declareObjectList = [this](gd::String object,
                                  gd::EventsCodeGenerationContext& context) {
    gd::String objectListName = GetObjectListName(object, context);
    if (!context.GetParentContext()) {
      std::cout << "ERROR: During code generation, a context tried to use an "
                   "already declared object list without having a parent"
                << std::endl;
      return "/* Could not declare " + objectListName + " */";
    }

    //*Optimization*: Avoid expensive copy of the object list if we're using
    // the same list as the one from the parent context.
    if (context.IsSameObjectsList(object, *context.GetParentContext()))
      return "/* Reuse " + objectListName + " */";

    gd::String copiedListName =
        GetObjectListName(object, *context.GetParentContext());
    return objectListName + ".createFrom(" + copiedListName + ");\n";
  };

  gd::String declarationsCode;
  for (auto object : context.GetObjectsListsToBeDeclared()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclared(object)) {
      objectListDeclaration += GetObjectListName(object, context) +
                               ".createFrom(" +
                               GenerateAllInstancesGetter(object) + ");";
      context.SetObjectDeclared(object);
    } else
      objectListDeclaration = declareObjectList(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }
  for (auto object : context.GetObjectsListsToBeDeclaredEmpty()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclared(object)) {
      objectListDeclaration =
          GetObjectListName(object, context) + ".length = 0;\n";
      context.SetObjectDeclared(object);
    } else
      objectListDeclaration = declareObjectList(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }

  return declarationsCode;
}

gd::String EventsCodeGenerator::GenerateAllInstancesGetter(
    gd::String& objectName) {
  if (HasProjectAndLayout()) {
    return "runtimeScene.getObjects(" + ConvertToStringExplicit(objectName) +
           ")";
  } else {
    return "eventsFunctionContext.getObjects(" +
           ConvertToStringExplicit(objectName) + ")";
  }
}

gd::String EventsCodeGenerator::GenerateEventsListCode(
    gd::EventsList& events, const gd::EventsCodeGenerationContext& context) {
  // *Optimization*: generating all JS code of events in a single, enormous
  // function is badly handled by JS engines and in particular the garbage
  // collectors, leading to intermittent lag/freeze while the garbage collector
  // is running. This is especially noticeable on Android devices. To reduce the
  // stress on the JS engines, we generate a new function for each list of
  // events.

  gd::String code =
      gd::EventsCodeGenerator::GenerateEventsListCode(events, context);

  gd::String parametersCode = HasProjectAndLayout()
                                  ? "runtimeScene"
                                  : "runtimeScene, eventsFunctionContext";

  // Generate a unique name for the function.
  gd::String functionName =
      GetCodeNamespaceAccessor() + "eventsList" + gd::String::From(&events);
  // The only local parameters are runtimeScene and context.
  // List of objects, conditions booleans and any variables used by events
  // are stored in static variables that are globally available by the whole
  // code.
  AddCustomCodeOutsideMain(functionName + " = function(" + parametersCode +
                           ") {\n" + code + "\n" + "}; //End of " +
                           functionName + "\n");

  // Replace the code of the events by the call to the function. This does not
  // interfere with the objects picking as the lists are in static variables
  // globally available.
  return functionName + "(" + parametersCode + ");";
}

gd::String EventsCodeGenerator::GenerateConditionsListCode(
    gd::InstructionsList& conditions,
    gd::EventsCodeGenerationContext& context) {
  gd::String outputCode;

  for (std::size_t i = 0; i < conditions.size(); ++i)
    outputCode += GenerateBooleanInitializationToFalse(
        "condition" + gd::String::From(i) + "IsTrue", context);

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    if (cId != 0)
      outputCode +=
          "if ( " +
          GenerateBooleanFullName(
              "condition" + gd::String::From(cId - 1) + "IsTrue", context) +
          ".val ) {\n";

    gd::InstructionMetadata instrInfos =
        gd::MetadataProvider::GetConditionMetadata(platform,
                                                   conditions[cId].GetType());

    gd::String conditionCode =
        GenerateConditionCode(conditions[cId],
                              "condition" + gd::String::From(cId) + "IsTrue",
                              context);
    if (!conditions[cId].GetType().empty()) {
      outputCode += "{\n";
      outputCode += conditionCode;
      outputCode += "}";
    }
  }

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    if (cId != 0) outputCode += "}\n";
  }

  maxConditionsListsSize = std::max(maxConditionsListsSize, conditions.size());

  return outputCode;
}

gd::String EventsCodeGenerator::GenerateParameterCodes(
    const gd::String& parameter,
    const gd::ParameterMetadata& metadata,
    gd::EventsCodeGenerationContext& context,
    const gd::String& previousParameter,
    std::vector<std::pair<gd::String, gd::String> >*
        supplementaryParametersTypes) {
  //*Optimization:* when a function need objects, it receive a map of
  //(references to) objects lists. We statically declare and construct them to
  // avoid re-creating them at runtime. Arrays are passed as reference in JS and
  // we always use the same static arrays, making this possible.
  auto declareMapOfObjects =
      [this](const std::vector<gd::String>& objects,
             const gd::EventsCodeGenerationContext& context) {
        gd::String objectsMapName = GetCodeNamespaceAccessor() + "mapOf";
        gd::String mapDeclaration;
        for (auto& objectName : objects) {
          // The map name must be unique for each set of objects lists.
          objectsMapName +=
              ManObjListName(GetObjectListName(objectName, context));

          if (!mapDeclaration.empty()) mapDeclaration += ", ";
          mapDeclaration += "\"" + ConvertToString(objectName) +
                            "\": " + GetObjectListName(objectName, context);
        }

        AddCustomCodeOutsideMain(objectsMapName + " = Hashtable.newFrom({" +
                                 mapDeclaration + "});");
        return objectsMapName;
      };

  gd::String argOutput;

  // Code only parameter type
  if (metadata.type == "currentScene") {
    argOutput = "runtimeScene";
  }
  // Code only parameter type
  else if (metadata.type == "objectsContext") {
    argOutput =
        "(typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext "
        ": runtimeScene)";
  }
  // Code only parameter type
  else if (metadata.type == "eventsFunctionContext") {
    argOutput =
        "(typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext "
        ": undefined)";
  }
  // Code only parameter type
  else if (metadata.type == "objectList") {
    std::vector<gd::String> realObjects = ExpandObjectsName(parameter, context);
    for (auto& objectName : realObjects) context.ObjectsListNeeded(objectName);

    gd::String objectsMapName = declareMapOfObjects(realObjects, context);
    argOutput = objectsMapName;
  }
  // Code only parameter type
  else if (metadata.type == "objectListWithoutPicking") {
    std::vector<gd::String> realObjects = ExpandObjectsName(parameter, context);
    for (auto& objectName : realObjects)
      context.EmptyObjectsListNeeded(objectName);

    gd::String objectsMapName = declareMapOfObjects(realObjects, context);
    argOutput = objectsMapName;
  }
  // Code only parameter type
  else if (metadata.type == "objectPtr") {
    std::vector<gd::String> realObjects = ExpandObjectsName(parameter, context);

    if (find(realObjects.begin(),
             realObjects.end(),
             context.GetCurrentObject()) != realObjects.end() &&
        !context.GetCurrentObject().empty()) {
      // If object currently used by instruction is available, use it directly.
      argOutput =
          GetObjectListName(context.GetCurrentObject(), context) + "[i]";
    } else {
      for (std::size_t i = 0; i < realObjects.size(); ++i) {
        context.ObjectsListNeeded(realObjects[i]);
        argOutput += "(" + GetObjectListName(realObjects[i], context) +
                     ".length !== 0 ? " +
                     GetObjectListName(realObjects[i], context) + "[0] : ";
      }
      argOutput += "null";
      for (std::size_t i = 0; i < realObjects.size(); ++i) argOutput += ")";
    }
  } else
    return gd::EventsCodeGenerator::GenerateParameterCodes(
        parameter,
        metadata,
        context,
        previousParameter,
        supplementaryParametersTypes);

  return argOutput;
}

gd::String EventsCodeGenerator::GenerateGetVariable(
    gd::String variableName,
    const VariableScope& scope,
    gd::EventsCodeGenerationContext& context,
    gd::String objectName) {
  gd::String output;
  const gd::VariablesContainer* variables = NULL;
  if (scope == LAYOUT_VARIABLE) {
    output = "runtimeScene.getVariables()";

    if (HasProjectAndLayout()) {
      variables = &GetLayout().GetVariables();
    }
  } else if (scope == PROJECT_VARIABLE) {
    output = "runtimeScene.getGame().getVariables()";

    if (HasProjectAndLayout()) {
      variables = &GetProject().GetVariables();
    }
  } else {
    std::vector<gd::String> realObjects =
        ExpandObjectsName(objectName, context);

    output = "gdjs.VariablesContainer.badVariablesContainer";
    for (std::size_t i = 0; i < realObjects.size(); ++i) {
      context.ObjectsListNeeded(realObjects[i]);

      // Generate the call to GetVariables() method.
      if (context.GetCurrentObject() == realObjects[i] &&
          !context.GetCurrentObject().empty())
        output = GetObjectListName(realObjects[i], context) +
                 "[i].getVariables()";
      else
        output = "((" +
                 GetObjectListName(realObjects[i], context) +
                 ".length === 0 ) ? " + output + " : " +
                 GetObjectListName(realObjects[i], context) +
                 "[0].getVariables())";
    }

    if (HasProjectAndLayout()) {
      if (GetLayout().HasObjectNamed(
              objectName))  // We check first layout's objects' list.
        variables = &GetLayout().GetObject(objectName).GetVariables();
      else if (GetProject().HasObjectNamed(
                   objectName))  // Then the global objects list.
        variables =
            &GetProject().GetObject(objectName).GetVariables();
    }
  }

  // Optimize the lookup of the variable when the variable is declared.
  //(In this case, it is stored in an array at runtime and we know its
  // position.)
  if (variables && variables->Has(variableName)) {
    std::size_t index = variables->GetPosition(variableName);
    if (index < variables->Count()) {
      output += ".getFromIndex(" + gd::String::From(index) + ")";
      return output;
    }
  }

  output += ".get(" + ConvertToStringExplicit(variableName) + ")";
  return output;
}

gd::String EventsCodeGenerator::GenerateReferenceToUpperScopeBoolean(
    const gd::String& referenceName,
    const gd::String& referencedBoolean,
    gd::EventsCodeGenerationContext& context) {
  if (context.GetParentContext() == NULL) return "";

  // FIXME: Using context.GetParentContext() generates the wrong boolean name in
  // case a condition with a custom code generator is used inside another
  // condition (i.e: as a subinstructions).
  return GenerateBooleanFullName(referenceName, context) + " = " +
         GenerateBooleanFullName(referencedBoolean,
                                 *context.GetParentContext()) +
         ";\n";
}

gd::String EventsCodeGenerator::GenerateBooleanInitializationToFalse(
    const gd::String& boolName,
    const gd::EventsCodeGenerationContext& context) {
  return GenerateBooleanFullName(boolName, context) + ".val = false;\n";
}

gd::String EventsCodeGenerator::GenerateBooleanFullName(
    const gd::String& boolName,
    const gd::EventsCodeGenerationContext& context) {
  return GetCodeNamespaceAccessor() + boolName + "_" +
         gd::String::From(context.GetCurrentConditionDepth());
}

gd::String EventsCodeGenerator::GetCodeNamespace() {
  if (HasProjectAndLayout()) {
    return "gdjs." +
           gd::SceneNameMangler::GetMangledSceneName(GetLayout().GetName()) +
           "Code";
  } else if (!codeNamespace.empty()) {
    return codeNamespace;
  } else {
    return "gdjs.unspecifiednamespacethisisprobablyanerrorincodegeneratorsetup";
  }
}

gd::String EventsCodeGenerator::GenerateProfilerSectionBegin(
    const gd::String& section) {
  if (GenerateCodeForRuntime()) return "";

  return "if (runtimeScene.getProfiler()) { runtimeScene.getProfiler().begin(" +
         ConvertToStringExplicit(section) + "); }";
}

gd::String EventsCodeGenerator::GenerateProfilerSectionEnd(
    const gd::String& section) {
  if (GenerateCodeForRuntime()) return "";

  return "if (runtimeScene.getProfiler()) { runtimeScene.getProfiler().end(" +
         ConvertToStringExplicit(section) + "); }";
}

EventsCodeGenerator::EventsCodeGenerator(gd::Project& project,
                                         const gd::Layout& layout)
    : gd::EventsCodeGenerator(project, layout, JsPlatform::Get()) {}

EventsCodeGenerator::EventsCodeGenerator(
    gd::ObjectsContainer& globalObjectsAndGroups,
    const gd::ObjectsContainer& objectsAndGroups)
    : gd::EventsCodeGenerator(
          JsPlatform::Get(), globalObjectsAndGroups, objectsAndGroups) {}

EventsCodeGenerator::~EventsCodeGenerator() {}

}  // namespace gdjs
