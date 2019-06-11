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
    const std::map<gd::String, gd::String>& behaviorMethodMangledNames,
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

  gd::String runtimeBehaviorPropertyMethodsCode;
  for (auto& property :
       eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
    runtimeBehaviorPropertyMethodsCode +=
        GetRuntimeBehaviorPropertyTemplateCode()
            .FindAndReplace("PROPERTY_NAME", property->GetName())
            .FindAndReplace("GETTER_NAME",
                            GetBehaviorPropertyGetterName(property->GetName()))
            .FindAndReplace("SETTER_NAME",
                            GetBehaviorPropertySetterName(property->GetName()))
            .FindAndReplace("DEFAULT_VALUE",
                            GeneratePropertyValueCode(*property))
            .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                            eventsBasedBehavior.GetName())
            .FindAndReplace("CODE_NAMESPACE", codeNamespace);
  }

  gd::String runtimeBehaviorMethodsCode;
  for (auto& eventsFunction :
       eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
    const gd::String& functionName =
        behaviorMethodMangledNames.find(eventsFunction->GetName()) !=
                behaviorMethodMangledNames.end()
            ? behaviorMethodMangledNames.find(eventsFunction->GetName())->second
            : "UNKNOWN_FUNCTION_fix_behaviorMethodMangledNames_please";
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

  return runtimeBehaviorCode + runtimeBehaviorPropertyMethodsCode +
         runtimeBehaviorMethodsCode;
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
    this._behaviorData = behaviorData;

    if (this.onCreated) { this.onCreated(); }
};

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.thisIsARuntimeBehaviorConstructor = "EXTENSION_NAME::BEHAVIOR_NAME";

)jscode_template";
}

gd::String BehaviorCodeGenerator::GetRuntimeBehaviorPropertyTemplateCode() {
  return R"jscode_template(
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.GETTER_NAME = function() {
    return this._behaviorData.PROPERTY_NAME !== undefined ? this._behaviorData.PROPERTY_NAME : DEFAULT_VALUE;
};
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.SETTER_NAME = function(newValue) {
    this._behaviorData.PROPERTY_NAME = newValue;
};

)jscode_template";
}

gd::String BehaviorCodeGenerator::GeneratePropertyValueCode(
    const gd::PropertyDescriptor& property) {
  if (property.GetType() == "String" || property.GetType() == "Choice") {
    return EventsCodeGenerator::ConvertToStringExplicit(property.GetValue());
  } else if (property.GetType() == "Number") {
    return property.GetValue();
  } else if (property.GetType() == "Boolean") {  // TODO: Check if working
    return property.GetValue() == "true" ? "true" : "false";
  }

  return "0 /* Error: property was of an unrecognized type */";
}

}  // namespace gdjs
