/*
 * GDevelop Core
 * Copyright 2008-2022 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "PropertyFunctionGenerator.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"

namespace gd {

void PropertyFunctionGenerator::GenerateGetterAndSetter(
    gd::EventsFunctionsExtension &extension,
    gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &propertyName) {
  bool isSceneProperties = false;

  auto &property =
      eventsBasedBehavior.GetPropertyDescriptors().Get(propertyName);
  auto &functionsContainer = eventsBasedBehavior.GetEventsFunctions();
  gd::String capitalizedName = CapitalizeFirstLetter(property.GetName());
  gd::String setterName = "Set" + capitalizedName;

  gd::String functionGroupName =
      (eventsBasedBehavior.GetFullName().empty()
           ? eventsBasedBehavior.GetName()
           : eventsBasedBehavior.GetFullName()) +
      " " + UnCapitalizeFirstLetter(property.GetGroup()) + " configuration";

  gd::String descriptionSubject =
      (property.GetType() == "Boolean" ? "if " : "the ") +
      UnCapitalizeFirstLetter(property.GetLabel()) +
      (isSceneProperties || property.GetType() == "Boolean"
           ? "."
           : " of the object.") +
      (property.GetDescription().empty() ? ""
                                         : " " + property.GetDescription()) +
      (isSceneProperties ? " While an object is needed, this will apply to all "
                           "objects using the behavior."
                         : "");

  gd::String behaviorNamespace =
      extension.GetName() + "::" + eventsBasedBehavior.GetName() + "::";
  gd::String propertyGetterName =
      (isSceneProperties ? "SharedProperty" : "Property") + property.GetName();
  gd::String getterType = behaviorNamespace + propertyGetterName;
  gd::String setterType = behaviorNamespace + "Set" + propertyGetterName;

  gd::String getterName = capitalizedName;
  gd::String numberOrString =
      property.GetType() == "Number" ? "Number" : "String";

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
    getter.SetFullName(property.GetLabel()).SetGroup(functionGroupName);
    if (property.GetType() == "Boolean") {
      getter.SetFunctionType(gd::EventsFunction::Condition)
          .SetDescription("Check " + descriptionSubject)
          .SetSentence("_PARAM0_ " +
                       UnCapitalizeFirstLetter(property.GetLabel()));
    } else {
      getter.SetFunctionType(gd::EventsFunction::ExpressionAndCondition)
          .SetDescription(descriptionSubject)
          .SetSentence("the " + UnCapitalizeFirstLetter(property.GetLabel()));
    }

    gd::StandardEvent event;
    if (property.GetType() == "Boolean") {
      gd::Instruction condition;
      condition.SetType(getterType);
      condition.SetParametersCount(2);
      condition.SetParameter(0, "Object");
      condition.SetParameter(1, "Behavior");
      event.GetConditions().Insert(condition, 0);

      gd::Instruction action;
      action.SetType("SetReturnBoolean");
      action.SetParametersCount(1);
      action.SetParameter(0, "True");
      event.GetActions().Insert(action, 0);
    } else {
      gd::Instruction action;
      action.SetType("SetReturn" + numberOrString);
      action.SetParametersCount(1);
      gd::String propertyPrefix =
          (isSceneProperties ? "SharedProperty" : "Property");
      action.SetParameter(0, "Object.Behavior::" + propertyPrefix +
                                 property.GetName() + "()");
      event.GetActions().Insert(action, 0);
    }
    getter.GetEvents().InsertEvent(event);
  }

  if (!functionsContainer.HasEventsFunctionNamed(setterName)) {
    auto &setter = functionsContainer.InsertNewEventsFunction(
        setterName, functionsContainer.GetEventsFunctionsCount());
    if (property.GetType() == "Boolean") {
      setter.SetFunctionType(gd::EventsFunction::Action)
          .SetFullName(property.GetLabel())
          .SetGroup(functionGroupName)
          .SetDescription("Change " + descriptionSubject)
          .SetSentence("_PARAM0_ " +
                       UnCapitalizeFirstLetter(property.GetLabel()) +
                       ": _PARAM2_");
      gd::ParameterMetadata parameter;
      parameter.SetType("yesorno")
          .SetName("Value")
          .SetDescription(capitalizedName)
          .SetOptional(true)
          .SetDefaultValue("yes");
      setter.GetParameters().push_back(parameter);
    } else {
      setter.SetFunctionType(gd::EventsFunction::ActionWithOperator);
      setter.SetGetterName(getterName);
    }

    if (property.GetType() == "Boolean") {
      {
        gd::StandardEvent event;

        gd::Instruction condition;
        condition.SetType("GetArgumentAsBoolean");
        condition.SetParametersCount(1);
        condition.SetParameter(0, "\"Value\"");
        event.GetConditions().Insert(condition, 0);

        gd::Instruction action;
        action.SetType(setterType);
        action.SetParametersCount(3);
        action.SetParameter(0, "Object");
        action.SetParameter(1, "Behavior");
        action.SetParameter(2, "yes");
        event.GetActions().Insert(action, 0);

        setter.GetEvents().InsertEvent(event);
      }
      {
        gd::StandardEvent event;

        gd::Instruction condition;
        condition.SetType("GetArgumentAsBoolean");
        condition.SetParametersCount(1);
        condition.SetParameter(0, "\"Value\"");
        condition.SetInverted(true);
        event.GetConditions().Insert(condition, 0);

        gd::Instruction action;
        action.SetType(setterType);
        action.SetParametersCount(3);
        action.SetParameter(0, "Object");
        action.SetParameter(1, "Behavior");
        action.SetParameter(2, "no");
        event.GetActions().Insert(action, 0);

        setter.GetEvents().InsertEvent(event);
      }
    } else {
      gd::StandardEvent event;

      gd::Instruction action;
      action.SetType(setterType);
      action.SetParametersCount(4);
      action.SetParameter(0, "Object");
      action.SetParameter(1, "Behavior");
      action.SetParameter(2, "=");
      action.SetParameter(3, "GetArgumentAs" + numberOrString + "(\"Value\")");
      event.GetActions().Insert(action, 0);

      setter.GetEvents().InsertEvent(event);
    }
  }
}

gd::String PropertyFunctionGenerator::GetStringifiedExtraInfo(
    const gd::PropertyDescriptor &property) {
  if (property.GetType() == "Choice") {
    gd::String arrayString;
    arrayString += "[";
    bool isFirst = true;
    for (const gd::String &choice : property.GetExtraInfo()) {
      if (isFirst) {
        arrayString += ",";
        isFirst = false;
      }
      arrayString += choice;
    }
    arrayString += "]";
    return arrayString;
  }
  return "";
}

gd::String
PropertyFunctionGenerator::CapitalizeFirstLetter(const gd::String &string) {
  return string.substr(0, 1).UpperCase() +
         string.substr(1, string.length() - 1);
}

gd::String
PropertyFunctionGenerator::UnCapitalizeFirstLetter(const gd::String &string) {
  return string.substr(0, 1).LowerCase() +
         string.substr(1, string.length() - 1);
}

} // namespace gd
