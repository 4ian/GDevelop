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
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDJS/Events/CodeGeneration/BehaviorCodeGenerator.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/Extensions/JsPlatform.h"

using namespace std;

namespace gdjs {

gd::String EventsCodeGenerator::GenerateEventsListCompleteFunctionCode(
    gdjs::EventsCodeGenerator& codeGenerator,
    gd::String fullyQualifiedFunctionName,
    gd::String functionArgumentsCode,
    gd::String functionPreEventsCode,
    const gd::EventsList& events,
    gd::String functionPostEventsCode,
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

  gd::String output =
      // clang-format off
      codeGenerator.GetCodeNamespace() + " = {};\n" +
      globalDeclarations +
      globalObjectLists + "\n\n" +
      codeGenerator.GetCustomCodeOutsideMain() + "\n\n" +
      fullyQualifiedFunctionName + " = function(" +
        functionArgumentsCode +
      ") {\n" +
        functionPreEventsCode + "\n" +
        globalObjectListsReset + "\n" +
        wholeEventsCode + "\n" +
        functionPostEventsCode + "\n" +
        functionReturnCode + "\n" +
      "}\n";
  // clang-format on

  return output;
}

gd::String EventsCodeGenerator::GenerateLayoutCode(
    const gd::Project& project,
    const gd::Layout& scene,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  EventsCodeGenerator codeGenerator(project, scene);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

  gd::String output = GenerateEventsListCompleteFunctionCode(
      codeGenerator,
      codeGenerator.GetCodeNamespaceAccessor() + "func",
      "runtimeScene",
      "runtimeScene.getOnceTriggers().startNewFrame();\n",
      scene.GetEvents(),
      "",
      "return;\n");

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateEventsFunctionCode(
    gd::Project& project,
    const gd::EventsFunctionsContainer& functionsContainer,
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::ObjectsContainer globalObjectsAndGroups;
  gd::ObjectsContainer objectsAndGroups;
  gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
      project,
      functionsContainer,
      eventsFunction,
      globalObjectsAndGroups,
      objectsAndGroups);

  gd::ProjectScopedContainers projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(
          globalObjectsAndGroups, objectsAndGroups);
  projectScopedContainers.AddParameters(
      eventsFunction.GetParametersForEvents(functionsContainer));

  EventsCodeGenerator codeGenerator(projectScopedContainers);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

  gd::String output = GenerateEventsListCompleteFunctionCode(
      codeGenerator,
      codeGenerator.GetCodeNamespaceAccessor() + "func",
      codeGenerator.GenerateEventsFunctionParameterDeclarationsList(
          eventsFunction.GetParametersForEvents(functionsContainer), 0, true),
      codeGenerator.GenerateFreeEventsFunctionContext(
          eventsFunction.GetParametersForEvents(functionsContainer),
          "runtimeScene.getOnceTriggers()",
          eventsFunction.IsAsync()),
      eventsFunction.GetEvents(),
      "",
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

  gd::ProjectScopedContainers projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(
          globalObjectsAndGroups, objectsAndGroups);
  projectScopedContainers.AddPropertiesContainer(
      eventsBasedBehavior.GetSharedPropertyDescriptors());
  projectScopedContainers.AddPropertiesContainer(
      eventsBasedBehavior.GetPropertyDescriptors());
  projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(
      eventsBasedBehavior.GetEventsFunctions()));

  EventsCodeGenerator codeGenerator(projectScopedContainers);
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
          eventsFunction.GetParametersForEvents(
              eventsBasedBehavior.GetEventsFunctions()),
          onceTriggersVariable,
          eventsFunction.IsAsync(),
          // Pass the names of the parameters considered as the current
          // object and behavior parameters:
          "Object",
          "Behavior");

  gd::String output = GenerateEventsListCompleteFunctionCode(
      codeGenerator,
      fullyQualifiedFunctionName,
      codeGenerator.GenerateEventsFunctionParameterDeclarationsList(
          eventsFunction.GetParametersForEvents(
              eventsBasedBehavior.GetEventsFunctions()),
          2,
          false),
      fullPreludeCode,
      eventsFunction.GetEvents(),
      "",
      codeGenerator.GenerateEventsFunctionReturn(eventsFunction));

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateObjectEventsFunctionCode(
    gd::Project& project,
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    const gd::String& fullyQualifiedFunctionName,
    const gd::String& onceTriggersVariable,
    const gd::String& preludeCode,
    const gd::String& endingCode,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::ObjectsContainer globalObjectsAndGroups;
  gd::ObjectsContainer objectsAndGroups;
  gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
      project,
      eventsBasedObject,
      eventsFunction,
      globalObjectsAndGroups,
      objectsAndGroups);

