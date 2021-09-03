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
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/Extensions/JsPlatform.h"

using namespace std;

namespace gdjs {

gd::String EventsCodeGenerator::GenerateEventsListCompleteFunctionCode(
    gd::Project& project,
    gdjs::EventsCodeGenerator& codeGenerator,
    gd::String fullyQualifiedFunctionName,
    gd::String functionArgumentsCode,
    gd::String functionPreEventsCode,
    const gd::EventsList& events,
    gd::String functionReturnCode) {
  // Prepare the global context
  unsigned int maxDepthLevelReached = 0;
  gd::EventsCodeGenerationContext context(&maxDepthLevelReached);

  // Generate whole events code
  // Preprocessing then code generation can make changes to the events, so we
  // need to do the work on a copy of the events.
  gd::EventsList generatedEvents = events;
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

  // "Booleans" used by conditions
  gd::String globalConditionsBooleans =
      codeGenerator.GenerateAllConditionsBooleanDeclarations();

  gd::String output =
      codeGenerator.GetCodeNamespace() + " = {};\n" + globalDeclarations +
      globalObjectLists + "\n" + globalConditionsBooleans + "\n\n" +
      codeGenerator.GetCustomCodeOutsideMain() + "\n\n" +
      fullyQualifiedFunctionName + " = function(" + functionArgumentsCode +
      ") {\n" + functionPreEventsCode + "\n" + globalObjectListsReset + "\n" +
      wholeEventsCode + "\n" + functionReturnCode + "\n" + "}\n";

  return output;
}

gd::String EventsCodeGenerator::GenerateLayoutCode(
    gd::Project& project,
    const gd::Layout& scene,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  EventsCodeGenerator codeGenerator(project, scene);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

  gd::String output = GenerateEventsListCompleteFunctionCode(
      project,
      codeGenerator,
      codeGenerator.GetCodeNamespaceAccessor() + "func",
      "runtimeScene",
      "runtimeScene.getOnceTriggers().startNewFrame();\n",
      scene.GetEvents(),
      "return;\n");

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
  gd::ObjectsContainer globalObjectsAndGroups;
  gd::ObjectsContainer objectsAndGroups;
  gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
      project, eventsFunction, globalObjectsAndGroups, objectsAndGroups);

  EventsCodeGenerator codeGenerator(globalObjectsAndGroups, objectsAndGroups);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

  gd::String output = GenerateEventsListCompleteFunctionCode(
      project,
      codeGenerator,
      codeGenerator.GetCodeNamespaceAccessor() + "func",
      codeGenerator.GenerateEventsFunctionParameterDeclarationsList(
          eventsFunction.GetParameters(), false),
      codeGenerator.GenerateFreeEventsFunctionContext(
          eventsFunction.GetParameters(), "runtimeScene.getOnceTriggers()"),
      eventsFunction.GetEvents(),
      codeGenerator.GenerateEventsFunctionReturn(eventsFunction));

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateBehaviorEventsFunctionCode(
    gd::Project& project,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    const gd::String& fullyQualifiedFunctionName,
    const gd::String& onceTriggersVariable,
    const gd::String& preludeCode,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::ObjectsContainer globalObjectsAndGroups;
  gd::ObjectsContainer objectsAndGroups;
  gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
      project,
      eventsBasedBehavior,
      eventsFunction,
      globalObjectsAndGroups,
      objectsAndGroups);

  EventsCodeGenerator codeGenerator(globalObjectsAndGroups, objectsAndGroups);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

