/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectCodeGenerator.h"

#include "EventsCodeGenerator.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"

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

gd::String ObjectCodeGenerator::onCreatedFunctionName =
    "onCreated";

gd::String ObjectCodeGenerator::onPlacedInSceneFunctionName =
    "onPlacedInScene";

gd::String ObjectCodeGenerator::doStepPreEventsFunctionName =
    "doStepPreEvents";

gd::String ObjectCodeGenerator::GenerateRuntimeObjectCompleteCode(
    const gd::EventsFunctionsExtension& eventsFunctionsExtension,
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::String& codeNamespace,
    const std::map<gd::String, gd::String>& objectMethodMangledNames,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  auto& eventsFunctionsVector =
      eventsBasedObject.GetEventsFunctions().GetInternalVector();

  return GenerateRuntimeObjectTemplateCode(
      eventsFunctionsExtension.GetName(),
      eventsBasedObject,
      codeNamespace,
      [&]() {
        gd::String runtimeObjectDataInitializationCode;
        for (auto& property :
             eventsBasedObject.GetPropertyDescriptors().GetInternalVector()) {
          runtimeObjectDataInitializationCode +=
              property->IsHidden()
                  ? GenerateInitializePropertyFromDefaultValueCode(*property)
                  : GenerateInitializePropertyFromDataCode(*property);
        }

        return runtimeObjectDataInitializationCode;
      },
      [&]() {
        gd::String runtimeObjectPropertyMethodsCode;
        for (auto& property :
             eventsBasedObject.GetPropertyDescriptors().GetInternalVector()) {
          runtimeObjectPropertyMethodsCode +=
              GenerateRuntimeObjectPropertyTemplateCode(
                  eventsBasedObject, *property);
        }

        return runtimeObjectPropertyMethodsCode;
      },
      // TODO: Update code generation to be able to generate methods (which would allow
      // for a cleaner output, not having to add methods to the prototype).
      [&]() {
        gd::String runtimeObjectMethodsCode;
        for (auto& eventsFunction : eventsFunctionsVector) {
          const gd::String& functionName =
              objectMethodMangledNames.find(eventsFunction->GetName()) !=
                      objectMethodMangledNames.end()
                  ? objectMethodMangledNames.find(eventsFunction->GetName())
                        ->second
                  : "UNKNOWN_FUNCTION_fix_objectMethodMangledNames_please";
          gd::String methodCodeNamespace =
              codeNamespace + "." + eventsBasedObject.GetName() +
              ".prototype." + functionName + "Context";
          gd::String methodFullyQualifiedName = codeNamespace + "." +
                                                eventsBasedObject.GetName() +
                                                ".prototype." + functionName;
          runtimeObjectMethodsCode +=
              EventsCodeGenerator::GenerateObjectEventsFunctionCode(
                  project,
                  eventsFunctionsExtension,
                  eventsBasedObject,
                  *eventsFunction,
                  methodCodeNamespace,
                  methodFullyQualifiedName,
                  "runtimeScene.getOnceTriggers()",
                  functionName == doStepPreEventsFunctionName
                      ? GenerateDoStepPreEventsPreludeCode(eventsBasedObject)
                      : "",
                  functionName == onCreatedFunctionName
                      ? "gdjs.CustomRuntimeObject.prototype.onCreated.call(this);\n"
                  : functionName == onPlacedInSceneFunctionName
                      ? "gdjs.CustomRuntimeObject.prototype.onPlacedInScene.call(this);\n"
                      : "",
                  includeFiles,
                  compilationForRuntime);
        }

        bool hasDoStepPreEventsFunction =
            eventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
                doStepPreEventsFunctionName);
        if (!hasDoStepPreEventsFunction) {
          runtimeObjectMethodsCode +=
              GenerateDefaultDoStepPreEventsFunctionCode(eventsBasedObject,
                                                         codeNamespace);
        }

        return runtimeObjectMethodsCode;
      },
      [&]() {
        gd::String updateFromObjectCode;
        updateFromObjectCode += "super.updateFromObjectData(oldObjectData, newObjectData);";
        for (auto& property :
             eventsBasedObject.GetPropertyDescriptors().GetInternalVector()) {
          updateFromObjectCode +=
              GenerateUpdatePropertyFromObjectDataCode(
                  eventsBasedObject, *property);
        }

        return updateFromObjectCode;
      },
      // generateInitializeAnimatableCode
      [&]() {
        return gd::String(R"jscode_template(
    this._animator = new gdjs.SpriteAnimator(
        objectData.animatable.animations,
        gdjs.RENDERER_CLASS_NAME.getAnimationFrameTextureManager(
            parentInstanceContainer.getGame().getImageManager()));
)jscode_template")
      .FindAndReplace("RENDERER_CLASS_NAME", eventsBasedObject.IsRenderedIn3D() ? "CustomRuntimeObject3DRenderer" : "CustomRuntimeObject2DRenderer");
      },
      // generateAnimatableCode
      [&]() {
        return gd::String(R"jscode_template(
  //  gdjs.Animatable interface implementation
  getAnimator() {
    return this._animator;
  }
  getAnimationIndex() {
    return this._animator.getAnimationIndex();
  }
  setAnimationIndex(animationIndex) {
    this._animator.setAnimationIndex(animationIndex);
  }
  getAnimationName() {
    return this._animator.getAnimationName();
  }
  setAnimationName(animationName) {
    this._animator.setAnimationName(animationName);
  }
  hasAnimationEnded() {
    return this._animator.hasAnimationEnded();
  }
  isAnimationPaused() {
    return this._animator.isAnimationPaused();
  }
  pauseAnimation() {
    this._animator.pauseAnimation();
  }
  resumeAnimation() {
    this._animator.resumeAnimation();
  }
  getAnimationSpeedScale() {
    return this._animator.getAnimationSpeedScale();
  }
  setAnimationSpeedScale(ratio) {
    this._animator.setAnimationSpeedScale(ratio);
  }
  getAnimationElapsedTime() {
    return this._animator.getAnimationElapsedTime();
  }
  setAnimationElapsedTime(time) {
    this._animator.setAnimationElapsedTime(time);
  }
  getAnimationDuration() {
    return this._animator.getAnimationDuration();
  }
)jscode_template");
      },
      // generateTextContainerCode
      [&]() {
        return gd::String(R"jscode_template(
  // gdjs.TextContainer interface implementation
  _text = '';
  getText() {
    return this._text;
  }
  setText(text) {
    this._text = text;
  }
)jscode_template");
      });
}