  gd::ProjectScopedContainers projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(
          globalObjectsAndGroups, objectsAndGroups);
  projectScopedContainers.AddPropertiesContainer(
      eventsBasedObject.GetPropertyDescriptors());
  projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(
      eventsBasedObject.GetEventsFunctions()));

  EventsCodeGenerator codeGenerator(projectScopedContainers);
  codeGenerator.SetCodeNamespace(codeNamespace);
  codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

  // Generate the code setting up the context of the function.
  gd::String fullPreludeCode =
      preludeCode + "\n" + "var that = this;\n" +
      // runtimeScene is supposed to be always accessible, read
      // it from the object
      "var runtimeScene = this._instanceContainer;\n" +
      // By convention of Object Events Function, the object is accessible
      // as a parameter called "Object", and thisObjectList is an array
      // containing it (for faster access, without having to go through the
      // hashmap).
      "var thisObjectList = [this];\n" +
      "var Object = Hashtable.newFrom({Object: thisObjectList});\n";

  // Add child-objects
  for (auto& childObject : eventsBasedObject.GetObjects()) {
    // child-object are never picked because they are not parameters.
    const auto& childName = ManObjListName(childObject->GetName());
    fullPreludeCode += "var this" + childName +
                       "List = [...runtimeScene.getObjects(" +
                       ConvertToStringExplicit(childObject->GetName()) +
                       ")];\n" + "var " + childName + " = Hashtable.newFrom({" +
                       ConvertToStringExplicit(childObject->GetName()) +
                       ": this" + childName + "List});\n";
  }

  fullPreludeCode += codeGenerator.GenerateObjectEventsFunctionContext(
      eventsBasedObject,
      eventsFunction.GetParametersForEvents(
          eventsBasedObject.GetEventsFunctions()),
      onceTriggersVariable,
      eventsFunction.IsAsync(),
      // Pass the names of the parameters considered as the current
      // object and behavior parameters:
      "Object");

  gd::String output = GenerateEventsListCompleteFunctionCode(
      codeGenerator,
      fullyQualifiedFunctionName,
      codeGenerator.GenerateEventsFunctionParameterDeclarationsList(
          // TODO EBO use constants for firstParameterIndex
          eventsFunction.GetParametersForEvents(
              eventsBasedObject.GetEventsFunctions()),
          1,
          false),
      fullPreludeCode,
      eventsFunction.GetEvents(),
      endingCode,
      codeGenerator.GenerateEventsFunctionReturn(eventsFunction));

  includeFiles.insert(codeGenerator.GetIncludeFiles().begin(),
                      codeGenerator.GetIncludeFiles().end());
  return output;
}

gd::String EventsCodeGenerator::GenerateEventsFunctionParameterDeclarationsList(
    const vector<gd::ParameterMetadata>& parameters,
    int firstParameterIndex,
    bool addsSceneParameter) {
  gd::String declaration = addsSceneParameter ? "runtimeScene" : "";
  for (size_t i = 0; i < parameters.size(); ++i) {
    const auto& parameter = parameters[i];
    if (i < firstParameterIndex) {
      // By convention, the first two arguments of a behavior events function
      // are the object and the behavior, which are not passed to the called
      // function in the generated JS code.
      continue;
    }

    gd::String parameterMangledName =
        EventsCodeNameMangler::GetMangledName(parameter.GetName());

    declaration += (declaration.empty() ? "" : ", ") +
                   (parameter.GetName().empty() ? "_" : parameterMangledName);
  }
  declaration += gd::String(declaration.empty() ? "" : ", ") +
                 "parentEventsFunctionContext";

  return declaration;
}

gd::String EventsCodeGenerator::GenerateFreeEventsFunctionContext(
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable,
    bool isAsync) {
  gd::String objectsGettersMap;
  gd::String objectArraysMap;
  gd::String behaviorNamesMap;
  return GenerateEventsFunctionContext(parameters,
                                       onceTriggersVariable,
                                       objectsGettersMap,
                                       objectArraysMap,
                                       behaviorNamesMap,
                                       isAsync);
}

