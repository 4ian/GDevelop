/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorCodeGenerator.h"

#include "EventsCodeGenerator.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

namespace gdjs {

namespace {
gd::String ResolveProjectGlobalConfigPlaceholders(
    const gd::Project& project,
    const gd::String& value) {
  gd::String resolvedValue;
  gd::String missingPath;
  if (project.ResolveGlobalConfigPlaceholders(
          value, resolvedValue, missingPath)) {
    return resolvedValue;
  }

  gd::LogError("Global config path \"{{" + missingPath +
               "}}\" does not exist while generating behavior property code.");
  return value;
}

gd::String GenerateEmptyStructureVariableCode() {
  return "(() => { const variable = new gdjs.Variable(); "
         "variable.castTo(\"structure\"); return variable; })()";
}

gd::String GenerateVariableFromValueCode(const gd::String& valueCode,
                                         const gd::String& propertyName) {
  return gd::String(R"jscode_template((() => {
    const variable = new gdjs.Variable();
    const value = VALUE_CODE;
    const propertyName = PROPERTY_NAME;
    const reportInvalidValue = (error) => {
      if (typeof console !== "undefined" && console.error) {
        console.error(
          "Unable to parse JsonObject property " + propertyName +
            ". Expected a JSON object or array.",
          value,
          error
        );
      }
    };
    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);
        if (parsedValue === null || typeof parsedValue !== "object") {
          reportInvalidValue();
          variable.castTo("structure");
        } else {
          variable.fromJSObject(parsedValue);
        }
      } catch (error) {
        reportInvalidValue(error);
        variable.castTo("structure");
      }
    } else if (value === null || typeof value !== "object") {
      reportInvalidValue();
      variable.castTo("structure");
    } else {
      variable.fromJSObject(value);
    }
    return variable;
  })())jscode_template")
      .FindAndReplace("VALUE_CODE", valueCode)
      .FindAndReplace(
          "PROPERTY_NAME",
          EventsCodeGenerator::ConvertToStringExplicit(propertyName));
}

gd::String GenerateVariableFromJsonValueCode(const gd::String& value,
                                             const gd::String& propertyName) {
  gd::String trimmedValue = value;
  if (trimmedValue.Trim().empty()) {
    return GenerateEmptyStructureVariableCode();
  }

  return GenerateVariableFromValueCode(
      EventsCodeGenerator::ConvertToStringExplicit(value), propertyName);
}
}  // namespace

gd::String BehaviorCodeGenerator::doStepPreEventsFunctionName =
    "doStepPreEvents";

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorCompleteCode(
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
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
          GenerateRuntimeBehaviorPropertyTemplateCode(eventsBasedBehavior,
                                                      *property);
    }

    return runtimeBehaviorPropertyMethodsCode;
  };

  auto generateInitializeSharedPropertiesCode = [&]() {
    gd::String runtimeBehaviorSharedDataInitializationCode;
    for (auto& property : eventsBasedBehavior.GetSharedPropertyDescriptors()
                              .GetInternalVector()) {
      runtimeBehaviorSharedDataInitializationCode +=
          property->IsHidden()
              ? GenerateInitializeSharedPropertyFromDefaultValueCode(*property)
              : GenerateInitializeSharedPropertyFromDataCode(*property);
    }

    return runtimeBehaviorSharedDataInitializationCode;
  };

  auto generateSharedPropertiesCode = [&]() {
    gd::String runtimeBehaviorSharedPropertyMethodsCode;
    for (auto& property : eventsBasedBehavior.GetSharedPropertyDescriptors()
                              .GetInternalVector()) {
      runtimeBehaviorSharedPropertyMethodsCode +=
          GenerateRuntimeBehaviorSharedPropertyTemplateCode(eventsBasedBehavior,
                                                            *property);
    }

    return runtimeBehaviorSharedPropertyMethodsCode;
  };

  // TODO: Update code generation to be able to generate methods (which would
  // allow for a cleaner output, not having to add methods to the prototype).
  auto generateMethodsCode = [&]() {
    gd::String runtimeBehaviorMethodsCode;
    for (auto& eventsFunction : eventsFunctionsVector) {
      const gd::String& functionName =
          behaviorMethodMangledNames.find(eventsFunction->GetName()) !=
                  behaviorMethodMangledNames.end()
              ? behaviorMethodMangledNames.find(eventsFunction->GetName())
                    ->second
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
              eventsFunctionsExtension,
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
      runtimeBehaviorMethodsCode += GenerateDefaultDoStepPreEventsFunctionCode(
          eventsBasedBehavior, codeNamespace);
    }

    return runtimeBehaviorMethodsCode;
  };

  auto generateUpdateFromBehaviorDataCode = [&]() {
    gd::String updateFromBehaviorCode;
    for (auto& property :
         eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
      updateFromBehaviorCode += GenerateUpdatePropertyFromBehaviorDataCode(
          eventsBasedBehavior, *property);
    }

    return updateFromBehaviorCode;
  };

  auto generateGetNetworkSyncDataCode = [&]() {
    gd::String getNetworkSyncDataCode;
    for (auto& property :
         eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
      getNetworkSyncDataCode += GenerateGetPropertyNetworkSyncDataCode(
          eventsBasedBehavior, *property);
    }

    return getNetworkSyncDataCode;
  };

  auto generateUpdateFromNetworkSyncDataCode = [&]() {
    gd::String updateFromNetworkSyncDataCode;
    for (auto& property :
         eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
      updateFromNetworkSyncDataCode +=
          GenerateUpdatePropertyFromNetworkSyncDataCode(eventsBasedBehavior,
                                                        *property);
    }

    return updateFromNetworkSyncDataCode;
  };

  return GenerateRuntimeBehaviorTemplateCode(
      eventsFunctionsExtension.GetName(),
      eventsBasedBehavior,
      codeNamespace,
      [&]() { return GenerateInitializeVariablesCode(eventsBasedBehavior); },
      generateInitializePropertiesCode,
      generatePropertiesCode,
      generateInitializeSharedPropertiesCode,
      generateSharedPropertiesCode,
      generateMethodsCode,
      generateUpdateFromBehaviorDataCode,
      generateGetNetworkSyncDataCode,
      generateUpdateFromNetworkSyncDataCode);
}