  // Generate the code setting up the context of the function.
  gd::String fullPreludeCode =
      preludeCode + "\n" + "var that = this;\n" +
      // runtimeScene is supposed to be always accessible, read
      // it from the behavior
      "var runtimeScene = this._runtimeScene;\n" +
      // By convention of Behavior Events Function, the object is accessible
      // as a parameter called "Object", and thisObjectList is an array
      // containing it (for faster access, without having to go through the
      // hashmap).
      "var thisObjectList = [this.owner];\n" +
      "var Object = Hashtable.newFrom({Object: thisObjectList});\n" +
      // By convention of Behavior Events Function, the behavior is accessible
      // as a parameter called "Behavior".
      "var Behavior = this.name;\n" +
      codeGenerator.GenerateBehaviorEventsFunctionContext(
          eventsBasedBehavior,
          eventsFunction.GetParameters(),
          onceTriggersVariable,
          // Pass the names of the parameters considered as the current
          // object and behavior parameters:
          "Object",
          "Behavior");

  gd::String output = GenerateEventsListCompleteFunctionCode(
      project,
      codeGenerator,
      fullyQualifiedFunctionName,
      codeGenerator.GenerateEventsFunctionParameterDeclarationsList(
          eventsFunction.GetParameters(), true),
      fullPreludeCode,
      eventsFunction.GetEvents(),
      codeGenerator.GenerateEventsFunctionReturn(eventsFunction));

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateEventsFunctionParameterDeclarationsList(
    const vector<gd::ParameterMetadata>& parameters,
    bool isBehaviorEventsFunction) {
  gd::String declaration = isBehaviorEventsFunction ? "" : "runtimeScene";
  for (size_t i = 0; i < parameters.size(); ++i) {
    const auto& parameter = parameters[i];
    if (isBehaviorEventsFunction && (i == 0 || i == 1)) {
      // By convention, the first two arguments of a behavior events function
      // are the object and the behavior, which are not passed to the called
      // function in the generated JS code.
      continue;
    }

    declaration += (declaration.empty() ? "" : ", ") +
                   (parameter.GetName().empty() ? "_" : parameter.GetName());
  }
  declaration += gd::String(declaration.empty() ? "" : ", ") +
                 "parentEventsFunctionContext";

  return declaration;
}

gd::String EventsCodeGenerator::GenerateFreeEventsFunctionContext(
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable) {
  gd::String objectsGettersMap;
  gd::String objectArraysMap;
  gd::String behaviorNamesMap;
  return GenerateEventsFunctionContext(parameters, onceTriggersVariable, objectsGettersMap, objectArraysMap, behaviorNamesMap);
}

gd::String EventsCodeGenerator::GenerateBehaviorEventsFunctionContext(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable,
    const gd::String& thisObjectName,
    const gd::String& thisBehaviorName) {
  // See the comment at the start of the GenerateEventsFunctionContext function

  gd::String objectsGettersMap;
  gd::String objectArraysMap;
  gd::String behaviorNamesMap;

  // If we have an object considered as the current object ("this") (usually
  // called Object in behavior events function), generate a slightly more
  // optimized getter for it (bypassing "Object" hashmap, and directly return
  // the array containing it).
  if (!thisObjectName.empty()) {
    objectsGettersMap +=
        ConvertToStringExplicit(thisObjectName) + ": " + thisObjectName + "\n";
    objectArraysMap +=
        ConvertToStringExplicit(thisObjectName) + ": thisObjectList\n";
  }

  if (!thisBehaviorName.empty()) {
    // If we have a behavior considered as the current behavior ("this") (usually
    // called Behavior in behavior events function), generate a slightly more
    // optimized getter for it.
    behaviorNamesMap += ConvertToStringExplicit(thisBehaviorName) + ": " +
                        thisBehaviorName + "\n";
    
    // Add required behaviors from properties
    for (size_t i = 0; i < eventsBasedBehavior.GetPropertyDescriptors().GetCount(); i++)
    {
      const gd::NamedPropertyDescriptor& propertyDescriptor = eventsBasedBehavior.GetPropertyDescriptors().Get(i);
      const std::vector<gd::String>& extraInfo = propertyDescriptor.GetExtraInfo();
      if (propertyDescriptor.GetType() == "Behavior") {
        // Generate map that will be used to transform from behavior name used in
        // function to the "real" behavior name from the caller.
        gd::String comma = behaviorNamesMap.empty() ? "" : ", ";
        behaviorNamesMap += comma + ConvertToStringExplicit(propertyDescriptor.GetName()) +
                            ": this._get" + propertyDescriptor.GetName() + "()\n";
      }
    }
  }
  
  return GenerateEventsFunctionContext(
      parameters,
      onceTriggersVariable,
      objectsGettersMap,
      objectArraysMap,
      behaviorNamesMap,
      thisObjectName,
      thisBehaviorName);
}

gd::String EventsCodeGenerator::GenerateEventsFunctionContext(
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable,
    gd::String& objectsGettersMap,
    gd::String& objectArraysMap,
    gd::String& behaviorNamesMap,
    const gd::String& thisObjectName,
    const gd::String& thisBehaviorName) {
  // When running in the context of a function generated from events, we
  // need some indirection to deal with objects, behaviors and parameters in
  // general:
  //
  // * Each map of objects passed as parameter needs to be queryable as an array
  // of objects.
  // * Behaviors are passed as string, representing the name of the behavior.
  // This can differ from the name used to refer to the behavior in the events
  // of the function (for example, a behavior can simply be called "Behavior" in
  // the parameter name).
  // * For other parameters, allow to access to them without transformation.
  // Conditions/expressions are available to deal with them in events.

  gd::String argumentsGetters;

  for (const auto& parameter : parameters) {
    if (parameter.GetName().empty()) continue;

    if (gd::ParameterMetadata::IsObject(parameter.GetType())) {
      if (parameter.GetName() == thisObjectName) {
        continue;
      }

      // Generate map that will be used to get the lists of objects passed
      // as parameters (either as objects lists or array).
      gd::String comma = objectsGettersMap.empty() ? "" : ", ";
      objectsGettersMap += comma +
                           ConvertToStringExplicit(parameter.GetName()) + ": " +
                           parameter.GetName() + "\n";
      objectArraysMap += comma + ConvertToStringExplicit(parameter.GetName()) +
                         ": gdjs.objectsListsToArray(" + parameter.GetName() +
                         ")\n";
    } else if (gd::ParameterMetadata::IsBehavior(parameter.GetType())) {
      if (parameter.GetName() == thisBehaviorName) {
        continue;
      }

      // Generate map that will be used to transform from behavior name used in
      // function to the "real" behavior name from the caller.
      gd::String comma = behaviorNamesMap.empty() ? "" : ", ";
      behaviorNamesMap += comma + ConvertToStringExplicit(parameter.GetName()) +
                          ": " + parameter.GetName() + "\n";
    } else {
      argumentsGetters +=
          "if (argName === " + ConvertToStringExplicit(parameter.GetName()) +
          ") return " + parameter.GetName() + ";\n";
    }
  }

  return gd::String("var eventsFunctionContext = {\n") +
         // The object name to parameter map:
         "  _objectsMap: {\n" + objectsGettersMap +
         "},\n"
         // The object name to arrays map:
         "  _objectArraysMap: {\n" +
         objectArraysMap +
         "},\n"
         // The behavior name to parameter map:
         "  _behaviorNamesMap: {\n" +
         behaviorNamesMap +
         "},\n"
         // Function that will be used to query objects, when a new object list
         // is needed by events. We assume it's used a lot by the events
         // generated code, so we cache the arrays in a map.
         "  getObjects: function(objectName) {\n" +
         "    return eventsFunctionContext._objectArraysMap[objectName] || "
         "[];\n" +
         "  },\n" +
         // Function that can be used in JS code to get the lists of objects
         // and filter/alter them (not actually used in events).
         "  getObjectsLists: function(objectName) {\n" +
         "    return eventsFunctionContext._objectsMap[objectName] || null;\n"
         "  },\n" +
         // Function that will be used to query behavior name (as behavior name
         // can be different between the parameter name vs the actual behavior
         // name passed as argument).
         "  getBehaviorName: function(behaviorName) {\n" +
         "    return eventsFunctionContext._behaviorNamesMap[behaviorName];\n"
         "  },\n" +
         // Creator function that will be used to create new objects. We
         // need to check if the function was given the context of the calling
         // function (parentEventsFunctionContext). If this is the case, use it
         // to create the new object as the object names used in the function
         // are not the same as the objects available in the scene.
         "  createObject: function(objectName) {\n"
         "    var objectsList = "
         "eventsFunctionContext._objectsMap[objectName];\n" +
         // TODO: we could speed this up by storing a map of object names, but
         // the cost of creating/storing it for each events function might not
         // be worth it.
         "    if (objectsList) {\n" +
         "      const object = parentEventsFunctionContext ?\n" +
         "        "
         "parentEventsFunctionContext.createObject(objectsList.firstKey()) "
         ":\n" +
         "        runtimeScene.createObject(objectsList.firstKey());\n" +
         // Add the new instance to object lists
         "      if (object) {\n" +
         "        objectsList.get(objectsList.firstKey()).push(object);\n" +
         "        eventsFunctionContext._objectArraysMap[objectName].push(object);\n" +
         "      }\n" +
         "      return object;" +
         "    }\n" +
         // Unknown object, don't create anything:
         "    return null;\n" +
         "  },\n"
         // Allow to get a layer directly from the context for convenience:
         "  getLayer: function(layerName) {\n"
         "    return runtimeScene.getLayer(layerName);\n"
         "  },\n"
         // Getter for arguments that are not objects
         "  getArgument: function(argName) {\n" +
         argumentsGetters + "    return \"\";\n" + "  },\n" +
         // Expose OnceTriggers (will be pointing either to the runtime scene
         // ones, or the ones from the behavior):
         "  getOnceTriggers: function() { return " + onceTriggersVariable +
         "; }\n" + "};\n";
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
           "[i].getBehavior(" + GenerateGetBehaviorNameCode(behaviorName) +
           ")." + codeInfo.functionCallName + "(" + parametersStr + "))";
  else
    return "(( " + GetObjectListName(objectListName, context) +
           ".length === 0 ) ? " + defaultOutput + " :" +
           GetObjectListName(objectListName, context) + "[0].getBehavior(" +
           GenerateGetBehaviorNameCode(behaviorName) + ")." +
           codeInfo.functionCallName + "(" + parametersStr + "))";
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
      GetObjectListName(objectName, context) + "[i].getBehavior(" +
      GenerateGetBehaviorNameCode(behaviorName) + ")." +
      instrInfos.codeExtraInformation.functionCallName;

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
    cout << "Error: bad behavior \"" << behaviorName
         << "\" requested for object \'" << objectName
         << "\" (condition: " << instrInfos.GetFullName() << ")." << endl;
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
  gd::String objectPart = GetObjectListName(objectName, context) +
                          "[i].getBehavior(" +
                          GenerateGetBehaviorNameCode(behaviorName) + ").";

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
    cout << "Error: bad behavior \"" << behaviorName
         << "\" requested for object \'" << objectName
         << "\" (action: " << instrInfos.GetFullName() << ")." << endl;
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

gd::String EventsCodeGenerator::GenerateGetBehaviorNameCode(
    const gd::String& behaviorName) {
  if (HasProjectAndLayout()) {
    return ConvertToStringExplicit(behaviorName);
  } else {
    return "eventsFunctionContext.getBehaviorName(" +
           ConvertToStringExplicit(behaviorName) + ")";
  }
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
    return "gdjs.copyArray(" + copiedListName + ", " + objectListName + ");\n";
  };

  gd::String declarationsCode;
  for (auto object : context.GetObjectsListsToBeDeclared()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclared(object)) {
      objectListDeclaration += "gdjs.copyArray(" +
                               GenerateAllInstancesGetterCode(object) + ", " +
                               GetObjectListName(object, context) + ");";
      context.SetObjectDeclared(object);
    } else
      objectListDeclaration = declareObjectList(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }
  for (auto object : context.GetObjectsListsToBeDeclaredWithoutPicking()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclared(object)) {
      objectListDeclaration =
          GetObjectListName(object, context) + ".length = 0;\n";
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
      objectListDeclaration =
          GetObjectListName(object, context) + ".length = 0;\n";

    declarationsCode += objectListDeclaration + "\n";
  }

  return declarationsCode;
}

gd::String EventsCodeGenerator::GenerateAllInstancesGetterCode(
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
  gd::String uniqueId =
      gd::String::From(GenerateSingleUsageUniqueIdForEventsList());
  gd::String functionName =
      GetCodeNamespaceAccessor() + "eventsList" + uniqueId;

  // The only local parameters are runtimeScene and context.
  // List of objects, conditions booleans and any variables used by events
  // are stored in static variables that are globally available by the whole
  // code.
  AddCustomCodeOutsideMain(functionName + " = function(" + parametersCode +
                           ") {\n" + code + "\n" + "};");

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
    const gd::String& lastObjectName,
    std::vector<std::pair<gd::String, gd::String> >*
        supplementaryParametersTypes) {
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
  } else
    return gd::EventsCodeGenerator::GenerateParameterCodes(
        parameter,
        metadata,
        context,
        lastObjectName,
        supplementaryParametersTypes);