gd::String EventsCodeGenerator::GenerateBehaviorEventsFunctionContext(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable,
    bool isAsync,
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
    // If we have a behavior considered as the current behavior ("this")
    // (usually called Behavior in behavior events function), generate a
    // slightly more optimized getter for it.
    behaviorNamesMap += ConvertToStringExplicit(thisBehaviorName) + ": " +
                        thisBehaviorName + "\n";

    // Add required behaviors from properties
    for (size_t i = 0;
         i < eventsBasedBehavior.GetPropertyDescriptors().GetCount();
         i++) {
      const gd::NamedPropertyDescriptor& propertyDescriptor =
          eventsBasedBehavior.GetPropertyDescriptors().Get(i);
      const std::vector<gd::String>& extraInfo =
          propertyDescriptor.GetExtraInfo();
      if (propertyDescriptor.GetType() == "Behavior") {
        // Generate map that will be used to transform from behavior name used
        // in function to the "real" behavior name from the caller.
        gd::String comma = behaviorNamesMap.empty() ? "" : ", ";
        behaviorNamesMap +=
            comma + ConvertToStringExplicit(propertyDescriptor.GetName()) +
            ": this._get" + propertyDescriptor.GetName() + "()\n";
      }
    }
  }

  return GenerateEventsFunctionContext(parameters,
                                       onceTriggersVariable,
                                       objectsGettersMap,
                                       objectArraysMap,
                                       behaviorNamesMap,
                                       isAsync,
                                       thisObjectName,
                                       thisBehaviorName);
}

gd::String EventsCodeGenerator::GenerateObjectEventsFunctionContext(
    const gd::EventsBasedObject& eventsBasedObject,
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable,
    bool isAsync,
    const gd::String& thisObjectName) {
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

    // Add child-objects
    for (auto& childObject : eventsBasedObject.GetObjects()) {
      const auto& childName = ManObjListName(childObject->GetName());
      // child-object are never picked because they are not parameters.
      objectsGettersMap += ", " +
                           ConvertToStringExplicit(childObject->GetName()) +
                           ": " + childName + "\n";
      objectArraysMap += ", " +
                         ConvertToStringExplicit(childObject->GetName()) +
                         ": this" + childName + "List\n";
    }
  }

  return GenerateEventsFunctionContext(parameters,
                                       onceTriggersVariable,
                                       objectsGettersMap,
                                       objectArraysMap,
                                       behaviorNamesMap,
                                       isAsync,
                                       thisObjectName);
}