gd::String BehaviorCodeGenerator::GenerateRuntimeBehaviorTemplateCode(
    const gd::String& extensionName,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::String& codeNamespace,
    std::function<gd::String()> generateInitializeVariablesCode,
    std::function<gd::String()> generateInitializePropertiesCode,
    std::function<gd::String()> generatePropertiesCode,
    std::function<gd::String()> generateInitializeSharedPropertiesCode,
    std::function<gd::String()> generateSharedPropertiesCode,
    std::function<gd::String()> generateMethodsCode,
    std::function<gd::String()> generateUpdateFromBehaviorDataCode,
    std::function<gd::String()> generateGetNetworkSyncDataCode,
    std::function<gd::String()> generateUpdateFromNetworkSyncDataCode) {
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
    this._behaviorVariables = new gdjs.VariablesContainer(BEHAVIOR_VARIABLES_DATA);
    this._sharedData = CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    INITIALIZE_PROPERTIES_CODE
  }

  // Hot-reload:
  applyBehaviorOverriding(behaviorOverriding) {
    UPDATE_FROM_BEHAVIOR_DATA_CODE

    return true;
  }

  // Network sync:
  getNetworkSyncData(syncOptions) {
    return {
      ...super.getNetworkSyncData(syncOptions),
      props: {
        GET_NETWORK_SYNC_DATA_CODE
      }
    };
  }
  updateFromNetworkSyncData(networkSyncData, options) {
    super.updateFromNetworkSyncData(networkSyncData, options);
    UPDATE_FROM_NETWORK_SYNC_DATA_CODE
  }

  // Properties:
  PROPERTIES_CODE

  getBehaviorVariables() {
    return this._behaviorVariables;
  }
}

/**
 * Shared data generated from BEHAVIOR_FULL_NAME
 */
CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.SharedData = class RUNTIME_BEHAVIOR_CLASSNAMESharedData {
  constructor(instanceContainer, sharedData) {
    this._runtimeGame = instanceContainer.getGame();
    INITIALIZE_SHARED_PROPERTIES_CODE
  }
  
  // Shared properties:
  SHARED_PROPERTIES_CODE
}

CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._EXTENSION_NAME_RUNTIME_BEHAVIOR_CLASSNAMESharedData) {
    const initialData = INITIAL_SHARED_DATA_CODE;
    instanceContainer._EXTENSION_NAME_RUNTIME_BEHAVIOR_CLASSNAMESharedData = new CODE_NAMESPACE.RUNTIME_BEHAVIOR_CLASSNAME.SharedData(
      instanceContainer,
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
      .FindAndReplace("BEHAVIOR_VARIABLES_DATA",
                      generateInitializeVariablesCode())
      .FindAndReplace("INITIALIZE_SHARED_PROPERTIES_CODE",
                      generateInitializeSharedPropertiesCode())
      .FindAndReplace("INITIALIZE_PROPERTIES_CODE",
                      generateInitializePropertiesCode())
      .FindAndReplace(
          "INITIAL_SHARED_DATA_CODE",
          eventsBasedBehavior.GetSharedPropertyDescriptors().IsEmpty()
              ? "{}"
              : gd::String(
                    "instanceContainer.getInitialSharedDataForBehavior("
                    "behaviorName)"))
      .FindAndReplace("UPDATE_FROM_BEHAVIOR_DATA_CODE",
                      generateUpdateFromBehaviorDataCode())
      .FindAndReplace("GET_NETWORK_SYNC_DATA_CODE",
                      generateGetNetworkSyncDataCode())
      .FindAndReplace("UPDATE_FROM_NETWORK_SYNC_DATA_CODE",
                      generateUpdateFromNetworkSyncDataCode())
      // It must be done before PROPERTIES_CODE.
      .FindAndReplace("SHARED_PROPERTIES_CODE", generateSharedPropertiesCode())
      .FindAndReplace("PROPERTIES_CODE", generatePropertiesCode())
      .FindAndReplace("METHODS_CODE", generateMethodsCode());
  ;
}

gd::String BehaviorCodeGenerator::GenerateInitializeVariablesCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior) {
  gd::SerializerElement variablesElement;
  eventsBasedBehavior.GetVariables().SerializeTo(variablesElement);
  return gd::Serializer::ToJSON(variablesElement);
}

