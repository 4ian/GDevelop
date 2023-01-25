/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorCodeGenerator.h"

#include "EventsCodeGenerator.h"

namespace gdjs {

gd::String BehaviorCodeGenerator::doStepPreEventsFunctionName =
    "doStepPreEvents";

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorCompleteCode(
    const gd::String& extensionName,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    const std::map<gd::String, gd::String>& behaviorMethodMangledNames,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  auto& eventsFunctionsVector =
      eventsBasedBehavior.GetEventsFunctions().GetInternalVector();

  auto generateInitializePropertiesCode = [&]() {
    gd::String runtimeBehaviorDataInitializationCode;
    for (auto& property :
          eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
      runtimeBehaviorDataInitializationCode +=
          property->IsHidden()
              ? GenerateInitializePropertyFromDefaultValueCode(*property)
              : GenerateInitializePropertyFromDataCode(*property);
    }

    return runtimeBehaviorDataInitializationCode;
  };

  auto generatePropertiesCode = [&]() {
    gd::String runtimeBehaviorPropertyMethodsCode;
    for (auto& property :
          eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
      runtimeBehaviorPropertyMethodsCode +=
          GenerateRuntimeBehaviorPropertyTemplateCode(
              eventsBasedBehavior, *property);
    }

    return runtimeBehaviorPropertyMethodsCode;
  };

  auto generateInitializeSharedPropertiesCode = [&]() {
    gd::String runtimeBehaviorSharedDataInitializationCode;
    for (auto& property :
          eventsBasedBehavior.GetSharedPropertyDescriptors().GetInternalVector()) {
      runtimeBehaviorSharedDataInitializationCode +=
          property->IsHidden()
              ? GenerateInitializeSharedPropertyFromDefaultValueCode(*property)
              : GenerateInitializeSharedPropertyFromDataCode(*property);
    }

    return runtimeBehaviorSharedDataInitializationCode;
  };

  auto generateSharedPropertiesCode = [&]() {
    gd::String runtimeBehaviorSharedPropertyMethodsCode;
    for (auto& property :
          eventsBasedBehavior.GetSharedPropertyDescriptors().GetInternalVector()) {
      runtimeBehaviorSharedPropertyMethodsCode +=
          GenerateRuntimeBehaviorSharedPropertyTemplateCode(
              eventsBasedBehavior, *property);
    }

    return runtimeBehaviorSharedPropertyMethodsCode;
  };

  // TODO: Update code generation to be able to generate methods (which would allow
  // for a cleaner output, not having to add methods to the prototype).
  auto generateMethodsCode = [&]() {
    gd::String runtimeBehaviorMethodsCode;
    for (auto& eventsFunction : eventsFunctionsVector) {
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
              eventsBasedBehavior,
              *eventsFunction,
              methodCodeNamespace,
              methodFullyQualifiedName,
              "that._onceTriggers",
              functionName == doStepPreEventsFunctionName
                  ? GenerateDoStepPreEventsPreludeCode()
                  : "",
              includeFiles,
              compilationForRuntime);

      // Compatibility with GD <= 5.0 beta 75
      if (functionName == "onOwnerRemovedFromScene") {
        runtimeBehaviorMethodsCode +=
            GenerateBehaviorOnDestroyToDeprecatedOnOwnerRemovedFromScene(
                eventsBasedBehavior, codeNamespace);
      }
      // end of compatibility code
    }

    bool hasDoStepPreEventsFunction =
        eventsBasedBehavior.GetEventsFunctions().HasEventsFunctionNamed(
            doStepPreEventsFunctionName);
    if (!hasDoStepPreEventsFunction) {
      runtimeBehaviorMethodsCode +=
          GenerateDefaultDoStepPreEventsFunctionCode(eventsBasedBehavior,
                                                      codeNamespace);
    }

    return runtimeBehaviorMethodsCode;
  };

  auto generateUpdateFromBehaviorDataCode = [&]() {
    gd::String updateFromBehaviorCode;
    for (auto& property :
          eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
      updateFromBehaviorCode +=
          GenerateUpdatePropertyFromBehaviorDataCode(
              eventsBasedBehavior, *property);
    }

    return updateFromBehaviorCode;
  };