gd::String EventsCodeGenerator::GenerateEventsFunctionContext(
    const vector<gd::ParameterMetadata>& parameters,
    const gd::String& onceTriggersVariable,
    gd::String& objectsGettersMap,
    gd::String& objectArraysMap,
    gd::String& behaviorNamesMap,
    bool isAsync,
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

    gd::String parameterMangledName =
        EventsCodeNameMangler::GetMangledName(parameter.GetName());

    if (gd::ParameterMetadata::IsObject(parameter.GetType())) {
      if (parameter.GetName() == thisObjectName) {
        continue;
      }

      // Generate map that will be used to get the lists of objects passed
      // as parameters (either as objects lists or array).
      gd::String comma = objectsGettersMap.empty() ? "" : ", ";
      objectsGettersMap += comma +
                           ConvertToStringExplicit(parameter.GetName()) + ": " +
                           parameterMangledName + "\n";
      objectArraysMap += comma + ConvertToStringExplicit(parameter.GetName()) +
                         ": gdjs.objectsListsToArray(" + parameterMangledName +
                         ")\n";
    } else if (gd::ParameterMetadata::IsBehavior(parameter.GetType())) {
      if (parameter.GetName() == thisBehaviorName) {
        continue;
      }

      // Generate map that will be used to transform from behavior name used in
      // function to the "real" behavior name from the caller.
      gd::String comma = behaviorNamesMap.empty() ? "" : ", ";
      behaviorNamesMap += comma + ConvertToStringExplicit(parameter.GetName()) +
                          ": " + parameterMangledName + "\n";
    } else {
      argumentsGetters +=
          "if (argName === " + ConvertToStringExplicit(parameter.GetName()) +
          ") return " + parameterMangledName + ";\n";
    }
  }

  const gd::String async =
      isAsync ? "  task: new gdjs.ManuallyResolvableTask(),\n" : "";

  return gd::String("var eventsFunctionContext = {\n") +
         // The async task, if there is one
         async +
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
         // TODO EBO Handle behavior name collision between parameters and
         // children
         "    return eventsFunctionContext._behaviorNamesMap[behaviorName] || "
         "behaviorName;\n"
         "  },\n" +
         // Creator function that will be used to create new objects. We
         // need to check if the function was given the context of the calling
         // function (parentEventsFunctionContext). If this is the case, use it
         // to create the new object as the object names used in the function
         // are not the same as the objects available in the scene.
         "  createObject: function(objectName) {\n"
         "    const objectsList = "
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
         "        "
         "eventsFunctionContext._objectArraysMap[objectName].push(object);\n" +
         "      }\n" + "      return object;" + "    }\n" +
         // Unknown object, don't create anything:
         "    return null;\n" +
         "  },\n"
         // Function to count instances on the scene. We need it here because
         // it needs the objects map to get the object names of the parent
         // context.
         "  getInstancesCountOnScene: function(objectName) {\n"
         "    const objectsList = "
         "eventsFunctionContext._objectsMap[objectName];\n" +
         "    let count = 0;\n" + "    if (objectsList) {\n" +
         "      for(const objectName in objectsList.items)\n" +
         "        count += parentEventsFunctionContext ?\n" +
         "parentEventsFunctionContext.getInstancesCountOnScene(objectName) "
         ":\n" +
         "        runtimeScene.getInstancesCountOnScene(objectName);\n" +
         "    }\n" + "    return count;\n" +
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
  if (eventsFunction.IsAsync()) return "return eventsFunctionContext.task";
  // We don't use IsCondition because ExpressionAndCondition event functions
  // don't need a boolean function. They use the expression function with a
  // relational operator.
  if (eventsFunction.GetFunctionType() == gd::EventsFunction::Condition) {
    return "return !!eventsFunctionContext.returnValue;";
  } else if (eventsFunction.IsExpression()) {
    if (eventsFunction.GetExpressionType().IsNumber()) {
      return "return Number(eventsFunctionContext.returnValue) || 0;";
    } else {
      // Default on string because it's more likely that future expression
      // types are strings.
      return "return \"\" + eventsFunctionContext.returnValue;";
    }
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

  GetObjectsContainersList().ForEachObject(generateDeclarations);

  return std::make_pair(globalObjectLists, globalObjectListsReset);
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
  gd::String predicate;
  if (instrInfos.codeExtraInformation.type == "number" ||
      instrInfos.codeExtraInformation.type == "string") {
    predicate = GenerateRelationalOperatorCall(
        instrInfos,
        arguments,
        instrInfos.codeExtraInformation.functionCallName);
  } else {
    predicate = instrInfos.codeExtraInformation.functionCallName + "(" +
                GenerateArgumentsList(arguments) + ")";
  }

  // Add logical not if needed
  bool conditionAlreadyTakeCareOfInversion = false;
  for (std::size_t i = 0; i < instrInfos.parameters.size();
       ++i)  // Some conditions already have a "conditionInverted" parameter
  {
    if (instrInfos.parameters[i].GetType() == "conditionInverted")
      conditionAlreadyTakeCareOfInversion = true;
  }
  if (!conditionAlreadyTakeCareOfInversion && conditionInverted)
    predicate = GenerateNegatedPredicate(predicate);

  // Generate condition code
  return GenerateBooleanFullName(returnBoolean, context) + " = " + predicate +
         ";\n";
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
  gd::String predicate;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    predicate = GenerateRelationalOperatorCall(
        instrInfos, arguments, objectFunctionCallNamePart, 1);
  } else {
    predicate = objectFunctionCallNamePart + "(" +
                GenerateArgumentsList(arguments, 1) + ")";
  }
  if (conditionInverted) predicate = GenerateNegatedPredicate(predicate);

  // Generate whole condition code
  conditionCode +=
      "for (var i = 0, k = 0, l = " + GetObjectListName(objectName, context) +
      ".length;i<l;++i) {\n";
  conditionCode += "    if ( " + predicate + " ) {\n";
  conditionCode += "        " +
                   GenerateBooleanFullName(returnBoolean, context) +
                   " = true;\n";
  conditionCode += "        " + GetObjectListName(objectName, context) +
                   "[k] = " + GetObjectListName(objectName, context) + "[i];\n";
  conditionCode += "        ++k;\n";
  conditionCode += "    }\n";
  conditionCode += "}\n";
  conditionCode += GetObjectListName(objectName, context) + ".length = k;\n";

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
  gd::String predicate;
  if ((instrInfos.codeExtraInformation.type == "number" ||
       instrInfos.codeExtraInformation.type == "string")) {
    predicate = GenerateRelationalOperatorCall(
        instrInfos, arguments, objectFunctionCallNamePart, 2);
  } else {
    predicate = objectFunctionCallNamePart + "(" +
                GenerateArgumentsList(arguments, 2) + ")";
  }
  if (conditionInverted) predicate = GenerateNegatedPredicate(predicate);

  // Verify that object has behavior.
  vector<gd::String> behaviors =
      GetObjectsContainersList().GetBehaviorsOfObject(objectName);
  if (find(behaviors.begin(), behaviors.end(), behaviorName) ==
      behaviors.end()) {
    cout << "Error: bad behavior \"" << behaviorName
         << "\" requested for object \'" << objectName
         << "\" (condition: " << instrInfos.GetFullName() << ")." << endl;
  } else {
    conditionCode +=
        "for (var i = 0, k = 0, l = " + GetObjectListName(objectName, context) +
        ".length;i<l;++i) {\n";
    conditionCode += "    if ( " + predicate + " ) {\n";
    conditionCode += "        " +
                     GenerateBooleanFullName(returnBoolean, context) +
                     " = true;\n";
    conditionCode += "        " + GetObjectListName(objectName, context) +
                     "[k] = " + GetObjectListName(objectName, context) +
                     "[i];\n";
    conditionCode += "        ++k;\n";
    conditionCode += "    }\n";
    conditionCode += "}\n";
    conditionCode += GetObjectListName(objectName, context) + ".length = k;\n";
  }

  return conditionCode;
}

