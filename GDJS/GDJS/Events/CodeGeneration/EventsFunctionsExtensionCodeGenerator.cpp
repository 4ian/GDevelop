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
    const gd::EventsFunctionsExtension& extension,
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::String lifecycleCleanupCode =
      gd::String(R"jscode_template(
if (typeof CODE_NAMESPACE !== "undefined") {
  CODE_NAMESPACE.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}
)jscode_template")
          .FindAndReplace("CODE_NAMESPACE", codeNamespace);

  gd::String eventsFunctionCode =
      EventsCodeGenerator::GenerateEventsFunctionCode(project,
                                                      extension,
                                                      eventsFunction,
                                                      codeNamespace,
                                                      includeFiles,
                                                      compilationForRuntime);

  gd::String lifecycleRegistrationCode = "";
  lifecycleRegistrationCode +=
      gd::String("CODE_NAMESPACE.registeredGdjsCallbacks = [];")
          .FindAndReplace("CODE_NAMESPACE", codeNamespace);

  if (gd::EventsFunctionsExtension::IsExtensionLifecycleEventsFunction(
          eventsFunction.GetName())) {
    lifecycleRegistrationCode += GenerateLifecycleFunctionRegistrationCode(
        eventsFunction, codeNamespace);
  }

  // clang-format off
  return lifecycleCleanupCode + "\n" +
         eventsFunctionCode + "\n" +
         lifecycleRegistrationCode;
  // clang-format on
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

  auto generateCallbackRegistrationCode =
      [&](const gd::String& registerFunctionName) {
        return gd::String(R"jscode_template(
CODE_NAMESPACE.registeredGdjsCallbacks.push((runtimeScene) => {
    CODE_NAMESPACE.func(runtimeScene, runtimeScene);
})
gdjs.REGISTER_FUNCTION_NAME(CODE_NAMESPACE.registeredGdjsCallbacks[CODE_NAMESPACE.registeredGdjsCallbacks.length - 1]);
)jscode_template")
            .FindAndReplace("CODE_NAMESPACE", codeNamespace)
            .FindAndReplace("REGISTER_FUNCTION_NAME", registerFunctionName);
      };

  if (eventsFunctionName == "onFirstSceneLoaded") {
    return generateCallbackRegistrationCode(
        "registerFirstRuntimeSceneLoadedCallback");
  } else if (eventsFunctionName == "onSceneLoaded") {
    return generateCallbackRegistrationCode(
        "registerRuntimeSceneLoadedCallback");
  } else if (eventsFunctionName == "onScenePreEvents") {
    return generateCallbackRegistrationCode(
        "registerRuntimeScenePreEventsCallback");
  } else if (eventsFunctionName == "onScenePostEvents") {
    return generateCallbackRegistrationCode(
        "registerRuntimeScenePostEventsCallback");
  } else if (eventsFunctionName == "onScenePaused") {
    return generateCallbackRegistrationCode(
        "registerRuntimeScenePausedCallback");
  } else if (eventsFunctionName == "onSceneResumed") {
    return generateCallbackRegistrationCode(
        "registerRuntimeSceneResumedCallback");
  } else if (eventsFunctionName == "onSceneUnloading") {
    return generateCallbackRegistrationCode(
        "registerRuntimeSceneUnloadingCallback");
  } else {
    gd::LogError(
        "The code generation for this lifecycle events function is not handled "
        "properly in EventsFunctionsExtensionCodeGenerator: \"" +
        eventsFunctionName + "\"");
    return "";
  }
}

}  // namespace gdjs
