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
    const gd::String& codeNamespace) {
  return GetRuntimeBehaviorTemplateCode()
      .FindAndReplace("EXTENSION_NAME", extensionName)
      .FindAndReplace("BEHAVIOR_NAME", eventsBasedBehavior.GetName())
      .FindAndReplace("BEHAVIOR_FULL_NAME", eventsBasedBehavior.GetFullName())
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace);
}

gd::String BehaviorCodeGenerator::GetRuntimeBehaviorTemplateCode() {
  return R"jscode_template(
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

}  // namespace gdjs