gd::String EventsCodeGenerator::GenerateRelationalOperation(
    const gd::String& relationalOperator,
    const gd::String& lhs,
    const gd::String& rhs) {
  if (relationalOperator == "startsWith") {
    return "(" + lhs + ").startsWith(" + rhs + ")";
  }
  if (relationalOperator == "endsWith") {
    return "(" + lhs + ").endsWith(" + rhs + ")";
  }
  if (relationalOperator == "contains") {
    return "(" + lhs + ").includes(" + rhs + ")";
  }
  return gd::EventsCodeGenerator::GenerateRelationalOperation(
      relationalOperator, lhs, rhs);
}

gd::String EventsCodeGenerator::GenerateObjectAction(
    const gd::String& objectName,
    const gd::ObjectMetadata& objInfo,
    const gd::String& functionCallName,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context,
    const gd::String& optionalAsyncCallbackName) {
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
          objectPart + functionCallName,
          objectPart +
              instrInfos.codeExtraInformation.optionalAssociatedInstruction,
          1);
    else if (instrInfos.codeExtraInformation.accessType ==
             gd::InstructionMetadata::ExtraInformation::Mutators)
      call = GenerateMutatorCall(
          instrInfos, arguments, objectPart + functionCallName, 1);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos, arguments, objectPart + functionCallName, 1);
  } else {
    call = objectPart + functionCallName + "(" +
           GenerateArgumentsList(arguments, 1) + ")";
  }

  if (!optionalAsyncCallbackName.empty()) {
    actionCode += "{\nconst asyncTaskGroup = new gdjs.TaskGroup();\n";
    call = "asyncTaskGroup.addTask(" + call + ")";
  }

  actionCode +=
      "for(var i = 0, len = " + GetObjectListName(objectName, context) +
      ".length ;i < len;++i) {\n";
  actionCode += "    " + call + ";\n";
  actionCode += "}\n";

  if (!optionalAsyncCallbackName.empty()) {
    actionCode +=
        "runtimeScene.getAsyncTasksManager().addTask(asyncTaskGroup, " +
        optionalAsyncCallbackName + ")\n}";
  }

  return actionCode;
}