gd::String BehaviorCodeGenerator::GenerateInitializePropertyFromDataCode(
    const gd::NamedPropertyDescriptor& property) {
  const gd::String defaultValueCode =
      GeneratePropertyValueCode(property);
  const gd::String dataValueCode =
      "behaviorData." + property.GetName() +
      " !== undefined ? behaviorData." + property.GetName() + " : " +
      defaultValueCode;
  return gd::String(R"jscode_template(
    this._behaviorData.PROPERTY_NAME = RESOLVED_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace(
          "RESOLVED_VALUE",
          GeneratePropertyValueResolutionCode(property, dataValueCode));
}

gd::String BehaviorCodeGenerator::GenerateInitializeSharedPropertyFromDataCode(
    const gd::NamedPropertyDescriptor& property) {
  const gd::String defaultValueCode =
      GeneratePropertyValueCode(property);
  const gd::String dataValueCode =
      "sharedData." + property.GetName() +
      " !== undefined ? sharedData." + property.GetName() + " : " +
      defaultValueCode;
  return gd::String(R"jscode_template(
    this.PROPERTY_NAME = RESOLVED_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace(
          "RESOLVED_VALUE",
          GeneratePropertyValueResolutionCode(property, dataValueCode));
}

gd::String
BehaviorCodeGenerator::GenerateInitializePropertyFromDefaultValueCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this._behaviorData.PROPERTY_NAME = DEFAULT_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("DEFAULT_VALUE",
                      GeneratePropertyValueCode(property));
}

gd::String
BehaviorCodeGenerator::GenerateInitializeSharedPropertyFromDefaultValueCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this.PROPERTY_NAME = DEFAULT_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("DEFAULT_VALUE",
                      GeneratePropertyValueCode(property));
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
      .FindAndReplace("DEFAULT_VALUE",
                      GeneratePropertyValueCode(property))
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
    const gd::String& toggleFunctionName,
    const gd::String& getterName,
    const gd::String& setterName) {
  return gd::String(R"jscode_template(
  TOGGLE_NAME() {
    this.SETTER_NAME(!this.GETTER_NAME());
  })jscode_template")
      .FindAndReplace("TOGGLE_NAME", toggleFunctionName)
      .FindAndReplace("GETTER_NAME", getterName)
      .FindAndReplace("SETTER_NAME", setterName);
}

gd::String
BehaviorCodeGenerator::GenerateRuntimeBehaviorSharedPropertyTemplateCode(
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
      .FindAndReplace(
          "GETTER_NAME",
          GetBehaviorSharedPropertyGetterInternalName(property.GetName()))
      .FindAndReplace(
          "SETTER_NAME",
          GetBehaviorSharedPropertySetterInternalName(property.GetName()))
      .FindAndReplace("DEFAULT_VALUE",
                      GeneratePropertyValueCode(property))
      .FindAndReplace("RUNTIME_BEHAVIOR_CLASSNAME",
                      eventsBasedBehavior.GetName())
      .FindAndReplace(
          "TOGGLE_PROPERTY_CODE",
          (property.GetType() == "Boolean"
               ? GenerateToggleBooleanPropertyTemplateCode(
                     GetBehaviorSharedPropertyToggleFunctionInternalName(
                         property.GetName()),
                     GetBehaviorSharedPropertyGetterInternalName(
                         property.GetName()),
                     GetBehaviorSharedPropertySetterInternalName(
                         property.GetName()))
               : ""));
}