gd::String ObjectCodeGenerator::GenerateRuntimeObjectTemplateCode(
    const gd::String& extensionName,
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::String& codeNamespace,
    std::function<gd::String()> generateInitializePropertiesCode,
    std::function<gd::String()> generatePropertiesCode,
    std::function<gd::String()> generateMethodsCode,
    std::function<gd::String()> generateUpdateFromObjectDataCode,
    std::function<gd::String()> generateInitializeAnimatableCode,
    std::function<gd::String()> generateAnimatableCode,
    std::function<gd::String()> generateTextContainerCode) {
  return gd::String(R"jscode_template(
CODE_NAMESPACE = CODE_NAMESPACE || {};

/**
 * Object generated from OBJECT_FULL_NAME
 */
CODE_NAMESPACE.RUNTIME_OBJECT_CLASSNAME = class RUNTIME_OBJECT_CLASSNAME extends RUNTIME_OBJECT_BASE_CLASS_NAME {
  constructor(parentInstanceContainer, objectData, instanceData) {
    super(parentInstanceContainer, objectData, instanceData);
    this._parentInstanceContainer = parentInstanceContainer;

    this._objectData = {};
    INITIALIZE_PROPERTIES_CODE
    INITIALIZE_ANIMATABLE_CODE

    // It calls the onCreated super implementation at the end.
    this.onCreated();
  }

  // Hot-reload:
  updateFromObjectData(oldObjectData, newObjectData) {
    UPDATE_FROM_OBJECT_DATA_CODE

    this.onHotReloading(this._parentInstanceContainer);
    return true;
  }

  // Properties:
  PROPERTIES_CODE

  ANIMATABLE_CODE

  TEXT_CONTAINER_CODE
}

// Methods:
METHODS_CODE

gdjs.registerObject("EXTENSION_NAME::OBJECT_NAME", CODE_NAMESPACE.RUNTIME_OBJECT_CLASSNAME);
)jscode_template")
      .FindAndReplace("EXTENSION_NAME", extensionName)
      .FindAndReplace("OBJECT_NAME", eventsBasedObject.GetName())
      .FindAndReplace("OBJECT_FULL_NAME", eventsBasedObject.GetFullName())
      .FindAndReplace("RUNTIME_OBJECT_CLASSNAME",
                      eventsBasedObject.GetName())
      .FindAndReplace("RUNTIME_OBJECT_BASE_CLASS_NAME",
                      eventsBasedObject.IsRenderedIn3D() ? "gdjs.CustomRuntimeObject3D" : "gdjs.CustomRuntimeObject2D")
      .FindAndReplace("CODE_NAMESPACE", codeNamespace)
      .FindAndReplace("INITIALIZE_PROPERTIES_CODE",
                      generateInitializePropertiesCode())
      .FindAndReplace("INITIALIZE_ANIMATABLE_CODE",
                      eventsBasedObject.IsAnimatable()
                          ? generateInitializeAnimatableCode()
                          : "")
      .FindAndReplace("UPDATE_FROM_OBJECT_DATA_CODE", generateUpdateFromObjectDataCode())
      .FindAndReplace("PROPERTIES_CODE", generatePropertiesCode())
      .FindAndReplace("ANIMATABLE_CODE", eventsBasedObject.IsAnimatable() ? generateAnimatableCode() : "")
      .FindAndReplace("TEXT_CONTAINER_CODE", eventsBasedObject.IsTextContainer() ? generateTextContainerCode() : "")
      .FindAndReplace("METHODS_CODE", generateMethodsCode());
  ;
}
// TODO these 2 methods are probably not needed if the properties are merged by GDJS.
gd::String ObjectCodeGenerator::GenerateInitializePropertyFromDataCode(
    const gd::NamedPropertyDescriptor& property) {
  const gd::String defaultValueCode =
      GeneratePropertyValueCode(property);
  const gd::String dataValueCode =
      "objectData.content." + property.GetName() +
      " !== undefined ? objectData.content." + property.GetName() + " : " +
      defaultValueCode;
  return gd::String(R"jscode_template(
    this._objectData.PROPERTY_NAME = RESOLVED_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace(
          "RESOLVED_VALUE",
          GeneratePropertyValueResolutionCode(property, dataValueCode));
}
gd::String
ObjectCodeGenerator::GenerateInitializePropertyFromDefaultValueCode(
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
    this._objectData.PROPERTY_NAME = DEFAULT_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace(
          "DEFAULT_VALUE",
          GeneratePropertyValueCode(property));
}

gd::String ObjectCodeGenerator::GenerateRuntimeObjectPropertyTemplateCode(
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::NamedPropertyDescriptor& property) {
  return gd::String(R"jscode_template(
  GETTER_NAME() {
    return this._objectData.PROPERTY_NAME !== undefined ? this._objectData.PROPERTY_NAME : DEFAULT_VALUE;
  }
  SETTER_NAME(newValue) {
    this._objectData.PROPERTY_NAME = newValue;
  }TOGGLE_PROPERTY_CODE)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("GETTER_NAME",
                      GetObjectPropertyGetterName(property.GetName()))
      .FindAndReplace("SETTER_NAME",
                      GetObjectPropertySetterName(property.GetName()))
      .FindAndReplace(
          "DEFAULT_VALUE",
          GeneratePropertyValueCode(property))
      .FindAndReplace("RUNTIME_OBJECT_CLASSNAME",
                      eventsBasedObject.GetName())
      .FindAndReplace(
          "TOGGLE_PROPERTY_CODE",
          (property.GetType() == "Boolean"
               ? GenerateToggleBooleanPropertyTemplateCode(
                     GetObjectPropertyToggleFunctionName(property.GetName()),
                     GetObjectPropertyGetterName(property.GetName()),
                     GetObjectPropertySetterName(property.GetName()))
               : ""));
}

gd::String ObjectCodeGenerator::GenerateToggleBooleanPropertyTemplateCode(
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

gd::String ObjectCodeGenerator::GenerateUpdatePropertyFromObjectDataCode(
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::NamedPropertyDescriptor& property) {
  const gd::String newValueCode = GeneratePropertyValueResolutionCode(
      property,
      "newObjectData.content." + property.GetName());
  return gd::String(R"jscode_template(
    if (oldObjectData.content.PROPERTY_NAME !== newObjectData.content.PROPERTY_NAME)
      this._objectData.PROPERTY_NAME = RESOLVED_NEW_VALUE;)jscode_template")
      .FindAndReplace("PROPERTY_NAME", property.GetName())
      .FindAndReplace("RESOLVED_NEW_VALUE", newValueCode);
}

gd::String ObjectCodeGenerator::GeneratePropertyValueCode(
    const gd::NamedPropertyDescriptor& property) {
  const auto &primitiveType = gd::ValueTypeMetadata::GetPrimitiveValueType(
      gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(
          property.GetType()));
  const bool isJsonObjectProperty = property.GetType() == "JsonObject";
  const gd::String propertyValue =
      ResolveProjectGlobalConfigPlaceholders(project, property.GetValue());

  if (isJsonObjectProperty) {
    return GenerateVariableFromJsonValueCode(propertyValue, property.GetName());
  }

  if (primitiveType == "string") {
    return EventsCodeGenerator::ConvertToStringExplicit(propertyValue);
  } else if (primitiveType == "number") {
    return "Number(" +
           EventsCodeGenerator::ConvertToStringExplicit(propertyValue) +
           ") || 0";
  } else if (primitiveType == "boolean") { // TODO: Check if working
    return propertyValue == "true" || propertyValue == "1" ? "true" : "false";
  }

  return "0 /* Error: property was of an unrecognized type */";
}

gd::String ObjectCodeGenerator::GeneratePropertyValueResolutionCode(
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

gd::String ObjectCodeGenerator::GenerateDefaultDoStepPreEventsFunctionCode(
    const gd::EventsBasedObject& eventsBasedObject,
    const gd::String& codeNamespace) {
  return gd::String(R"jscode_template(
CODE_NAMESPACE.RUNTIME_OBJECT_CLASSNAME.prototype.doStepPreEvents = function() {
  PRELUDE_CODE
};
)jscode_template")
      .FindAndReplace("RUNTIME_OBJECT_CLASSNAME",
                      eventsBasedObject.GetName())
      .FindAndReplace("CODE_NAMESPACE", codeNamespace)
      .FindAndReplace("PRELUDE_CODE",
                      GenerateDoStepPreEventsPreludeCode(eventsBasedObject));}

gd::String ObjectCodeGenerator::GenerateDoStepPreEventsPreludeCode(
    const gd::EventsBasedObject& eventsBasedObject) {
  gd::String doStepPreEventsPreludeCode;
  doStepPreEventsPreludeCode += "this._instanceContainer.getOnceTriggers().startNewFrame();";
  if (eventsBasedObject.IsAnimatable()) {
    doStepPreEventsPreludeCode +=
        "\nthis._animator.step(this.getElapsedTime() / 1000);";
  }
  return doStepPreEventsPreludeCode;
}

}  // namespace gdjs