gd::String EventsCodeGenerator::GenerateBehaviorAction(
    const gd::String& objectName,
    const gd::String& behaviorName,
    const gd::BehaviorMetadata& autoInfo,
    const gd::String& functionCallName,
    const std::vector<gd::String>& arguments,
    const gd::InstructionMetadata& instrInfos,
    gd::EventsCodeGenerationContext& context,
    const gd::String& optionalAsyncCallbackName) {
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
          objectPart + functionCallName,
          objectPart +
              instrInfos.codeExtraInformation.optionalAssociatedInstruction,
          2);
    else if (instrInfos.codeExtraInformation.accessType ==
             gd::InstructionMetadata::ExtraInformation::Mutators)
      call = GenerateMutatorCall(
          instrInfos, arguments, objectPart + functionCallName, 2);
    else
      call = GenerateCompoundOperatorCall(
          instrInfos, arguments, objectPart + functionCallName, 2);
  } else {
    call = objectPart + functionCallName + "(" +
           GenerateArgumentsList(arguments, 2) + ")";
  }

  // Verify that object has behavior.
  vector<gd::String> behaviors =
      GetObjectsContainersList().GetBehaviorsOfObject(objectName);
  if (find(behaviors.begin(), behaviors.end(), behaviorName) ==
      behaviors.end()) {
    cout << "Error: bad behavior \"" << behaviorName
         << "\" requested for object \'" << objectName
         << "\" (action: " << instrInfos.GetFullName() << ")." << endl;
  } else {
    if (!optionalAsyncCallbackName.empty()) {
      actionCode += "{\n  const asyncTaskGroup = new gdjs.TaskGroup();\n";
      call = "asyncTaskGroup.addTask(" + call + ")";
    }

    actionCode +=
        "for(var i = 0, len = " + GetObjectListName(objectName, context) +
        ".length ;i < len;++i) {\n";
    actionCode += "    " + call + ";\n";
    actionCode += "}\n";

    if (!optionalAsyncCallbackName.empty()) {
      actionCode +=
          "runtimeScene.getAsyncTasksManager().addTask(asyncTaskGroup, " +
          optionalAsyncCallbackName + ");\n  };";
    }
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
  auto declareObjectListFromParent =
      [this](gd::String object, gd::EventsCodeGenerationContext& context) {
        gd::String objectListName = GetObjectListName(object, context);
        if (!context.GetParentContext()) {
          std::cout
              << "ERROR: During code generation, a context tried to use an "
                 "already declared object list without having a parent"
              << std::endl;
          return "/* Could not declare " + objectListName + " */";
        }

        if (context.ShouldUseAsyncObjectsList(object)) {
          gd::String copiedListName = "asyncObjectsList.getObjects(" +
                                      ConvertToStringExplicit(object) + ")";
          return "gdjs.copyArray(" + copiedListName + ", " + objectListName +
                 ");\n";
        }

        //*Optimization*: Avoid expensive copy of the object list if we're using
        // the same list as the one from the parent context.
        if (context.IsSameObjectsList(object, *context.GetParentContext()))
          return "/* Reuse " + objectListName + " */";

        gd::String copiedListName =
            GetObjectListName(object, *context.GetParentContext());
        return "gdjs.copyArray(" + copiedListName + ", " + objectListName +
               ");\n";
      };

  gd::String declarationsCode;
  for (auto object : context.GetObjectsListsToBeDeclared()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclaredByParents(object)) {
      objectListDeclaration += "gdjs.copyArray(" +
                               GenerateAllInstancesGetterCode(object, context) +
                               ", " + GetObjectListName(object, context) + ");";
    } else
      objectListDeclaration = declareObjectListFromParent(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }
  for (auto object : context.GetObjectsListsToBeEmptyIfJustDeclared()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclaredByParents(object)) {
      objectListDeclaration =
          GetObjectListName(object, context) + ".length = 0;\n";
    } else
      objectListDeclaration = declareObjectListFromParent(object, context);

    declarationsCode += objectListDeclaration + "\n";
  }
  for (auto object : context.GetObjectsListsToBeDeclaredEmpty()) {
    gd::String objectListDeclaration = "";
    if (!context.ObjectAlreadyDeclaredByParents(object)) {
      objectListDeclaration =
          GetObjectListName(object, context) + ".length = 0;\n";
    } else
      objectListDeclaration =
          GetObjectListName(object, context) + ".length = 0;\n";

    declarationsCode += objectListDeclaration + "\n";
  }

  return declarationsCode;
}

gd::String EventsCodeGenerator::GenerateAllInstancesGetterCode(
    const gd::String& objectName, gd::EventsCodeGenerationContext& context) {
  if (HasProjectAndLayout()) {
    return "runtimeScene.getObjects(" + ConvertToStringExplicit(objectName) +
           ")";
  } else {
    return "eventsFunctionContext.getObjects(" +
           ConvertToStringExplicit(objectName) + ")";
  }
}

gd::String EventsCodeGenerator::GenerateEventsListCode(
    gd::EventsList& events, gd::EventsCodeGenerationContext& context) {
  // *Optimization*: generating all JS code of events in a single, enormous
  // function is badly handled by JS engines and in particular the garbage
  // collectors, leading to intermittent lag/freeze while the garbage collector
  // is running. This is especially noticeable on Android devices. To reduce the
  // stress on the JS engines, we generate a new function for each list of
  // events.

  gd::String code =
      gd::EventsCodeGenerator::GenerateEventsListCode(events, context);

  gd::String parametersCode = GenerateEventsParameters(context);

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

  outputCode +=
      GenerateBooleanInitializationToFalse("isConditionTrue", context);

  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    if (cId != 0) {
      outputCode += "if (" +
                    GenerateBooleanFullName("isConditionTrue", context) +
                    ") {\n";
    }
    gd::String conditionCode =
        GenerateConditionCode(conditions[cId], "isConditionTrue", context);
    if (!conditions[cId].GetType().empty()) {
      outputCode +=
          GenerateBooleanFullName("isConditionTrue", context) + " = false;\n";
      outputCode += conditionCode;
    }
  }
  // Close nested "if".
  for (std::size_t cId = 0; cId < conditions.size(); ++cId) {
    if (cId != 0) outputCode += "}\n";
  }

  maxConditionsListsSize = std::max(maxConditionsListsSize, conditions.size());

  return outputCode;
}

