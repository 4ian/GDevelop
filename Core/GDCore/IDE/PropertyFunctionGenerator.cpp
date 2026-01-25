/*
 * GDevelop Core
 * Copyright 2008-2022 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "PropertyFunctionGenerator.h"

#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"

namespace gd {

void PropertyFunctionGenerator::GenerateBehaviorGetterAndSetter(
    gd::Project &project, gd::EventsFunctionsExtension &extension,
    gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::NamedPropertyDescriptor &property, bool isSharedProperties) {
  GenerateGetterAndSetter(project, extension, eventsBasedBehavior, property,
                          eventsBasedBehavior.GetObjectType(), true,
                          isSharedProperties);
}

void PropertyFunctionGenerator::GenerateObjectGetterAndSetter(
    gd::Project &project, gd::EventsFunctionsExtension &extension,
    gd::EventsBasedObject &eventsBasedObject,
    const gd::NamedPropertyDescriptor &property) {
  GenerateGetterAndSetter(project, extension, eventsBasedObject, property, "",
                          false, false);
}

void PropertyFunctionGenerator::GenerateGetterAndSetter(
    gd::Project &project, gd::EventsFunctionsExtension &extension,
    gd::AbstractEventsBasedEntity &eventsBasedEntity,
    const gd::NamedPropertyDescriptor &property, const gd::String &objectType,
    bool isBehavior, bool isSharedProperties) {
  auto &propertyName = property.GetName();
  const auto &primitiveType = gd::ValueTypeMetadata::GetPrimitiveValueType(
      gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(
          property.GetType()));
  auto &functionsContainer = eventsBasedEntity.GetEventsFunctions();
  gd::String capitalizedName = CapitalizeFirstLetter(property.GetName());
  gd::String setterName = "Set" + capitalizedName;

  gd::String functionGroupName =
      (eventsBasedEntity.GetFullName().empty()
           ? eventsBasedEntity.GetName()
           : eventsBasedEntity.GetFullName()) +
      (property.GetGroup().empty()
           ? ""
           : " " + UnCapitalizeFirstLetter(property.GetGroup())) +
      " configuration";

  gd::String propertyLabel =
      property.GetLabel().empty() ? property.GetName() : property.GetLabel();

  gd::String descriptionSubject =
      (primitiveType == "boolean" ? "if " : "the ") +
      UnCapitalizeFirstLetter(propertyLabel) +
      (isSharedProperties || primitiveType == "boolean"
           ? "."
           : " of the object.") +
      (property.GetDescription().empty() ? ""
                                         : " " + property.GetDescription()) +
      (isSharedProperties
           ? " While an object is needed, this will apply to all "
             "objects using the behavior."
           : "");

  gd::String getterName = capitalizedName;

  if (!functionsContainer.HasEventsFunctionNamed(getterName)) {
    auto &getter = functionsContainer.InsertNewEventsFunction(
        getterName, functionsContainer.GetEventsFunctionsCount());
    auto &expressionType =
        gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(
            property.GetType());
    // TODO Stop replacing number by expression when it"s handled by the UI
    // and released.
    auto &legacyExpressionType =
        expressionType == "number" ? "expression" : expressionType;
    getter.GetExpressionType()
        .SetName(legacyExpressionType)
        .SetExtraInfo(GetStringifiedExtraInfo(property));
    getter.SetFullName(propertyLabel).SetGroup(functionGroupName);
    if (primitiveType == "boolean") {
      getter.SetFunctionType(gd::EventsFunction::Condition)
          .SetDescription("Check " + descriptionSubject)
          .SetSentence("_PARAM0_ " + UnCapitalizeFirstLetter(propertyLabel));
    } else {
      getter.SetFunctionType(gd::EventsFunction::ExpressionAndCondition)
          .SetDescription(descriptionSubject)
          .SetSentence("the " + UnCapitalizeFirstLetter(propertyLabel));
    }

    auto &event =
        dynamic_cast<gd::StandardEvent &>(getter.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard", 0));
    if (primitiveType == "boolean") {
      gd::Instruction condition;
      condition.SetType("BooleanVariable");
      condition.AddParameter(propertyName);
      condition.AddParameter("True");
      condition.AddParameter("");
      event.GetConditions().Insert(condition, 0);

      gd::Instruction action;
      action.SetType("SetReturnBoolean");
      action.AddParameter("True");
      event.GetActions().Insert(action, 0);
    } else {
      gd::Instruction action;
      gd::String numberOrString =
          primitiveType == "number" ? "Number" : "String";
      action.SetType("SetReturn" + numberOrString);
      action.AddParameter(property.GetName());
      event.GetActions().Insert(action, 0);
    }
  }

  if (!functionsContainer.HasEventsFunctionNamed(setterName)) {
    auto &setter = functionsContainer.InsertNewEventsFunction(
        setterName, functionsContainer.GetEventsFunctionsCount());
    if (primitiveType == "boolean") {
      setter.SetFunctionType(gd::EventsFunction::Action)
          .SetFullName(propertyLabel)
          .SetGroup(functionGroupName)
          .SetDescription("Change " + descriptionSubject)
          .SetSentence("_PARAM0_ " + UnCapitalizeFirstLetter(propertyLabel) +
                       (isBehavior ? ": _PARAM2_" : ": _PARAM1_"));
      gd::ParameterMetadata objectParameter;
      objectParameter.SetType("object")
          .SetName("Object")
          .SetDescription("Object")
          .SetExtraInfo(objectType);
      if (!isBehavior) {
        gd::String objectFullType = gd::PlatformExtension::GetObjectFullType(
            extension.GetName(), eventsBasedEntity.GetName());
        objectParameter.SetExtraInfo(objectFullType);
      }
      setter.GetParameters().AddParameter(objectParameter);
      if (isBehavior) {
        gd::ParameterMetadata behaviorParameter;
        gd::String behaviorFullType =
            gd::PlatformExtension::GetBehaviorFullType(
                extension.GetName(), eventsBasedEntity.GetName());
        behaviorParameter.SetType("behavior")
            .SetName("Behavior")
            .SetDescription("Behavior")
            .SetExtraInfo(behaviorFullType);
        setter.GetParameters().AddParameter(behaviorParameter);
      }
      gd::ParameterMetadata valueParameter;
      valueParameter.SetType("yesorno")
          .SetName("Value")
          .SetDescription(capitalizedName)
          .SetOptional(true)
          .SetDefaultValue("yes");
      setter.GetParameters().AddParameter(valueParameter);
    } else {
      setter.SetFunctionType(gd::EventsFunction::ActionWithOperator);
      setter.SetGetterName(getterName);
    }

    if (primitiveType == "boolean") {
      {
        auto &event =
            dynamic_cast<gd::StandardEvent &>(setter.GetEvents().InsertNewEvent(
                project, "BuiltinCommonInstructions::Standard", 0));

        gd::Instruction condition;
        condition.SetType("BooleanVariable");
        condition.AddParameter("Value");
        condition.AddParameter("True");
        condition.AddParameter("");
        event.GetConditions().Insert(condition, 0);

        gd::Instruction action;
        action.SetType("SetBooleanVariable");
        action.AddParameter(propertyName);
        action.AddParameter("True");
        action.AddParameter("");
        event.GetActions().Insert(action, 0);
      }
      {
        auto &event =
            dynamic_cast<gd::StandardEvent &>(setter.GetEvents().InsertNewEvent(
                project, "BuiltinCommonInstructions::Standard", 0));

        gd::Instruction condition;
        condition.SetType("BooleanVariable");
        condition.AddParameter("Value");
        condition.AddParameter("False");
        condition.AddParameter("");
        event.GetConditions().Insert(condition, 0);

        gd::Instruction action;
        action.SetType("SetBooleanVariable");
        action.AddParameter(propertyName);
        action.AddParameter("False");
        action.AddParameter("");
        event.GetActions().Insert(action, 0);
      }
    } else {
      auto &event =
          dynamic_cast<gd::StandardEvent &>(setter.GetEvents().InsertNewEvent(
              project, "BuiltinCommonInstructions::Standard", 0));

      gd::Instruction action;
      action.SetType(primitiveType == "number" ? "SetNumberVariable"
                                               : "SetStringVariable");
      action.AddParameter(propertyName);
      action.AddParameter("=");
      action.AddParameter("Value");
      event.GetActions().Insert(action, 0);
    }
  }
}

bool PropertyFunctionGenerator::CanGenerateGetterAndSetter(
    const gd::AbstractEventsBasedEntity &eventsBasedEntity,
    const gd::NamedPropertyDescriptor &property) {
  const auto &primitiveType = gd::ValueTypeMetadata::GetPrimitiveValueType(
      gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(
          property.GetType()));
  if (primitiveType != "boolean" && primitiveType != "number" &&
      primitiveType != "string") {
    return false;
  }

  auto &functionsContainer = eventsBasedEntity.GetEventsFunctions();
  auto getterName = CapitalizeFirstLetter(property.GetName());
  auto setterName = "Set" + getterName;
  return !functionsContainer.HasEventsFunctionNamed(setterName) &&
         !functionsContainer.HasEventsFunctionNamed(getterName);
};

gd::String PropertyFunctionGenerator::GetStringifiedExtraInfo(
    const gd::PropertyDescriptor &property) {
  if (property.GetType() == "Choice" ||
      property.GetType() == "NumberWithChoices") {
    gd::String arrayString;
    arrayString += "[";
    bool isFirst = true;
    for (const auto &choice : property.GetChoices()) {
      if (!isFirst) {
        arrayString += ",";
      }
      isFirst = false;
      // TODO Handle labels (and search "choice label")
      arrayString += "\"" + choice.GetValue() + "\"";
    }
    arrayString += "]";
    return arrayString;
  }
  return "";
}

gd::String
PropertyFunctionGenerator::CapitalizeFirstLetter(const gd::String &string) {
  if (string.empty()) {
    return string;
  }
  return string.substr(0, 1).UpperCase() + string.substr(1);
}

gd::String
PropertyFunctionGenerator::UnCapitalizeFirstLetter(const gd::String &string) {
  if (string.empty()) {
    return string;
  }
  return string.substr(0, 1).LowerCase() + string.substr(1);
}

void PropertyFunctionGenerator::GenerateConditionSkeleton(
    gd::Project &project, gd::EventsFunction &eventFunction) {
  auto &event = dynamic_cast<gd::StandardEvent &>(
      eventFunction.GetEvents().InsertNewEvent(
          project, "BuiltinCommonInstructions::Standard", 0));

  gd::Instruction action;
  action.SetType("SetReturnBoolean");
  action.AddParameter("True");
  event.GetActions().Insert(action, 0);
}

} // namespace gd