  return GenerateRuntimeBehaviorTemplateCode(
      extensionName,
      eventsBasedBehavior,
      codeNamespace,
      generateInitializePropertiesCode,
      generatePropertiesCode,
      generateInitializeSharedPropertiesCode,
      generateSharedPropertiesCode,
      generateMethodsCode,
      generateUpdateFromBehaviorDataCode);
}

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorTemplateCode(
    const gd::String& extensionName,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    std::function<gd::String()> generateInitializePropertiesCode,
    std::function<gd::String()> generatePropertiesCode,
    std::function<gd::String()> generateInitializeSharedPropertiesCode,
    std::function<gd::String()> generateSharedPropertiesCode,
    std::function<gd::String()> generateMethodsCode,
    std::function<gd::String()> generateUpdateFromBehaviorDataCode) {
  return gd::String(R"jscode_template(
CODE_NAMESPACE = CODE_NAMESPACE || {};

/**
 * Behavior generated from BEHAVIOR_FULL_NAME
 */
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME = class RUNTIME_BEHAVIOR_CLASSNAME extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    INITIALIZE_PROPERTIES_CODE
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    UPDATE_FROM_BEHAVIOR_DATA_CODE

    return true;
  }

  // Properties:
  PROPERTIES_CODE
}

/**
 * Shared data generated from BEHAVIOR_FULL_NAME
 */
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.SharedData = class RUNTIME_BEHAVIOR_CLASSNAMESharedData {
  constructor(sharedData) {
    INITIALIZE_SHARED_PROPERTIES_CODE
  }
  
  // Shared properties:
  SHARED_PROPERTIES_CODE
}

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._EXTENSION_NAME_RUNTIME_BEHAVIOR_CLASSNAMESharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._EXTENSION_NAME_RUNTIME_BEHAVIOR_CLASSNAMESharedData = new CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.SharedData(
      initialData
    );
  }
  return instanceContainer._EXTENSION_NAME_RUNTIME_BEHAVIOR_CLASSNAMESharedData;
}

// Methods:
METHODS_CODE

gdjs.registerBehavior("EXTENSION_NAME::BEHAVIOR_NAME", CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME);
)jscode_template")
      .FindAndReplace("EXTENSION_NAME", extensionName)
      .FindAndReplace("BEHAVIOR_NAME", eventsBasedBehavior.GetName())
      .FindAndReplace("BEHAVIOR_FULL_NAME", eventsBasedBehavior.GetFullName())
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace)
      .FindAndReplace("INITIALIZE_SHARED_PROPERTIES_CODE",
                      generateInitializeSharedPropertiesCode())
      .FindAndReplace("INITIALIZE_PROPERTIES_CODE",
                      generateInitializePropertiesCode())
      .FindAndReplace("UPDATE_FROM_BEHAVIOR_DATA_CODE", generateUpdateFromBehaviorDataCode())
      // It must be done before PROPERTIES_CODE.
      .FindAndReplace("SHARED_PROPERTIES_CODE", generateSharedPropertiesCode())
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

gd::String BehaviorCodeGenerator::GenerateInitializeSharedPropertyFromDataCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this.PROPERTY_NAME = sharedData.PROPERTY_NAME !== undefined ? sharedData.PROPERTY_NAME : DEFAULT_VALUE;)jscode_template")
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

gd::String
BehaviorCodeGenerator::GenerateInitializeSharedPropertyFromDefaultValueCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this.PROPERTY_NAME = DEFAULT_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("DEFAULT_VALUE", GeneratePropertyValueCode(property));
}

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorPropertyTemplateCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
  GETTER_NAME() {
    return this._behaviorData.PROPERTY_NAME !== undefined ? this._behaviorData.PROPERTY_NAME : DEFAULT_VALUE;
  }
  SETTER_NAME(newValue) {
    this._behaviorData.PROPERTY_NAME = newValue;
  }TOGGLE_PROPERTY_CODE)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("GETTER_NAME",
                      GetBehaviorPropertyGetterName(property.GetName()))
      .FindAndReplace("SETTER_NAME",
                      GetBehaviorPropertySetterName(property.GetName()))
      .FindAndReplace("DEFAULT_VALUE", GeneratePropertyValueCode(property))
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace(
          "TOGGLE_PROPERTY_CODE",
          (property.GetType() == "Boolean"
               ? GenerateToggleBooleanPropertyTemplateCode(
                     GetBehaviorPropertyToggleFunctionName(property.GetName()),
                     GetBehaviorPropertyGetterName(property.GetName()),
                     GetBehaviorPropertySetterName(property.GetName()))
               : ""));
}