gd::String EventsCodeGenerator::GenerateParameterCodes(
    const gd::Expression& parameter,
    const gd::ParameterMetadata& metadata,
    gd::EventsCodeGenerationContext& context,
    const gd::String& lastObjectName,
    std::vector<std::pair<gd::String, gd::String> >*
        supplementaryParametersTypes) {
  gd::String argOutput;

  // Code only parameter type
  if (metadata.GetType() == "currentScene") {
    argOutput = "runtimeScene";
  }
  // Code only parameter type
  else if (metadata.GetType() == "objectsContext") {
    argOutput =
        "(typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext "
        ": runtimeScene)";
  }
  // Code only parameter type
  else if (metadata.GetType() == "eventsFunctionContext") {
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
      [this](const std::vector<gd::String>& declaredObjectNames,
             const gd::EventsCodeGenerationContext& context,
             const std::vector<gd::String>& notDeclaredObjectNames = {}) {
        // The map name must be unique for each set of objects lists.
        // We generate it from the objects lists names.
        gd::String objectsMapName = GetCodeNamespaceAccessor() + "mapOf";
        gd::String mapDeclaration;

        // Map each declared object to its list.
        for (auto& objectName : declaredObjectNames) {
          objectsMapName +=
              ManObjListName(GetObjectListName(objectName, context));

          if (!mapDeclaration.empty()) mapDeclaration += ", ";
          mapDeclaration += "\"" + ConvertToString(objectName) +
                            "\": " + GetObjectListName(objectName, context);
        }

        // Map each object not declared to an empty list.
        // Useful for parameters willing to get objects lists without
        // picking the objects for future instructions.
        for (auto& objectName : notDeclaredObjectNames) {
          objectsMapName += "Empty" + ManObjListName(objectName);

          if (!mapDeclaration.empty()) mapDeclaration += ", ";
          mapDeclaration += "\"" + ConvertToString(objectName) + "\": []";
        }

        // TODO: this should be de-duplicated.
        AddCustomCodeOutsideMain(objectsMapName + " = Hashtable.newFrom({" +
                                 mapDeclaration + "});\n");
        return objectsMapName;
      };

  gd::String output;
  if (type == "objectList") {
    std::vector<gd::String> realObjects =
        GetObjectsContainersList().ExpandObjectName(objectName,
                                                    context.GetCurrentObject());
    for (auto& objectName : realObjects) context.ObjectsListNeeded(objectName);

    gd::String objectsMapName = declareMapOfObjects(realObjects, context);
    output = objectsMapName;
  } else if (type == "objectListOrEmptyIfJustDeclared") {
    std::vector<gd::String> realObjects =
        GetObjectsContainersList().ExpandObjectName(objectName,
                                                    context.GetCurrentObject());
    for (auto& objectName : realObjects)
      context.ObjectsListNeededOrEmptyIfJustDeclared(objectName);

    gd::String objectsMapName = declareMapOfObjects(realObjects, context);
    output = objectsMapName;
  } else if (type == "objectListOrEmptyWithoutPicking") {
    std::vector<gd::String> realObjects =
        GetObjectsContainersList().ExpandObjectName(objectName,
                                                    context.GetCurrentObject());

    // Find the objects not yet declared, and handle them separately so they are
    // passed as empty object lists.
    std::vector<gd::String> objectToBeDeclaredNames;
    std::vector<gd::String> objectNotYetDeclaredNames;
    for (auto& objectName : realObjects) {
      if (context.ObjectAlreadyDeclaredByParents(objectName) ||
          context.IsToBeDeclared(objectName)) {
        objectToBeDeclaredNames.push_back(objectName);
      } else {
        objectNotYetDeclaredNames.push_back(objectName);
      }
    }

    gd::String objectsMapName = declareMapOfObjects(
        objectToBeDeclaredNames, context, objectNotYetDeclaredNames);
    output = objectsMapName;
  } else if (type == "objectPtr") {
    std::vector<gd::String> realObjects =
        GetObjectsContainersList().ExpandObjectName(objectName,
                                                    context.GetCurrentObject());

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
    output = "runtimeScene.getScene().getVariables()";

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
        GetObjectsContainersList().ExpandObjectName(objectName,
                                                    context.GetCurrentObject());

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

gd::String EventsCodeGenerator::GenerateUpperScopeBooleanFullName(
    const gd::String& boolName,
    const gd::EventsCodeGenerationContext& context) {
  if (context.GetCurrentConditionDepth() <= 0)
    return "/* Code generation error: the referenced boolean can't exist as "
           "the context has a condition depth of 0. */";

  return boolName + "_" +
         gd::String::From(context.GetCurrentConditionDepth() - 1);
}

gd::String EventsCodeGenerator::GenerateBooleanInitializationToFalse(
    const gd::String& boolName,
    const gd::EventsCodeGenerationContext& context) {
  return "let " + GenerateBooleanFullName(boolName, context) + " = false;\n";
}

gd::String EventsCodeGenerator::GenerateBooleanFullName(
    const gd::String& boolName,
    const gd::EventsCodeGenerationContext& context) {
  return boolName + "_" + gd::String::From(context.GetCurrentConditionDepth());
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

gd::String EventsCodeGenerator::GeneratePropertyGetter(
    const gd::PropertiesContainer& propertiesContainer,
    const gd::NamedPropertyDescriptor& property,
    const gd::String& type,
    gd::EventsCodeGenerationContext& context) {
  bool isLocalProperty =
      projectScopedContainers.GetPropertiesContainersList()
          .GetBottomMostPropertiesContainer() == &propertiesContainer;

  gd::String propertyHolderCode =
      propertiesContainer.GetOwner() == gd::EventsFunctionsContainer::Behavior
          ? "eventsFunctionContext.getObjects(\"Object\")[0].getBehavior(" +
                GenerateGetBehaviorNameCode("Behavior") + ")"
          : (propertiesContainer.GetOwner() ==
                     gd::EventsFunctionsContainer::Object
                 ? "eventsFunctionContext.getObjects(\"Object\")[0]"
                 : "eventsFunctionContext.getProperties()");
  gd::String propertyGetterCode =
      propertyHolderCode + "." +
      (isLocalProperty
           ? BehaviorCodeGenerator::GetBehaviorPropertyGetterName(
                 property.GetName())
           : BehaviorCodeGenerator::GetBehaviorSharedPropertyGetterName(
                 property.GetName())) +
      "()";

  if (type == "number|string") {
    if (property.GetType() == "Number") {
      return propertyGetterCode;
    } else if (property.GetType() == "Boolean") {
      return "(" + propertyGetterCode + " ? \"true\" : \"false\")";
    } else {
      // Assume type is String or equivalent.
      return propertyGetterCode;
    }
  } else if (type == "string") {
    if (property.GetType() == "Number") {
      return "(\"\" + " + propertyGetterCode + ")";
    } else if (property.GetType() == "Boolean") {
      return "(" + propertyGetterCode + " ? \"true\" : \"false\")";
    } else {
      // Assume type is String or equivalent.
      return propertyGetterCode;
    }
  } else if (type == "number") {
    if (property.GetType() == "Number") {
      return propertyGetterCode;
    } else if (property.GetType() == "Boolean") {
      return "(" + propertyGetterCode + " ? 1 : 0)";
    } else {
      // Assume type is String or equivalent.
      return "(Number(" + propertyGetterCode + ") || 0)";
    }
  } else {
    gd::LogError("Unrecognized expression type for using a property: " + type);
    return "0 /* Unrecognized type */";
  }
}

gd::String EventsCodeGenerator::GenerateParameterGetter(
    const gd::ParameterMetadata& parameter,
    const gd::String& type,
    gd::EventsCodeGenerationContext& context) {
  gd::String parameterGetterCode =
      "eventsFunctionContext.getArgument(" +
      ConvertToStringExplicit(parameter.GetName()) + ")";

  if (type == "number|string") {
    if (parameter.GetValueTypeMetadata().IsNumber()) {
      return parameterGetterCode;
    } else if (parameter.GetValueTypeMetadata().IsBoolean()) {
      return "(" + parameterGetterCode + " ? \"true\" : \"false\")";
    } else {
      // Assume type is String or equivalent.
      return parameterGetterCode;
    }
  } else if (type == "string") {
    if (parameter.GetValueTypeMetadata().IsNumber()) {
      return "(\"\" + " + parameterGetterCode + ")";
    } else if (parameter.GetValueTypeMetadata().IsBoolean()) {
      return "(" + parameterGetterCode + " ? \"true\" : \"false\")";
    } else {
      // Assume type is String or equivalent.
      return parameterGetterCode;
    }
  } else if (type == "number") {
    if (parameter.GetValueTypeMetadata().IsNumber()) {
      return parameterGetterCode;
    } else if (parameter.GetValueTypeMetadata().IsBoolean()) {
      return "(" + parameterGetterCode + " ? 1 : 0)";
    } else {
      // Assume type is String or equivalent.
      return "(Number(" + parameterGetterCode + ") || 0)";
    }
  } else {
    gd::LogError("Unrecognized expression type for using a parameter: " + type);
    return "0 /* Unrecognized type */";
  }
}

EventsCodeGenerator::EventsCodeGenerator(const gd::Project& project,
                                         const gd::Layout& layout)
    : gd::EventsCodeGenerator(project, layout, JsPlatform::Get()) {}

EventsCodeGenerator::EventsCodeGenerator(
    const gd::ProjectScopedContainers& projectScopedContainers)
    : gd::EventsCodeGenerator(JsPlatform::Get(), projectScopedContainers) {}

EventsCodeGenerator::~EventsCodeGenerator() {}

}  // namespace gdjs
