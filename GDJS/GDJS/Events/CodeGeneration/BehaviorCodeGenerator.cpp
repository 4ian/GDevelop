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
  return GenerateRuntimeBehaviorTemplateCode(
      extensionName,
      eventsBasedBehavior,
      codeNamespace,
      [&]() {
        gd::String runtimeBehaviorDataInitializationCode;
        for (auto& property :
             eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
          runtimeBehaviorDataInitializationCode +=
              property->IsHidden()
                  ? GenerateInitializePropertyFromDefaultValueCode(*property)
                  : GenerateInitializePropertyFromDataCode(*property);
        }

        return runtimeBehaviorDataInitializationCode;
      },
      [&]() {
        gd::String runtimeBehaviorPropertyMethodsCode;
        for (auto& property :
             eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
          runtimeBehaviorPropertyMethodsCode +=
              GenerateRuntimeBehaviorPropertyTemplateCode(
                  eventsBasedBehavior, codeNamespace, *property);
        }

        return runtimeBehaviorPropertyMethodsCode;
      },
      [&]() {
        gd::String runtimeBehaviorMethodsCode;
        for (auto& eventsFunction :
             eventsBasedBehavior.GetEventsFunctions().GetInternalVector()) {
          const gd::String& functionName =
              behaviorMethodMangledNames.find(eventsFunction->GetName()) !=
                      behaviorMethodMangledNames.end()
                  ? behaviorMethodMangledNames.find(eventsFunction->GetName())
                        ->second
                  : "UNKNOWN_FUNCTION_fix_behaviorMethodMangledNames_please";
          gd::String methodCodeNamespace =
              codeNamespace + "." + eventsBasedBehavior.GetName() +
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

        return runtimeBehaviorMethodsCode;
      });
}

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorTemplateCode(
    const gd::String& extensionName,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    std::function<gd::String()> generateInitializePropertiesCode,
    std::function<gd::String()> generateMethodsCode,
    std::function<gd::String()> generatePropertiesCode) {
  return gd::String(R"jscode_template(
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

    this._behaviorData = {};
    INITIALIZE_PROPERTIES_CODE

    if (this.onCreated) { this.onCreated(); }
};

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.thisIsARuntimeBehaviorConstructor = "EXTENSION_NAME::BEHAVIOR_NAME";

// Properties:
PROPERTIES_CODE

// Methods:
METHODS_CODE
)jscode_template")
      .FindAndReplace("EXTENSION_NAME", extensionName)
      .FindAndReplace("BEHAVIOR_NAME", eventsBasedBehavior.GetName())
      .FindAndReplace("BEHAVIOR_FULL_NAME", eventsBasedBehavior.GetFullName())
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace)
      .FindAndReplace("INITIALIZE_PROPERTIES_CODE",
                      generateInitializePropertiesCode())
      .FindAndReplace("PROPERTIES_CODE", generatePropertiesCode())
      .FindAndReplace("METHODS_CODE", generateMethodsCode());
  ;
}

gd::String BehaviorCodeGenerator::GenerateInitializePropertyFromDataCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this._behaviorData.PROPERTY_NAME = behaviorData.PROPERTY_NAME !== undefined ? behaviorData.PROPERTY_NAME : DEFAULT_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("DEFAULT_VALUE", GeneratePropertyValueCode(property));
}
gd::String
BehaviorCodeGenerator::GenerateInitializePropertyFromDefaultValueCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this._behaviorData.PROPERTY_NAME = DEFAULT_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("DEFAULT_VALUE", GeneratePropertyValueCode(property));
}

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorPropertyTemplateCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.GETTER_NAME = function() {
    return this._behaviorData.PROPERTY_NAME !== undefined ? this._behaviorData.PROPERTY_NAME : DEFAULT_VALUE;
};
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.SETTER_NAME = function(newValue) {
    this._behaviorData.PROPERTY_NAME = newValue;
};)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("GETTER_NAME",
                      GetBehaviorPropertyGetterName(property.GetName()))
      .FindAndReplace("SETTER_NAME",
                      GetBehaviorPropertySetterName(property.GetName()))
      .FindAndReplace("DEFAULT_VALUE", GeneratePropertyValueCode(property))
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace);
  ;
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
