/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorCodeGenerator.h"
#include "EventsCodeGenerator.h"

namespace gdjs {
gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorCompleteCode(
    const gd::String& extensionName,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    const std::map<gd::String, gd::String>& functionMangledNames,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::String runtimeBehaviorCode =
      GetRuntimeBehaviorTemplateCode()
          .FindAndReplace("EXTENSION_NAME", extensionName)
          .FindAndReplace("BEHAVIOR_NAME", eventsBasedBehavior.GetName())
          .FindAndReplace("BEHAVIOR_FULL_NAME",
                          eventsBasedBehavior.GetFullName())
          .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                          eventsBasedBehavior.GetName())
          .FindAndReplace("CODE_NAMESPACE", codeNamespace);

  gd::String runtimeBehaviorMethodsCode;
  for (auto& eventsFunction :
       eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
    const gd::String& functionName =
        functionMangledNames.find(eventsFunction->GetName()) !=
                functionMangledNames.end()
            ? functionMangledNames.find(eventsFunction->GetName())->second
            : "UNKNOWN_FUNCTION_fix_functionMangledNames_please";
    gd::String methodCodeNamespace = codeNamespace + "." +
                                     eventsBasedBehavior.GetName() +
                                     ".prototype." + functionName + "Context";
    gd::String methodFullyQualifiedName = codeNamespace + "." +
                                          eventsBasedBehavior.GetName() +
                                          ".prototype." + functionName;
    runtimeBehaviorMethodsCode +=
        EventsCodeGenerator::GenerateBehaviorEventsFunctionCode(
            project,
            *eventsFunction,
            methodCodeNamespace,
            methodFullyQualifiedName,
            includeFiles,
            compilationForRuntime);
  }

  return runtimeBehaviorCode + runtimeBehaviorMethodsCode;
}

gd::String BehaviorCodeGenerator::GetRuntimeBehaviorTemplateCode() {
  return R"jscode_template(
CODE_NAMESPACE = CODE_NAMESPACE || {};

/**
 * Behavior generated from BEHAVIOR_FULL_NAME
 * @class RUNTIME_BEHAVIOR_CLASSNAME
 * @extends gdjs.RuntimeBehavior
 * @constructor
 */
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);
    this._runtimeScene = runtimeScene;
};

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.thisIsARuntimeBehaviorConstructor = "EXTENSION_NAME::BEHAVIOR_NAME";

)jscode_template";
}

}  // namespace gdjs