  return argOutput;
}

gd::String EventsCodeGenerator::GenerateObject(
    const gd::String& objectName,
    const gd::String& type,
    gd::EventsCodeGenerationContext& context) {
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

  gd::String output;
  if (type == "objectList") {
    std::vector<gd::String> realObjects =
        ExpandObjectsName(objectName, context);
    for (auto& objectName : realObjects) context.ObjectsListNeeded(objectName);

    gd::String objectsMapName = declareMapOfObjects(realObjects, context);
    output = objectsMapName;
  } else if (type == "objectListWithoutPicking") {
    std::vector<gd::String> realObjects =
        ExpandObjectsName(objectName, context);
    for (auto& objectName : realObjects)
      context.ObjectsListWithoutPickingNeeded(objectName);

    gd::String objectsMapName = declareMapOfObjects(realObjects, context);
    output = objectsMapName;
  } else if (type == "objectPtr") {
    std::vector<gd::String> realObjects =
        ExpandObjectsName(objectName, context);

    if (find(realObjects.begin(),
             realObjects.end(),
             context.GetCurrentObject()) != realObjects.end() &&
        !context.GetCurrentObject().empty()) {
      // If object currently used by instruction is available, use it directly.
      output = GetObjectListName(context.GetCurrentObject(), context) + "[i]";
    } else {
      for (std::size_t i = 0; i < realObjects.size(); ++i) {
        context.ObjectsListNeeded(realObjects[i]);
        output += "(" + GetObjectListName(realObjects[i], context) +
                  ".length !== 0 ? " +
                  GetObjectListName(realObjects[i], context) + "[0] : ";
      }
      output += GenerateBadObject();
      for (std::size_t i = 0; i < realObjects.size(); ++i) output += ")";
    }
  }

  return output;
}

gd::String EventsCodeGenerator::GenerateGetVariable(
    const gd::String& variableName,
    const VariableScope& scope,
    gd::EventsCodeGenerationContext& context,
    const gd::String& objectName) {
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
        output =
            GetObjectListName(realObjects[i], context) + "[i].getVariables()";
      else
        output = "((" + GetObjectListName(realObjects[i], context) +
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
        variables = &GetProject().GetObject(objectName).GetVariables();
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
  if (context.GetCurrentConditionDepth() <= 0)
    return "/* Code generation error: the referenced boolean can't exist as "
           "the context has a condition depth of 0. */";

  return GenerateBooleanFullName(referenceName, context) + " = " +
         GetCodeNamespaceAccessor() + referencedBoolean + "_" +
         gd::String::From(context.GetCurrentConditionDepth() - 1) + ";\n";
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