gd::String BehaviorCodeGenerator::GenerateToggleBooleanPropertyTemplateCode(
    const gd::String &toggleFunctionName, const gd::String &getterName,
    const gd::String &setterName) {
  return gd::String(R"jscode_template(
  TOGGLE_NAME() {
    this.SETTER_NAME(!this.GETTER_NAME());
  })jscode_template")
      .FindAndReplace("TOGGLE_NAME", toggleFunctionName)
      .FindAndReplace("GETTER_NAME", getterName)
      .FindAndReplace("SETTER_NAME", setterName);
}

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorSharedPropertyTemplateCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
  GETTER_NAME() {
    return this.PROPERTY_NAME !== undefined ? this.PROPERTY_NAME : DEFAULT_VALUE;
  }
  SETTER_NAME(newValue) {
    this.PROPERTY_NAME = newValue;
  }TOGGLE_PROPERTY_CODE)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("GETTER_NAME",
                      GetBehaviorSharedPropertyGetterInternalName(property.GetName()))
      .FindAndReplace("SETTER_NAME",
                      GetBehaviorSharedPropertySetterInternalName(property.GetName()))
      .FindAndReplace("DEFAULT_VALUE", GeneratePropertyValueCode(property))
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace(
          "TOGGLE_PROPERTY_CODE",
          (property.GetType() == "Boolean"
               ? GenerateToggleBooleanPropertyTemplateCode(
                     GetBehaviorSharedPropertyToggleFunctionInternalName(property.GetName()),
                     GetBehaviorSharedPropertyGetterInternalName(property.GetName()),
                     GetBehaviorSharedPropertySetterInternalName(property.GetName()))
               : ""));
}

gd::String BehaviorCodeGenerator::GenerateUpdatePropertyFromBehaviorDataCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    if (oldBehaviorData.PROPERTY_NAME !== newBehaviorData.PROPERTY_NAME)
      this._behaviorData.PROPERTY_NAME = newBehaviorData.PROPERTY_NAME;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName());
}

gd::String BehaviorCodeGenerator::GeneratePropertyValueCode(
    const gd::PropertyDescriptor& property) {
  if (property.GetType() == "String" ||
      property.GetType() == "Choice" ||
      property.GetType() == "Color" ||
      property.GetType() == "Behavior") {
    return EventsCodeGenerator::ConvertToStringExplicit(property.GetValue());
  } else if (property.GetType() == "Number") {
    return "Number(" +
           EventsCodeGenerator::ConvertToStringExplicit(property.GetValue()) +
           ") || 0";
  } else if (property.GetType() == "Boolean") {  // TODO: Check if working
    return property.GetValue() == "true" ? "true" : "false";
  }

  return "0 /* Error: property was of an unrecognized type */";
}

gd::String BehaviorCodeGenerator::
    GenerateBehaviorOnDestroyToDeprecatedOnOwnerRemovedFromScene(
        const gd::EventsBasedBehavior& eventsBasedBehavior,
        const gd::String& codeNamespace) {
  return gd::String(R"jscode_template(
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.onDestroy = function() {
  // Redirect call to onOwnerRemovedFromScene (the old name of onDestroy)
  if (this.onOwnerRemovedFromScene) this.onOwnerRemovedFromScene();
};
)jscode_template")
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace);
}

gd::String BehaviorCodeGenerator::GenerateDefaultDoStepPreEventsFunctionCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace) {
  return gd::String(R"jscode_template(
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.prototype.doStepPreEvents = function() {
  PRELUDE_CODE
};
)jscode_template")
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace)
      .FindAndReplace("PRELUDE_CODE", GenerateDoStepPreEventsPreludeCode());
}

gd::String BehaviorCodeGenerator::GenerateDoStepPreEventsPreludeCode() {
  return "this._onceTriggers.startNewFrame();";
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertyGetterName(
    const gd::String& propertyName) {
  return "_sharedData." + GetBehaviorSharedPropertyGetterInternalName(propertyName);
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertySetterName(
    const gd::String& propertyName) {
  return "_sharedData." + GetBehaviorSharedPropertySetterInternalName(propertyName);
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertyToggleFunctionName(
    const gd::String& propertyName) {
  return "_sharedData." + GetBehaviorSharedPropertyToggleFunctionInternalName(propertyName);
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertyGetterInternalName(
    const gd::String& propertyName) {
  return "_get" + propertyName;
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertySetterInternalName(
    const gd::String& propertyName) {
  return "_set" + propertyName;
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertyToggleFunctionInternalName(
    const gd::String& propertyName) {
  return "_toggle" + propertyName;
}
}  // namespace gdjs