gd::String BehaviorCodeGenerator::GenerateUpdatePropertyFromBehaviorDataCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::NamedPropertyDescriptor& property) {
  const gd::String newValueCode = GeneratePropertyValueResolutionCode(
      property,
      "behaviorOverriding." + property.GetName());
  return gd::String(R"jscode_template(
    if (behaviorOverriding.PROPERTY_NAME !== undefined)
      this._behaviorData.PROPERTY_NAME = RESOLVED_NEW_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("RESOLVED_NEW_VALUE", newValueCode);
}

gd::String BehaviorCodeGenerator::GenerateGetPropertyNetworkSyncDataCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::NamedPropertyDescriptor& property) {
  if (property.GetType() == "JsonObject") {
    return gd::String(R"jscode_template(
    PROPERTY_NAME: this._behaviorData.PROPERTY_NAME.toJSObject(),)jscode_template")
        .FindAndReplace("PROPERTY_NAME", property.GetName());
  }

  return gd::String(R"jscode_template(
    PROPERTY_NAME: this._behaviorData.PROPERTY_NAME,)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName());
}

gd::String BehaviorCodeGenerator::GenerateUpdatePropertyFromNetworkSyncDataCode(
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::NamedPropertyDescriptor& property) {
  if (property.GetType() == "JsonObject") {
    return gd::String(R"jscode_template(
    if (networkSyncData.props.PROPERTY_NAME !== undefined)
      this._behaviorData.PROPERTY_NAME = RESOLVED_VALUE;)jscode_template")
        .FindAndReplace("PROPERTY_NAME", property.GetName())
        .FindAndReplace(
            "RESOLVED_VALUE",
            GeneratePropertyValueResolutionCode(
                property, "networkSyncData.props." + property.GetName()));
  }

  return gd::String(R"jscode_template(
    if (networkSyncData.props.PROPERTY_NAME !== undefined)
      this._behaviorData.PROPERTY_NAME = networkSyncData.props.PROPERTY_NAME;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName());
}

gd::String BehaviorCodeGenerator::GeneratePropertyValueCode(
    const gd::NamedPropertyDescriptor& property) {

  const auto &valueType =
      gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(property.GetType());
  const auto &primitiveType =
      gd::ValueTypeMetadata::GetPrimitiveValueType(valueType);
  const bool isJsonObjectProperty = property.GetType() == "JsonObject";
  const gd::String propertyValue =
      ResolveProjectGlobalConfigPlaceholders(project, property.GetValue());

  if (isJsonObjectProperty) {
    return GenerateVariableFromJsonValueCode(propertyValue, property.GetName());
  }

  if (primitiveType == "string" || valueType == "behavior") {
    return EventsCodeGenerator::ConvertToStringExplicit(propertyValue);
  } else if (primitiveType == "number") {
    return "Number(" +
           EventsCodeGenerator::ConvertToStringExplicit(propertyValue) +
           ") || 0";
  } else if (primitiveType == "boolean") {  // TODO: Check if working
    return propertyValue == "true" || propertyValue == "1" ? "true" : "false";
  }

  return "0 /* Error: property was of an unrecognized type */";
}

gd::String BehaviorCodeGenerator::GeneratePropertyValueResolutionCode(
    const gd::NamedPropertyDescriptor& property,
    const gd::String& valueCode) {
  const auto &valueType =
      gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(property.GetType());
  const auto &primitiveType =
      gd::ValueTypeMetadata::GetPrimitiveValueType(valueType);

  if (property.GetType() == "JsonObject") {
    return GenerateVariableFromValueCode(valueCode, property.GetName());
  } else if (primitiveType == "string" || valueType == "behavior") {
    return "(" + valueCode + " === undefined || " + valueCode +
           " === null ? \"\" : \"\" + " + valueCode + ")";
  } else if (primitiveType == "number") {
    return "(Number(" + valueCode + ") || 0)";
  } else if (primitiveType == "boolean") {
    return "(" + valueCode + " === true || " + valueCode +
           " === 1 || " + valueCode + " === \"true\" || " + valueCode +
           " === \"1\")";
  }

  return valueCode;
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
  return "_sharedData." +
         GetBehaviorSharedPropertyGetterInternalName(propertyName);
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertySetterName(
    const gd::String& propertyName) {
  return "_sharedData." +
         GetBehaviorSharedPropertySetterInternalName(propertyName);
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertyToggleFunctionName(
    const gd::String& propertyName) {
  return "_sharedData." +
         GetBehaviorSharedPropertyToggleFunctionInternalName(propertyName);
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertyGetterInternalName(
    const gd::String& propertyName) {
  return "_get" + propertyName;
}

gd::String BehaviorCodeGenerator::GetBehaviorSharedPropertySetterInternalName(
    const gd::String& propertyName) {
  return "_set" + propertyName;
}

gd::String
BehaviorCodeGenerator::GetBehaviorSharedPropertyToggleFunctionInternalName(
    const gd::String& propertyName) {
  return "_toggle" + propertyName;
}
}  // namespace gdjs
