/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsExtensionCodeGenerator.h"
#include "EventsCodeGenerator.h"
#include "GDCore/Tools/Log.h"

namespace gdjs {
gd::String
EventsFunctionsExtensionCodeGenerator::GenerateFreeEventsFunctionCompleteCode(
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::String eventsFunctionCode =
      EventsCodeGenerator::GenerateEventsFunctionCode(project,
                                                      eventsFunction,
                                                      codeNamespace,
                                                      includeFiles,
                                                      compilationForRuntime);

  gd::String lifecycleRegistrationCode = "";
  if (gd::EventsFunctionsExtension::IsExtensionLifecycleEventsFunction(
          eventsFunction.GetName())) {
    lifecycleRegistrationCode = GenerateLifecycleFunctionRegistrationCode(
        eventsFunction, codeNamespace);
  }

  return eventsFunctionCode + "\n" + lifecycleRegistrationCode;
}

gd::String EventsFunctionsExtensionCodeGenerator::
    GenerateLifecycleFunctionRegistrationCode(
        const gd::EventsFunction& eventsFunction,
        const gd::String& codeNamespace) {
  const gd::String& eventsFunctionName = eventsFunction.GetName();
  if (!eventsFunction.GetParameters().empty()) {
    gd::LogError("The events function named \"" + eventsFunctionName +
                 "\" is an extension lifecycle but has parameters "
                 "(should not have any). Not generating lifecycle "
                 "registration code for it.");
    return "";
  }

  gd::String lifecycleRegistrationTemplateCode = "";
  if (eventsFunctionName == "onFirstSceneLoaded") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerFirstRuntimeSceneLoadedCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else if (eventsFunctionName == "onSceneLoaded") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerRuntimeSceneLoadedCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else if (eventsFunctionName == "onScenePreEvents") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerRuntimeScenePreEventsCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else if (eventsFunctionName == "onScenePostEvents") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerRuntimeScenePostEventsCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else if (eventsFunctionName == "onScenePaused") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerRuntimeScenePausedCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else if (eventsFunctionName == "onSceneResumed") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerRuntimeSceneResumedCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else if (eventsFunctionName == "onSceneUnloading") {
    lifecycleRegistrationTemplateCode += gd::String(R"jscode_template(
gdjs.registerRuntimeSceneUnloadingCallback(function(runtimeScene) {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
});
)jscode_template");
  } else {
    gd::LogError(
        "The code generation for this lifecycle events function is not handled "
        "properly in EventsFunctionsExtensionCodeGenerator: \"" +
        eventsFunctionName + "\"");
    return "";
  }

  return lifecycleRegistrationTemplateCode.FindAndReplace("CODE_NAMESPACE",
                                                          codeNamespace);
}

}  // namespace gdjs
