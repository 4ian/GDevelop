/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorCodeGenerator.h"

namespace gdjs {
gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorCompleteCode(
    const gd::String& extensionName,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    const std::map<gd::String, gd::String>& functionMangledNames,
    const std::map<gd::String, gd::String>& internalFunctionMangledNames) {
  gd::String runtimeBehaviorCode = GetRuntimeBehaviorTemplateCode()
      .FindAndReplace("EXTENSION_NAME", extensionName)
      .FindAndReplace("BEHAVIOR_NAME", eventsBasedBehavior.GetName())
      .FindAndReplace("BEHAVIOR_FULL_NAME", eventsBasedBehavior.GetFullName())
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace);

  gd::String runtimeBehaviorMethodsCode;
  for(auto & eventsFunction: eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {

    const gd::String& functionName = 
      functionMangledNames.find(eventsFunction->GetName()) != functionMangledNames.end() ? 
      functionMangledNames.find(eventsFunction->GetName())->second :
      "UNKNOWN_FUNCTION_fix_functionMangledNames_please";
    const gd::String& internalFunctionName = 
      internalFunctionMangledNames.find(eventsFunction->GetName()) != internalFunctionMangledNames.end() ? 
      internalFunctionMangledNames.find(eventsFunction->GetName())->second :
      "UNKNOWN_FUNCTION_fix_internalFunctionMangledNames_please";

    runtimeBehaviorMethodsCode += GetRuntimeBehaviorMethodTemplateCode()
      .FindAndReplace("INTERNAL_FUNCTION_NAME", internalFunctionName)
      .FindAndReplace("FUNCTION_NAME", functionName)
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace);
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
};

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.thisIsARuntimeBehaviorConstructor = "EXTENSION_NAME::BEHAVIOR_NAME";

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.onDeActivate = function() {
};

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.doStepPreEvents = function(runtimeScene) {
};

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.doStepPostEvents = function(runtimeScene) {
};

)jscode_template";
}
gd::String BehaviorCodeGenerator::GetRuntimeBehaviorMethodTemplateCode() {
  return R"jscode_template(
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.FUNCTION_NAME = function(runtimeScene) {
  INTERNAL_FUNCTION_NAME(this._runtimeScene, this/*TODO*/);
};

)jscode_template";
}

}  // namespace gdjs
