/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "MetadataDeclarationHelper.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/WholeProjectBrowser.h"
#include "GDCore/Project/CustomBehavior.h"
#include "GDCore/Project/CustomBehaviorsSharedData.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDJS/Events/CodeGeneration/BehaviorCodeGenerator.h"
#include "GDJS/Events/CodeGeneration/ObjectCodeGenerator.h"
#include <regex>

namespace gdjs {

/**
 * Declare an extension from an events based extension.
 */
void MetadataDeclarationHelper::DeclareExtension(
    gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension) {
  gd::String fullName = eventsFunctionsExtension.GetFullName() ||
                        eventsFunctionsExtension.GetName();
  extension
      .SetExtensionInformation(eventsFunctionsExtension.GetName(), fullName,
                               eventsFunctionsExtension.GetDescription(),
                               eventsFunctionsExtension.GetAuthor(), "")
      .SetExtensionHelpPath(eventsFunctionsExtension.GetHelpPath())
      .SetIconUrl(eventsFunctionsExtension.GetIconUrl());

  for(auto tag : eventsFunctionsExtension.GetTags()) {
    extension.AddTag(tag);
  }

  if (!fullName.empty()) {
    extension.AddInstructionOrExpressionGroupMetadata(fullName).SetIcon(
        eventsFunctionsExtension.GetIconUrl());
  }

  if (!eventsFunctionsExtension.GetCategory().empty())
    extension.SetCategory(eventsFunctionsExtension.GetCategory());

  DeclareExtensionDependencies(extension, eventsFunctionsExtension);
}

/**
 * Declare the dependencies of an extension from an events based extension.
 */
void MetadataDeclarationHelper::DeclareExtensionDependencies(
    gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension) {
  for (const auto &dependency : eventsFunctionsExtension.GetAllDependencies()) {
    extension.AddDependency().CopyFrom(dependency);
  }
}

const gd::String MetadataDeclarationHelper::defaultExtensionIconPath =
    "res/function24.png";

const gd::String &MetadataDeclarationHelper::GetExtensionIconUrl(
    gd::PlatformExtension &extension) {
  auto &test = extension.GetIconUrl() ||
               MetadataDeclarationHelper::defaultExtensionIconPath;
  return test;
}

/**
 * Declare the behavior for the given
 * events based behavior.
 */
gd::BehaviorMetadata &MetadataDeclarationHelper::DeclareBehaviorMetadata(
    const gd::Project &project,
    gd::PlatformExtension &extension,
    const gd::EventsBasedBehavior &eventsBasedBehavior) {
  auto &behaviorMetadata =
      extension
          .AddBehavior(
              eventsBasedBehavior.GetName(),
              eventsBasedBehavior.GetFullName() ||
                  eventsBasedBehavior.GetName(),
              eventsBasedBehavior.GetName(),
              eventsBasedBehavior.GetDescription(), "",
              GetExtensionIconUrl(extension), "",
              std::make_shared<gd::CustomBehavior>(
                  eventsBasedBehavior.GetName(), project,
                  PlatformExtension::GetBehaviorFullType(
                      extension.GetName(), eventsBasedBehavior.GetName())),
              std::make_shared<gd::CustomBehaviorsSharedData>(
                  eventsBasedBehavior.GetName(), project,
                  PlatformExtension::GetBehaviorFullType(
                      extension.GetName(), eventsBasedBehavior.GetName())))
          .SetObjectType(eventsBasedBehavior.GetObjectType());

  if (eventsBasedBehavior.IsPrivate())
    behaviorMetadata.SetPrivate();

  return behaviorMetadata;
}

/**
 * Declare the object for the given
 * events based object.
 */
gd::ObjectMetadata &MetadataDeclarationHelper::DeclareObjectMetadata(
    gd::PlatformExtension &extension,
    const gd::EventsBasedObject &eventsBasedObject) {
  auto &objectMetadata =
      extension
          .AddEventsBasedObject(eventsBasedObject.GetName(),
                                eventsBasedObject.GetFullName() ||
                                    eventsBasedObject.GetName(),
                                eventsBasedObject.GetDescription(),
                                GetExtensionIconUrl(extension))
          // TODO Change the metadata model to only set a category on the
          // extension. If an extension has behavior or object across
          // several categories, we can assume it"s not scoped correctly.
          // Note: EventsFunctionsExtension should be used instead of
          // PlatformExtension but this line will be removed soon.
          .SetCategoryFullName(extension.GetCategory())
          .AddDefaultBehavior("ResizableCapability::ResizableBehavior")
          .AddDefaultBehavior("ScalableCapability::ScalableBehavior")
          .AddDefaultBehavior("FlippableCapability::FlippableBehavior");
  if (eventsBasedObject.IsRenderedIn3D()) {
    objectMetadata
        .MarkAsRenderedIn3D()
        .AddDefaultBehavior("Scene3D::Base3DBehavior");
  }
  else {
    objectMetadata.AddDefaultBehavior("EffectCapability::EffectBehavior");
    objectMetadata.AddDefaultBehavior("OpacityCapability::OpacityBehavior");
  }
  if (eventsBasedObject.IsAnimatable()) {
    objectMetadata
        .AddDefaultBehavior("AnimatableCapability::AnimatableBehavior");
  }
  if (eventsBasedObject.IsTextContainer()) {
    objectMetadata
        .AddDefaultBehavior("TextContainerCapability::TextContainerBehavior");
  }

  // TODO EBO Use full type to identify object to avoid collision.
  // Objects are identified by their name alone.
  const gd::String &objectType = eventsBasedObject.GetName();

  // Deprecated
  objectMetadata
      .AddScopedAction("Width", _("Width"), _("Change the width of an object."),
                       _("the width"), _("Size"),
                       "res/actions/scaleWidth24_black.png",
                       "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setWidth")
      .SetGetter("getWidth");

  // Deprecated
  objectMetadata
      .AddAction("Width", _("Width"), _("Change the width of an object."),
                 _("the width"), _("Size"),
                 "res/actions/scaleWidth24_black.png",
                 "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setWidth")
      .SetGetter("getWidth");

  // Deprecated
  objectMetadata
      .AddScopedAction("Height", _("Height"),
                       _("Change the height of an object."), _("the height"),
                       _("Size"), "res/actions/scaleHeight24_black.png",
                       "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setHeight")
      .SetGetter("getHeight");

  // Deprecated
  objectMetadata
      .AddAction("Height", _("Height"), _("Change the height of an object."),
                 _("the height"), _("Size"),
                 "res/actions/scaleHeight24_black.png",
                 "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setHeight")
      .SetGetter("getHeight");

  // Deprecated
  objectMetadata
      .AddScopedAction(
          "Scale", _("Scale"), _("Modify the scale of the specified object."),
          _("the scale"), _("Size"), "res/actions/scale24_black.png",
          "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setScale")
      .SetGetter("getScaleMean");

  // Deprecated
  objectMetadata
      .AddAction("Scale", _("Scale"),
                 _("Modify the scale of the specified object."), _("the scale"),
                 _("Size"), "res/actions/scale24_black.png",
                 "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setScale")
      .SetGetter("getScaleMean");

  // Deprecated
  objectMetadata
      .AddExpressionAndConditionAndAction(
          "number", "ScaleX", _("Scale on X axis"),
          _("the width's scale of an object"), _("the width's scale"),
          _("Size"), "res/actions/scaleWidth24_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setScaleX")
      .SetGetter("getScaleX");

  // Deprecated
  objectMetadata
      .AddExpressionAndConditionAndAction(
          "number", "ScaleY", _("Scale on Y axis"),
          _("the height's scale of an object"), _("the height's scale"),
          _("Size"), "res/actions/scaleHeight24_black.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("setScaleY")
      .SetGetter("getScaleY");

  // Deprecated
  objectMetadata
      .AddScopedAction("FlipX", _("Flip the object horizontally"),
                       _("Flip the object horizontally"),
                       _("Flip horizontally _PARAM0_: _PARAM1_"), _("Effects"),
                       "res/actions/flipX24.png", "res/actions/flipX.png")
      .AddParameter("object", _("Object"), objectType)
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple()
      .SetHidden()
      .SetFunctionName("flipX");

  // Deprecated
  objectMetadata
      .AddAction("FlipX", _("Flip the object horizontally"),
                 _("Flip the object horizontally"),
                 _("Flip horizontally _PARAM0_: _PARAM1_"), _("Effects"),
                 "res/actions/flipX24.png", "res/actions/flipX.png")
      .AddParameter("object", _("Object"), objectType)
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple()
      .SetHidden()
      .SetFunctionName("flipX");

  // Deprecated
  objectMetadata
      .AddScopedAction("FlipY", _("Flip the object vertically"),
                       _("Flip the object vertically"),
                       _("Flip vertically _PARAM0_: _PARAM1_"), _("Effects"),
                       "res/actions/flipY24.png", "res/actions/flipY.png")
      .AddParameter("object", _("Object"), objectType)
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple()
      .SetHidden()
      .SetFunctionName("flipY");

  // Deprecated
  objectMetadata
      .AddAction("FlipY", _("Flip the object vertically"),
                 _("Flip the object vertically"),
                 _("Flip vertically _PARAM0_: _PARAM1_"), _("Effects"),
                 "res/actions/flipY24.png", "res/actions/flipY.png")
      .SetHidden()
      .AddParameter("object", _("Object"), objectType)
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple()
      .SetHidden()
      .SetFunctionName("flipY");

  // Deprecated
  objectMetadata
      .AddScopedCondition("FlippedX", _("Horizontally flipped"),
                          _("Check if the object is horizontally flipped"),
                          _("_PARAM0_ is horizontally flipped"), _("Effects"),
                          "res/actions/flipX24.png", "res/actions/flipX.png")
      .AddParameter("object", _("Object"), objectType)
      .SetHidden()
      .SetFunctionName("isFlippedX");

  // Deprecated
  objectMetadata
      .AddCondition("FlippedX", _("Horizontally flipped"),
                    _("Check if the object is horizontally flipped"),
                    _("_PARAM0_ is horizontally flipped"), _("Effects"),
                    "res/actions/flipX24.png", "res/actions/flipX.png")
      .AddParameter("object", _("Object"), objectType)
      .SetHidden()
      .SetFunctionName("isFlippedX");

  // Deprecated
  objectMetadata
      .AddScopedCondition("FlippedY", _("Vertically flipped"),
                          _("Check if the object is vertically flipped"),
                          _("_PARAM0_ is vertically flipped"), _("Effects"),
                          "res/actions/flipY24.png", "res/actions/flipY.png")
      .AddParameter("object", _("Object"), objectType)
      .SetHidden()
      .SetFunctionName("isFlippedY");

  // Deprecated
  objectMetadata
      .AddCondition("FlippedY", _("Vertically flipped"),
                    _("Check if the object is vertically flipped"),
                    _("_PARAM0_ is vertically flipped"), _("Effects"),
                    "res/actions/flipY24.png", "res/actions/flipY.png")
      .AddParameter("object", _("Object"), objectType)
      .SetHidden()
      .SetFunctionName("isFlippedY");

  objectMetadata
      .AddExpressionAndConditionAndAction(
          "number", "Opacity", _("Opacity"),
          _("the opacity of an object, between 0 (fully transparent) to 255 "
            "(opaque)"),
          _("the opacity"), _("Visibility"), "res/conditions/opacity24.png")
      .AddParameter("object", _("Object"), objectType)
      .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions())
      .SetFunctionName("setOpacity")
      .SetGetter("getOpacity")
      .SetHidden();

  return objectMetadata;
}

/**
 * Check if the name of the function is the name of a lifecycle function (for
 * events-based behaviors), that will be called automatically by the game
 * engine.
 */
bool MetadataDeclarationHelper::IsBehaviorLifecycleEventsFunction(
    const gd::String &functionName) {
  return functionName == "onCreated" || functionName == "onActivate" ||
         functionName == "onDeActivate" || functionName == "doStepPreEvents" ||
         functionName == "doStepPostEvents" || functionName == "onDestroy" ||
         // Compatibility with GD <= 5.0 beta 75
         functionName == "onOwnerRemovedFromScene";
  // end of compatibility code
}

/**
 * Check if the name of the function is the name of a lifecycle function (for
 * events-based objects), that will be called automatically by the game engine.
 */
bool MetadataDeclarationHelper::IsObjectLifecycleEventsFunction(
    const gd::String &functionName) {
  return functionName == "onCreated" || functionName == "doStepPostEvents" ||
         functionName == "onDestroy" || functionName == "onHotReloading";
}

/**
 * Check if the name of the function is the name of a lifecycle function (for
 * events-based extensions), that will be called automatically by the game
 * engine.
 */
bool MetadataDeclarationHelper::IsExtensionLifecycleEventsFunction(
    const gd::String &functionName) {
  return gd::EventsFunctionsExtension::IsExtensionLifecycleEventsFunction(
      functionName);
}

gd::String
MetadataDeclarationHelper::RemoveTrailingDot(const gd::String &description) {
  return description.length() > 0 &&
                 description[description.length() - 1] == '.'
             ? description.substr(0, description.length() - 1)
             : description;
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * (free) events function.
 */
gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::DeclareInstructionOrExpressionMetadata(
    gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction) {
  const gd::String &functionName =
      GetFreeFunctionCodeName(eventsFunctionsExtension, eventsFunction);

  if (eventsFunction.IsExpression()) {
    auto &expression = DeclareExpressionMetadata(
        extension, eventsFunctionsExtension, eventsFunction);

    expression.SetFunctionName(functionName);

    return expression;
  } else {
    auto &instruction = DeclareInstructionMetadata(
        extension, eventsFunctionsExtension, eventsFunction);

    if (eventsFunction.IsAsync()) {
      instruction.SetAsyncFunctionName(functionName);
    } else {
      instruction.SetFunctionName(functionName);
    }

    return instruction;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * (free) events function.
 */
gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::DeclareExpressionMetadata(
    gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction) {
  auto functionType = eventsFunction.GetFunctionType();
  if (functionType == gd::EventsFunction::ExpressionAndCondition) {
    auto expressionAndCondition = extension.AddExpressionAndCondition(
        gd::ValueTypeMetadata::GetPrimitiveValueType(
            eventsFunction.GetExpressionType().GetName()),
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        RemoveTrailingDot(eventsFunction.GetDescription()) ||
            eventsFunction.GetFullName(),
        // An operator and an operand are inserted before user parameters.
        ShiftSentenceParamIndexes(eventsFunction.GetSentence(), 2),
        eventsFunction.GetGroup(), GetExtensionIconUrl(extension));
    // By convention, first parameter is always the Runtime Scene.
    expressionAndCondition.AddCodeOnlyParameter("currentScene", "");
    DeclareEventsFunctionParameters(eventsFunctionsExtension, eventsFunction,
                                    expressionAndCondition, 0);
    expressionAndConditions.push_back(expressionAndCondition);
    return expressionAndConditions.back();
  } else {
    auto &expression =
        eventsFunction.GetExpressionType().IsNumber()
            ? extension.AddExpression(
                  eventsFunction.GetName(),
                  eventsFunction.GetFullName() || eventsFunction.GetName(),
                  eventsFunction.GetDescription() ||
                      eventsFunction.GetFullName(),
                  eventsFunction.GetGroup(), GetExtensionIconUrl(extension))
            : extension.AddStrExpression(
                  eventsFunction.GetName(),
                  eventsFunction.GetFullName() || eventsFunction.GetName(),
                  eventsFunction.GetDescription() ||
                      eventsFunction.GetFullName(),
                  eventsFunction.GetGroup(), GetExtensionIconUrl(extension));
    // By convention, first parameter is always the Runtime Scene.
    expression.AddCodeOnlyParameter("currentScene", "");
    DeclareEventsFunctionParameters(eventsFunctionsExtension, eventsFunction,
                                    expression, 0);
    return expression;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * (free) events function.
 */
gd::InstructionMetadata &MetadataDeclarationHelper::DeclareInstructionMetadata(
    gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction) {
  auto functionType = eventsFunction.GetFunctionType();
  if (functionType == gd::EventsFunction::Condition) {
    auto &action = extension.AddCondition(
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        eventsFunction.GetDescription() || eventsFunction.GetFullName(),
        eventsFunction.GetSentence(), eventsFunction.GetGroup(),
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
    // By convention, first parameter is always the Runtime Scene.
    action.AddCodeOnlyParameter("currentScene", "");
    DeclareEventsFunctionParameters(eventsFunctionsExtension, eventsFunction,
                                    action, 0);
    return action;
  } else if (functionType == gd::EventsFunction::ActionWithOperator) {
    if (eventsFunctionsExtension.HasEventsFunctionNamed(
            eventsFunction.GetGetterName())) {
      auto &getterFunction = eventsFunctionsExtension.GetEventsFunction(
          eventsFunction.GetGetterName());

      auto &action = extension.AddAction(
          eventsFunction.GetName(),
          getterFunction.GetFullName() || eventsFunction.GetName(),
          "Change " +
              (getterFunction.GetDescription() || eventsFunction.GetFullName()),
          // An operator and an operand are inserted before user parameters.
          ShiftSentenceParamIndexes(getterFunction.GetSentence(), 2),
          getterFunction.GetGroup(), GetExtensionIconUrl(extension),
          GetExtensionIconUrl(extension));
      action
          .SetManipulatedType(gd::ValueTypeMetadata::GetPrimitiveValueType(
              getterFunction.GetExpressionType().GetName()))
          // TODO Use an helper method
          .SetGetter(GetFreeFunctionCodeName(eventsFunctionsExtension,
                                             getterFunction));
      // By convention, first parameter is always the Runtime Scene.
      action.AddCodeOnlyParameter("currentScene", "");
      DeclareEventsFunctionParameters(eventsFunctionsExtension, eventsFunction,
                                      action, 0);
      return action;
    } else {

      auto &action = extension.AddAction(
          eventsFunction.GetName(), eventsFunction.GetName(),
          _("Change <subject>")
              .FindAndReplace("<subject>", eventsFunction.GetFullName()),
          // An operator and an operand are inserted before user parameters.
          "", "", GetExtensionIconUrl(extension),
          GetExtensionIconUrl(extension));
      // By convention, first parameter is always the Runtime Scene.
      action.AddCodeOnlyParameter("currentScene", "");
      DeclareEventsFunctionParameters(eventsFunctionsExtension, eventsFunction,
                                      action, 0);
      return action;
    }
  } else {
    auto &action = extension.AddAction(
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        eventsFunction.GetDescription() || eventsFunction.GetFullName(),
        eventsFunction.GetSentence(), eventsFunction.GetGroup(),
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
    // By convention, first parameter is always the Runtime Scene.
    action.AddCodeOnlyParameter("currentScene", "");
    DeclareEventsFunctionParameters(eventsFunctionsExtension, eventsFunction,
                                    action, 0);
    return action;
  }
}

gd::String MetadataDeclarationHelper::ShiftSentenceParamIndexes(
    const gd::String &sentence_, const int offset) {
  const std::string &sentence = sentence_.Raw();
  const std::regex paramRegex("_PARAM(\\d+)_");

  auto words_begin =
      std::sregex_iterator(sentence.begin(), sentence.end(), paramRegex);
  auto words_end = std::sregex_iterator();

  if (words_begin == words_end) {
    return sentence_;
  }
  gd::String shiftedSentence = "";
  std::smatch paramMatch;
  for (std::sregex_iterator i = words_begin; i != words_end; ++i) {
    paramMatch = *i;

    shiftedSentence += gd::String::FromUTF8(paramMatch.prefix().str());
    int parameterIndex = std::stoi(paramMatch[1]);
    shiftedSentence +=
        "_PARAM" + gd::String::From(parameterIndex + offset) + "_";
  }
  shiftedSentence += gd::String::FromUTF8(paramMatch.suffix().str());

  return shiftedSentence;
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * behavior events function.
 */
gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::DeclareBehaviorInstructionOrExpressionMetadata(
    gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::EventsFunction &eventsFunction,
    std::map<gd::String, gd::String> &objectMethodMangledNames) {
  auto eventsFunctionMangledName =
      EventsCodeNameMangler::GetMangledName(eventsFunction.GetName());
  objectMethodMangledNames[eventsFunction.GetName()] =
      eventsFunctionMangledName;

  if (eventsFunction.IsExpression()) {
    auto &expression = DeclareBehaviorExpressionMetadata(
        extension, behaviorMetadata, eventsBasedBehavior, eventsFunction);

    expression.SetFunctionName(eventsFunctionMangledName);

    return expression;
  } else {
    auto &instruction = DeclareBehaviorInstructionMetadata(
        extension, behaviorMetadata, eventsBasedBehavior, eventsFunction);

    if (eventsFunction.IsAsync()) {
      instruction.SetAsyncFunctionName(eventsFunctionMangledName);
    } else {
      instruction.SetFunctionName(eventsFunctionMangledName);
    }

    return instruction;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * behavior events function.
 */
gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::DeclareBehaviorExpressionMetadata(
    gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::EventsFunction &eventsFunction) {
  auto functionType = eventsFunction.GetFunctionType();
  if (functionType == gd::EventsFunction::ExpressionAndCondition) {
    auto expressionAndCondition = behaviorMetadata.AddExpressionAndCondition(
        gd::ValueTypeMetadata::GetPrimitiveValueType(
            eventsFunction.GetExpressionType().GetName()),
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        RemoveTrailingDot(eventsFunction.GetDescription()) ||
            eventsFunction.GetFullName(),
        // An operator and an operand are inserted before user parameters.
        ShiftSentenceParamIndexes(eventsFunction.GetSentence(), 2),
        eventsFunction.GetGroup() || eventsBasedBehavior.GetFullName() ||
            eventsBasedBehavior.GetName(),
        GetExtensionIconUrl(extension));
    DeclareEventsFunctionParameters(eventsBasedBehavior.GetEventsFunctions(),
                                    eventsFunction, expressionAndCondition, 2);
    expressionAndConditions.push_back(expressionAndCondition);
    return expressionAndConditions.back();
  } else {
    auto &expression =
        (eventsFunction.GetExpressionType().IsNumber())
            ? behaviorMetadata.AddExpression(
                  eventsFunction.GetName(),
                  eventsFunction.GetFullName() || eventsFunction.GetName(),
                  eventsFunction.GetDescription() ||
                      eventsFunction.GetFullName(),
                  eventsFunction.GetGroup() ||
                      eventsBasedBehavior.GetFullName() ||
                      eventsBasedBehavior.GetName(),
                  GetExtensionIconUrl(extension))
            : behaviorMetadata.AddStrExpression(
                  eventsFunction.GetName(),
                  eventsFunction.GetFullName() || eventsFunction.GetName(),
                  eventsFunction.GetDescription() ||
                      eventsFunction.GetFullName(),
                  eventsFunction.GetGroup() ||
                      eventsBasedBehavior.GetFullName() ||
                      eventsBasedBehavior.GetName(),
                  GetExtensionIconUrl(extension));
    DeclareEventsFunctionParameters(eventsBasedBehavior.GetEventsFunctions(),
                                    eventsFunction, expression, 2);
    return expression;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * behavior events function.
 */
gd::InstructionMetadata &
MetadataDeclarationHelper::DeclareBehaviorInstructionMetadata(
    gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::EventsFunction &eventsFunction) {
  auto functionType = eventsFunction.GetFunctionType();
  if (functionType == gd::EventsFunction::Condition) {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    auto &condition = behaviorMetadata.AddScopedCondition(
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        eventsFunction.GetDescription() || eventsFunction.GetFullName(),
        eventsFunction.GetSentence(),
        eventsFunction.GetGroup() || eventsBasedBehavior.GetFullName() ||
            eventsBasedBehavior.GetName(),
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
    DeclareEventsFunctionParameters(eventsBasedBehavior.GetEventsFunctions(),
                                    eventsFunction, condition, 2);
    return condition;
  } else if (functionType == gd::EventsFunction::ActionWithOperator) {
    auto &eventsFunctionsContainer = eventsBasedBehavior.GetEventsFunctions();
    if (eventsFunctionsContainer.HasEventsFunctionNamed(
            eventsFunction.GetGetterName())) {
      auto &getterFunction = eventsFunctionsContainer.GetEventsFunction(
          eventsFunction.GetGetterName());
      auto &action = behaviorMetadata.AddScopedAction(
          eventsFunction.GetName(),
          getterFunction.GetFullName() || eventsFunction.GetName(),
          _("Change <subject>")
              .FindAndReplace("<subject>", getterFunction.GetDescription() ||
                                               eventsFunction.GetFullName()),
          // An operator and an operand are inserted before user parameters.
          ShiftSentenceParamIndexes(getterFunction.GetSentence(), 2),
          getterFunction.GetGroup() || eventsBasedBehavior.GetFullName() ||
              eventsBasedBehavior.GetName(),
          GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
      action
          .SetManipulatedType(gd::ValueTypeMetadata::GetPrimitiveValueType(
              getterFunction.GetExpressionType().GetName()))
          .SetGetter(getterFunction.GetName());

      DeclareEventsFunctionParameters(eventsBasedBehavior.GetEventsFunctions(),
                                      eventsFunction, action, 2);
      return action;
    } else {
      auto &action = behaviorMetadata.AddScopedAction(
          eventsFunction.GetName(), eventsFunction.GetName(),
          _("Change <subject>")
              .FindAndReplace("<subject>", eventsFunction.GetFullName()),
          // An operator and an operand are inserted before user parameters.
          "",
          eventsBasedBehavior.GetFullName() || eventsBasedBehavior.GetName(),
          GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));

      DeclareEventsFunctionParameters(eventsBasedBehavior.GetEventsFunctions(),
                                      eventsFunction, action, 2);
      return action;
    }
  } else {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    auto &action = behaviorMetadata.AddScopedAction(
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        eventsFunction.GetDescription() || eventsFunction.GetFullName(),
        eventsFunction.GetSentence(),
        eventsFunction.GetGroup() || eventsBasedBehavior.GetFullName() ||
            eventsBasedBehavior.GetName(),
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));

    DeclareEventsFunctionParameters(eventsBasedBehavior.GetEventsFunctions(),
                                    eventsFunction, action, 2);
    return action;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * object events function.
 */
gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::DeclareObjectInstructionOrExpressionMetadata(
    gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction,
    std::map<gd::String, gd::String> &objectMethodMangledNames) {
  auto eventsFunctionMangledName =
      EventsCodeNameMangler::GetMangledName(eventsFunction.GetName());
  objectMethodMangledNames[eventsFunction.GetName()] =
      eventsFunctionMangledName;

  if (eventsFunction.IsExpression()) {
    auto &expression = DeclareObjectExpressionMetadata(
        extension, objectMetadata, eventsBasedObject, eventsFunction);

    expression.SetFunctionName(eventsFunctionMangledName);

    return expression;
  } else {
    auto &instruction = DeclareObjectInstructionMetadata(
        extension, objectMetadata, eventsBasedObject, eventsFunction);

    if (eventsFunction.IsAsync()) {
      instruction.SetAsyncFunctionName(eventsFunctionMangledName);
    } else {
      instruction.SetFunctionName(eventsFunctionMangledName);
    }

    return instruction;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * object events function.
 */
gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::DeclareObjectExpressionMetadata(
    gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction) {
  auto functionType = eventsFunction.GetFunctionType();
  if (functionType == gd::EventsFunction::ExpressionAndCondition) {
    auto expressionAndCondition = objectMetadata.AddExpressionAndCondition(
        gd::ValueTypeMetadata::GetPrimitiveValueType(
            eventsFunction.GetExpressionType().GetName()),
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        RemoveTrailingDot(eventsFunction.GetDescription()) ||
            eventsFunction.GetFullName(),
        // An operator and an operand are inserted before user parameters.
        ShiftSentenceParamIndexes(eventsFunction.GetSentence(), 2),
        eventsFunction.GetGroup() || eventsBasedObject.GetFullName() ||
            eventsBasedObject.GetName(),
        GetExtensionIconUrl(extension));

    DeclareEventsFunctionParameters(eventsBasedObject.GetEventsFunctions(),
                                    eventsFunction, expressionAndCondition, 1);
    expressionAndConditions.push_back(expressionAndCondition);
    return expressionAndConditions.back();
  } else {
    auto &expression =
        (eventsFunction.GetExpressionType().IsNumber())
            ? objectMetadata.AddExpression(
                  eventsFunction.GetName(),
                  eventsFunction.GetFullName() || eventsFunction.GetName(),
                  eventsFunction.GetDescription() ||
                      eventsFunction.GetFullName(),
                  eventsFunction.GetGroup() ||
                      eventsBasedObject.GetFullName() ||
                      eventsBasedObject.GetName(),
                  GetExtensionIconUrl(extension))
            : objectMetadata.AddStrExpression(
                  eventsFunction.GetName(),
                  eventsFunction.GetFullName() || eventsFunction.GetName(),
                  eventsFunction.GetDescription() ||
                      eventsFunction.GetFullName(),
                  eventsFunction.GetGroup() ||
                      eventsBasedObject.GetFullName() ||
                      eventsBasedObject.GetName(),
                  GetExtensionIconUrl(extension));

    DeclareEventsFunctionParameters(eventsBasedObject.GetEventsFunctions(),
                                    eventsFunction, expression, 1);
    return expression;
  }
}

/**
 * Declare the instruction (action/condition) or expression for the given
 * object events function.
 */
gd::InstructionMetadata &
MetadataDeclarationHelper::DeclareObjectInstructionMetadata(
    gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction) {
  auto functionType = eventsFunction.GetFunctionType();
  if (functionType == gd::EventsFunction::Condition) {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // objects (that can totally have functions with the same name).
    auto &condition = objectMetadata.AddScopedCondition(
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        eventsFunction.GetDescription() || eventsFunction.GetFullName(),
        eventsFunction.GetSentence(),
        eventsFunction.GetGroup() || eventsBasedObject.GetFullName() ||
            eventsBasedObject.GetName(),
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));

    DeclareEventsFunctionParameters(eventsBasedObject.GetEventsFunctions(),
                                    eventsFunction, condition, 1);
    return condition;
  } else if (functionType == gd::EventsFunction::ActionWithOperator) {
    auto &eventsFunctionsContainer = eventsBasedObject.GetEventsFunctions();
    if (eventsFunctionsContainer.HasEventsFunctionNamed(
            eventsFunction.GetGetterName())) {
      auto &getterFunction = eventsFunctionsContainer.GetEventsFunction(
          eventsFunction.GetGetterName());
      auto &action = objectMetadata.AddScopedAction(
          eventsFunction.GetName(),
          getterFunction.GetFullName() || eventsFunction.GetName(),
          "Change " +
              (getterFunction.GetDescription() || eventsFunction.GetFullName()),
          // An operator and an operand are inserted before user parameters.
          ShiftSentenceParamIndexes(getterFunction.GetSentence(), 2),
          getterFunction.GetGroup() || eventsBasedObject.GetFullName() ||
              eventsBasedObject.GetName(),
          GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
      action
          .SetManipulatedType(gd::ValueTypeMetadata::GetPrimitiveValueType(
              getterFunction.GetExpressionType().GetName()))
          .SetGetter(getterFunction.GetName());

      DeclareEventsFunctionParameters(eventsBasedObject.GetEventsFunctions(),
                                      eventsFunction, action, 1);
      return action;
    } else {
      auto &action = objectMetadata.AddScopedAction(
          eventsFunction.GetName(), eventsFunction.GetName(),
          _("Change <subject>")
              .FindAndReplace("<subject>", eventsFunction.GetFullName()),
          // An operator and an operand are inserted before user parameters.
          "", eventsBasedObject.GetFullName() || eventsBasedObject.GetName(),
          GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));

      DeclareEventsFunctionParameters(eventsBasedObject.GetEventsFunctions(),
                                      eventsFunction, action, 1);
      return action;
    }
  } else {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // objects (that can totally have functions with the same name).
    auto &action = objectMetadata.AddScopedAction(
        eventsFunction.GetName(),
        eventsFunction.GetFullName() || eventsFunction.GetName(),
        eventsFunction.GetDescription() || eventsFunction.GetFullName(),
        eventsFunction.GetSentence(),
        eventsFunction.GetGroup() || eventsBasedObject.GetFullName() ||
            eventsBasedObject.GetName(),
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));

    DeclareEventsFunctionParameters(eventsBasedObject.GetEventsFunctions(),
                                    eventsFunction, action, 1);
    return action;
  }
}

gd::String MetadataDeclarationHelper::GetStringifiedExtraInfo(
    const gd::PropertyDescriptor &property) {
  if (property.GetType() != "Choice") {
    return "";
  }
  SerializerElement element;
  element.ConsiderAsArray();
  for (auto&& value : property.GetExtraInfo()) {
    element.AddChild("").SetStringValue(value);
  }
  return Serializer::ToJSON(element);
}

gd::String
MetadataDeclarationHelper::UncapitalizeFirstLetter(const gd::String &string) {
  return string.size() < 1 ? string
                           : string.substr(0, 1).LowerCase() + string.substr(1);
}

void MetadataDeclarationHelper::DeclarePropertyInstructionAndExpression(
    gd::PlatformExtension &extension,
    gd::InstructionOrExpressionContainerMetadata &entityMetadata,
    const gd::AbstractEventsBasedEntity &eventsBasedEntity,
    const gd::NamedPropertyDescriptor &property,
    const gd::String &propertyLabel, const gd::String &expressionName,
    const gd::String &conditionName, const gd::String &actionName,
    const gd::String &toggleActionName, const gd::String &setterName,
    const gd::String &getterName, const gd::String &toggleFunctionName,
    const int valueParameterIndex,
    std::function<gd::AbstractFunctionMetadata &(
        gd::AbstractFunctionMetadata &instructionOrExpression)>
        addObjectAndBehaviorParameters) {
  auto &propertyType = property.GetType();

  auto group = (eventsBasedEntity.GetFullName() || eventsBasedEntity.GetName())
        + " " + property.GetGroup() + " properties";

  auto uncapitalizedLabel =
      UncapitalizeFirstLetter(property.GetLabel()) || property.GetName();
  if (propertyType == "Boolean") {
    auto &conditionMetadata = entityMetadata.AddScopedCondition(
        conditionName, propertyLabel,
        _("Check the property value for <property_name>.")
            .FindAndReplace("<property_name>", uncapitalizedLabel),
        _("Property <property_name> of _PARAM0_ is true")
            .FindAndReplace("<property_name>", uncapitalizedLabel),
        group,
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
    addObjectAndBehaviorParameters(conditionMetadata);
    conditionMetadata.SetFunctionName(getterName);

    auto &setterActionMetadata = entityMetadata.AddScopedAction(
        actionName, propertyLabel,
        _("Update the property value for \"<property_name>\".")
            .FindAndReplace("<property_name>", uncapitalizedLabel),
        _("Set property value for <property_name> of _PARAM0_ to "
          "<property_value>")
            .FindAndReplace("<property_name>", uncapitalizedLabel)
            .FindAndReplace("<property_value>",
                            "_PARAM" + gd::String::From(valueParameterIndex) +
                                "_"),
        group,
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
    addObjectAndBehaviorParameters(setterActionMetadata);
    setterActionMetadata
        .AddParameter("yesorno", _("New value to set"), "", false)
        .SetFunctionName(setterName);

    auto &toggleActionMetadata = entityMetadata.AddScopedAction(
        toggleActionName, _("Toggle") + " " + propertyLabel,
        _("Toggle the property value for <property_name>.\n"
          "If it was true, it will become false, and if it was false it "
          "will become true.")
            .FindAndReplace("<property_name>", uncapitalizedLabel),
        _("Toggle property <property_name> of _PARAM0_")
            .FindAndReplace("<property_name>", uncapitalizedLabel),
        group,
        GetExtensionIconUrl(extension), GetExtensionIconUrl(extension));
    addObjectAndBehaviorParameters(toggleActionMetadata);
    toggleActionMetadata.SetFunctionName(toggleFunctionName);
  } else {
    auto typeExtraInfo = GetStringifiedExtraInfo(property);
    auto parameterOptions = gd::ParameterOptions::MakeNewOptions();
    if (!typeExtraInfo.empty())
      parameterOptions.SetTypeExtraInfo(typeExtraInfo);
    auto propertyInstructionMetadata =
        entityMetadata.AddExpressionAndConditionAndAction(
            gd::ValueTypeMetadata::GetPrimitiveValueType(
              gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(propertyType)),
            expressionName, propertyLabel,
            _("the property value for the <property_name>")
                .FindAndReplace("<property_name>", uncapitalizedLabel),
            _("the property value for the <property_name>")
                .FindAndReplace("<property_name>", uncapitalizedLabel),
            group,
            GetExtensionIconUrl(extension));
    addObjectAndBehaviorParameters(propertyInstructionMetadata);
    propertyInstructionMetadata
        .UseStandardParameters(
            gd::ValueTypeMetadata::ConvertPropertyTypeToValueType(propertyType),
            parameterOptions)
        .SetFunctionName(setterName)
        .SetGetter(getterName);
  }
}

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based behavior.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
void MetadataDeclarationHelper::
    DeclareBehaviorPropertiesInstructionAndExpressions(
        gd::PlatformExtension &extension,
        gd::BehaviorMetadata &behaviorMetadata,
        const gd::EventsBasedBehavior &eventsBasedBehavior) {
  auto addObjectAndBehaviorParameters =
      [&eventsBasedBehavior](
          gd::AbstractFunctionMetadata &instructionOrExpression)
      -> gd::AbstractFunctionMetadata & {
    // By convention, first parameter is always the object:
    instructionOrExpression
        .AddParameter("object", "Object",
                      "", // See below for adding the extra information
                      false)
        // Manually add the "extra info" without relying on addParameter
        // as this method is prefixing the value passed with the extension
        // namespace (this was done to ease extension declarations when dealing
        // with object).
        .SetParameterExtraInfo(eventsBasedBehavior.GetObjectType());

    // By convention, second parameter is always the behavior:
    instructionOrExpression.AddParameter("behavior", "Behavior",
                                         eventsBasedBehavior.GetName(), false);

    // All property actions/conditions/expressions are private, meaning
    // they can only be used from the behavior events.
    instructionOrExpression.SetPrivate();

    return instructionOrExpression;
  };

  for (auto &property :
       eventsBasedBehavior.GetPropertyDescriptors().GetInternalVector()) {
    auto &propertyType = property->GetType();
    if (propertyType == "Behavior") {
      // Required behaviors don't need accessors and mutators.
      continue;
    }

    auto &propertyName = property->GetName();
    auto propertyLabel =
        _("<property_name> property")
            .FindAndReplace("<property_name>",
                            property->GetLabel() || propertyName);
    auto expressionName =
        gd::EventsBasedBehavior::GetPropertyExpressionName(propertyName);
    auto conditionName =
        gd::EventsBasedBehavior::GetPropertyConditionName(propertyName);
    auto actionName =
        gd::EventsBasedBehavior::GetPropertyActionName(propertyName);
    auto toggleActionName =
        gd::EventsBasedBehavior::GetPropertyToggleActionName(propertyName);
    auto setterName =
        gdjs::BehaviorCodeGenerator::GetBehaviorPropertySetterName(
            propertyName);
    auto getterName =
        gdjs::BehaviorCodeGenerator::GetBehaviorPropertyGetterName(
            propertyName);
    auto toggleFunctionName =
        gdjs::BehaviorCodeGenerator::GetBehaviorPropertyToggleFunctionName(
            propertyName);

    DeclarePropertyInstructionAndExpression(
        extension, behaviorMetadata, eventsBasedBehavior, *property,
        propertyLabel, expressionName, conditionName, actionName,
        toggleActionName, setterName, getterName, toggleFunctionName, 2,
        addObjectAndBehaviorParameters);
  }

  for (auto &property :
       eventsBasedBehavior.GetSharedPropertyDescriptors().GetInternalVector()) {
    auto &propertyName = property->GetName();
    auto propertyLabel =
        _("<property_name> shared property")
            .FindAndReplace("<property_name>",
                            property->GetLabel() || propertyName);
    auto expressionName =
        gd::EventsBasedBehavior::GetSharedPropertyExpressionName(propertyName);
    auto conditionName =
        gd::EventsBasedBehavior::GetSharedPropertyConditionName(propertyName);
    auto actionName =
        gd::EventsBasedBehavior::GetSharedPropertyActionName(propertyName);
    auto toggleActionName =
        gd::EventsBasedBehavior::GetSharedPropertyToggleActionName(
            propertyName);
    auto setterName =
        gdjs::BehaviorCodeGenerator::GetBehaviorSharedPropertySetterName(
            propertyName);
    auto getterName =
        gdjs::BehaviorCodeGenerator::GetBehaviorSharedPropertyGetterName(
            propertyName);
    auto toggleFunctionName = gdjs::BehaviorCodeGenerator::
        GetBehaviorSharedPropertyToggleFunctionName(propertyName);

    DeclarePropertyInstructionAndExpression(
        extension, behaviorMetadata, eventsBasedBehavior, *property,
        propertyLabel, expressionName, conditionName, actionName,
        toggleActionName, setterName, getterName, toggleFunctionName, 2,
        addObjectAndBehaviorParameters);
  }
}

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based object.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
void MetadataDeclarationHelper::
    DeclareObjectPropertiesInstructionAndExpressions(
        gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
        const gd::EventsBasedObject &eventsBasedObject) {

  auto addObjectParameter =
      [&eventsBasedObject](
          gd::AbstractFunctionMetadata &instructionOrExpression)
      -> gd::AbstractFunctionMetadata & {
    // By convention, first parameter is always the object:
    instructionOrExpression.AddParameter("object", "Object",
                                         eventsBasedObject.GetName(), false);

    // All property actions/conditions/expressions are private, meaning
    // they can only be used from the object events.
    instructionOrExpression.SetPrivate();

    return instructionOrExpression;
  };

  for (auto &property :
       eventsBasedObject.GetPropertyDescriptors().GetInternalVector()) {
    auto &propertyName = property->GetName();
    auto propertyLabel =
        _("<property_name> property")
            .FindAndReplace("<property_name>",
                            property->GetLabel() || propertyName);
    auto expressionName =
        gd::EventsBasedObject::GetPropertyExpressionName(propertyName);
    auto conditionName =
        gd::EventsBasedObject::GetPropertyConditionName(propertyName);
    auto actionName =
        gd::EventsBasedObject::GetPropertyActionName(propertyName);
    auto toggleActionName =
        gd::EventsBasedObject::GetPropertyToggleActionName(propertyName);
    auto getterName =
        gdjs::ObjectCodeGenerator::GetObjectPropertyGetterName(propertyName);
    auto setterName =
        gdjs::ObjectCodeGenerator::GetObjectPropertySetterName(propertyName);
    auto toggleFunctionName =
        gdjs::ObjectCodeGenerator::GetObjectPropertyToggleFunctionName(
            propertyName);

    DeclarePropertyInstructionAndExpression(
        extension, objectMetadata, eventsBasedObject, *property, propertyLabel,
        expressionName, conditionName, actionName, toggleActionName, setterName,
        getterName, toggleFunctionName, 1, addObjectParameter);
  }
}

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based object.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
void MetadataDeclarationHelper::DeclareObjectInternalInstructions(
    gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
    const gd::EventsBasedObject &eventsBasedObject) {
  // TODO EBO Use full type to identify object to avoid collision.
  // Objects are identified by their name alone.
  auto &objectType = eventsBasedObject.GetName();

  if (eventsBasedObject.IsRenderedIn3D()) {
    objectMetadata
        .AddScopedAction(
            "SetRotationCenter", _("Center of rotation"),
            _("Change the center of rotation of an object relatively to the "
              "object origin."),
            _("Change the center of rotation of _PARAM0_ to _PARAM1_ ; _PARAM2_ ; _PARAM3_"),
            _("Angle"), "res/actions/position24_black.png",
            "res/actions/position_black.png")
        .AddParameter("object", _("Object"), objectType)
        .AddParameter("number", _("X position"))
        .AddParameter("number", _("Y position"))
        .AddParameter("number", _("Z position"))
        .MarkAsAdvanced()
        .SetPrivate()
        .SetFunctionName("setRotationCenter3D");
  }
  else {
    objectMetadata
        .AddScopedAction(
            "SetRotationCenter", _("Center of rotation"),
            _("Change the center of rotation of an object relatively to the "
              "object origin."),
            _("Change the center of rotation of _PARAM0_ to _PARAM1_ ; _PARAM2_"),
            _("Angle"), "res/actions/position24_black.png",
            "res/actions/position_black.png")
        .AddParameter("object", _("Object"), objectType)
        .AddParameter("number", _("X position"))
        .AddParameter("number", _("Y position"))
        .MarkAsAdvanced()
        .SetPrivate()
        .SetFunctionName("setRotationCenter");
  }
}

void MetadataDeclarationHelper::AddParameter(
    gd::AbstractFunctionMetadata &instructionOrExpression,
    const gd::ParameterMetadata &parameter) {
  if (!parameter.IsCodeOnly()) {
    instructionOrExpression
        .AddParameter(parameter.GetType(), parameter.GetDescription(),
                      "", // See below for adding the extra information
                      parameter.IsOptional())
        // Manually add the "extra info" without relying on addParameter (or
        // addCodeOnlyParameter) as these methods are prefixing the value passed
        // with the extension namespace (this was done to ease extension
        // declarations when dealing with object).
        .SetParameterExtraInfo(parameter.GetExtraInfo());
    instructionOrExpression.SetParameterLongDescription(
        parameter.GetLongDescription());
    instructionOrExpression.SetDefaultValue(parameter.GetDefaultValue());
  } else {
    instructionOrExpression.AddCodeOnlyParameter(parameter.GetType(),
                                                 parameter.GetExtraInfo());
  }
};

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
void MetadataDeclarationHelper::DeclareEventsFunctionParameters(
    const gd::EventsFunctionsContainer &eventsFunctionsContainer,
    const gd::EventsFunction &eventsFunction,
    gd::ExpressionMetadata &expression,
    const int userDefinedFirstParameterIndex) {
  auto functionType = eventsFunction.GetFunctionType();

  bool hasGetterFunction = eventsFunctionsContainer.HasEventsFunctionNamed(
      eventsFunction.GetGetterName());

  // This is used instead of getParametersForEvents because the Value parameter
  // is already add by useStandardOperatorParameters.
  auto &parameters = (functionType == gd::EventsFunction::ActionWithOperator &&
                              hasGetterFunction
                          ? eventsFunctionsContainer.GetEventsFunction(
                                eventsFunction.GetGetterName())
                          : eventsFunction)
                         .GetParameters();

  for (size_t i = 0;
       i < userDefinedFirstParameterIndex && i < parameters.size(); i++) {
    const gd::ParameterMetadata &parameter = parameters.at(i);
    AddParameter(expression, parameter);
  }

  for (size_t i = userDefinedFirstParameterIndex; i < parameters.size(); i++) {
    const gd::ParameterMetadata &parameter = parameters.at(i);
    AddParameter(expression, parameter);
  }

  // By convention, latest parameter is always the eventsFunctionContext of the
  // calling function (if any).
  expression.AddCodeOnlyParameter("eventsFunctionContext", "");
}

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
void MetadataDeclarationHelper::DeclareEventsFunctionParameters(
    const gd::EventsFunctionsContainer &eventsFunctionsContainer,
    const gd::EventsFunction &eventsFunction,
    gd::InstructionMetadata &instruction,
    const int userDefinedFirstParameterIndex) {
  auto functionType = eventsFunction.GetFunctionType();

  bool hasGetterFunction = eventsFunctionsContainer.HasEventsFunctionNamed(
      eventsFunction.GetGetterName());

  // This is used instead of getParametersForEvents because the Value parameter
  // is already add by useStandardOperatorParameters.
  auto &parameters = (functionType == gd::EventsFunction::ActionWithOperator &&
                              hasGetterFunction
                          ? eventsFunctionsContainer.GetEventsFunction(
                                eventsFunction.GetGetterName())
                          : eventsFunction)
                         .GetParameters();

  for (size_t i = 0;
       i < userDefinedFirstParameterIndex && i < parameters.size(); i++) {
    const gd::ParameterMetadata &parameter = parameters.at(i);
    AddParameter(instruction, parameter);
  }

  if (functionType == gd::EventsFunction::ActionWithOperator) {
    auto options = gd::ParameterOptions::MakeNewOptions();
    if (hasGetterFunction) {
      auto &getterFunction = eventsFunctionsContainer.GetEventsFunction(
          eventsFunction.GetGetterName());

      auto &extraInfo = getterFunction.GetExpressionType().GetExtraInfo();
      if (!extraInfo.empty())
        options.SetTypeExtraInfo(extraInfo);
      instruction.UseStandardOperatorParameters(
          getterFunction.GetExpressionType().GetName(), options);
    } else {
      instruction.UseStandardOperatorParameters("string", options);
    }
  }

  for (size_t i = userDefinedFirstParameterIndex; i < parameters.size(); i++) {
    const gd::ParameterMetadata &parameter = parameters.at(i);
    AddParameter(instruction, parameter);
  }

  // By convention, latest parameter is always the eventsFunctionContext of the
  // calling function (if any).
  instruction.AddCodeOnlyParameter("eventsFunctionContext", "");
}

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
void MetadataDeclarationHelper::DeclareEventsFunctionParameters(
    const gd::EventsFunctionsContainer &eventsFunctionsContainer,
    const gd::EventsFunction &eventsFunction,
    gd::MultipleInstructionMetadata &multipleInstructionMetadata,
    const int userDefinedFirstParameterIndex) {
  auto functionType = eventsFunction.GetFunctionType();

  bool hasGetterFunction = eventsFunctionsContainer.HasEventsFunctionNamed(
      eventsFunction.GetGetterName());

  // This is used instead of getParametersForEvents because the Value parameter
  // is already add by useStandardOperatorParameters.
  auto &parameters = eventsFunction.GetParameters();

  for (size_t i = 0;
       i < userDefinedFirstParameterIndex && i < parameters.size(); i++) {
    const gd::ParameterMetadata &parameter = parameters.at(i);
    AddParameter(multipleInstructionMetadata, parameter);
  }

  if (functionType == gd::EventsFunction::ExpressionAndCondition) {
    auto options = gd::ParameterOptions::MakeNewOptions();
    auto &extraInfo = eventsFunction.GetExpressionType().GetExtraInfo();
    if (!extraInfo.empty())
      options.SetTypeExtraInfo(extraInfo);
    multipleInstructionMetadata.UseStandardParameters(
        eventsFunction.GetExpressionType().GetName(), options);
  }

  for (size_t i = userDefinedFirstParameterIndex; i < parameters.size(); i++) {
    const gd::ParameterMetadata &parameter = parameters.at(i);
    AddParameter(multipleInstructionMetadata, parameter);
  }

  // By convention, latest parameter is always the eventsFunctionContext of the
  // calling function (if any).
  multipleInstructionMetadata.AddCodeOnlyParameter("eventsFunctionContext", "");
}

gd::String MetadataDeclarationHelper::GetExtensionCodeNamespacePrefix(
    const gd::EventsFunctionsExtension &eventsFunctionsExtension) {
  return "gdjs.evtsExt__" + EventsCodeNameMangler::GetMangledName(
                                eventsFunctionsExtension.GetName());
}

/** Generate the namespace for a free function. */
gd::String MetadataDeclarationHelper::GetFreeFunctionCodeNamespace(
    const gd::EventsFunction &eventsFunction,
    const gd::String &codeNamespacePrefix) {
  return codeNamespacePrefix + "__" +
         EventsCodeNameMangler::GetMangledName(eventsFunction.GetName());
}

gd::String MetadataDeclarationHelper::GetFreeFunctionCodeName(
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction) {
  return GetFreeFunctionCodeNamespace(
             eventsFunction,
             GetExtensionCodeNamespacePrefix(eventsFunctionsExtension)) +
         ".func";
}

/** Generate the namespace for a behavior function. */
gd::String MetadataDeclarationHelper::GetBehaviorFunctionCodeNamespace(
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::String &codeNamespacePrefix) {
  return codeNamespacePrefix + "__" +
         EventsCodeNameMangler::GetMangledName(eventsBasedBehavior.GetName());
}

/** Generate the namespace for an object function. */
gd::String MetadataDeclarationHelper::GetObjectFunctionCodeNamespace(
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::String &codeNamespacePrefix) {
  return codeNamespacePrefix + "__" +
         EventsCodeNameMangler::GetMangledName(eventsBasedObject.GetName());
}

gd::AbstractFunctionMetadata &
MetadataDeclarationHelper::GenerateFreeFunctionMetadata(
    const gd::Project &project, gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction) {
  auto &instructionOrExpression = DeclareInstructionOrExpressionMetadata(
      extension, eventsFunctionsExtension, eventsFunction);

  // Hide "lifecycle" functions as they are called automatically by
  // the game engine.
  if (IsExtensionLifecycleEventsFunction(eventsFunction.GetName()))
    instructionOrExpression.SetHidden();

  if (eventsFunction.IsPrivate())
    instructionOrExpression.SetPrivate();

  return instructionOrExpression;
};

gd::BehaviorMetadata &MetadataDeclarationHelper::GenerateBehaviorMetadata(
    const gd::Project &project, gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    std::map<gd::String, gd::String> &behaviorMethodMangledNames) {
  auto &behaviorMetadata =
      DeclareBehaviorMetadata(project, extension, eventsBasedBehavior);

  auto &eventsFunctionsContainer = eventsBasedBehavior.GetEventsFunctions();

  // Declare the instructions/expressions for properties
  DeclareBehaviorPropertiesInstructionAndExpressions(
      extension, behaviorMetadata, eventsBasedBehavior);

  gdjs::MetadataDeclarationHelper metadataDeclarationHelper;
  // Declare all the behavior functions
  for (size_t i = 0; i < eventsFunctionsContainer.GetEventsFunctionsCount();
       i++) {
    auto &eventsFunction = eventsFunctionsContainer.GetEventsFunction(i);

    auto &instructionOrExpression =
        metadataDeclarationHelper
            .DeclareBehaviorInstructionOrExpressionMetadata(
                extension, behaviorMetadata, eventsBasedBehavior,
                eventsFunction, behaviorMethodMangledNames);

    // Hide "lifecycle" methods as they are called automatically by
    // the game engine.
    if (IsBehaviorLifecycleEventsFunction(eventsFunction.GetName())) {
      instructionOrExpression.SetHidden();
    }

    if (eventsFunction.IsPrivate())
      instructionOrExpression.SetPrivate();
  }

  return behaviorMetadata;
}

gd::ObjectMetadata &MetadataDeclarationHelper::GenerateObjectMetadata(
    gd::Project &project, gd::PlatformExtension &extension,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    std::map<gd::String, gd::String> &objectMethodMangledNames) {
  auto &objectMetadata = DeclareObjectMetadata(extension, eventsBasedObject);

  auto &eventsFunctionsContainer = eventsBasedObject.GetEventsFunctions();

  // Declare the instructions/expressions for properties
  DeclareObjectPropertiesInstructionAndExpressions(extension, objectMetadata,
                                                   eventsBasedObject);
  DeclareObjectInternalInstructions(extension, objectMetadata,
                                    eventsBasedObject);

  gdjs::MetadataDeclarationHelper metadataDeclarationHelper;
  // Declare all the object functions
  for (size_t i = 0; i < eventsFunctionsContainer.GetEventsFunctionsCount();
       i++) {
    auto &eventsFunction = eventsFunctionsContainer.GetEventsFunction(i);

    auto &instructionOrExpression =
        metadataDeclarationHelper.DeclareObjectInstructionOrExpressionMetadata(
            extension, objectMetadata, eventsBasedObject, eventsFunction,
            objectMethodMangledNames);

    // Hide "lifecycle" methods as they are called automatically by
    // the game engine.
    if (IsObjectLifecycleEventsFunction(eventsFunction.GetName())) {
      instructionOrExpression.SetHidden();
    }

    if (eventsFunction.IsPrivate())
      instructionOrExpression.SetPrivate();
  }

  UpdateCustomObjectDefaultBehaviors(project, objectMetadata);

  return objectMetadata;
}

class DefaultBehaviorUpdater : public gd::ArbitraryObjectsWorker {

public:
  DefaultBehaviorUpdater(const gd::Project &project_,
                         const gd::ObjectMetadata &objectMetadata_)
      : project(project_), objectMetadata(objectMetadata_){};
  virtual ~DefaultBehaviorUpdater(){};

private:
  void DoVisitObject(gd::Object &object) override {

    if (object.GetType() != objectMetadata.GetName()) {
      return;
    }

    auto &defaultBehaviorTypes = objectMetadata.GetDefaultBehaviors();
    for (const gd::String &behaviorName : object.GetAllBehaviorNames()) {
      const auto &behavior = object.GetBehavior(behaviorName);
      if (behavior.IsDefaultBehavior()) {
        object.RemoveBehavior(behaviorName);
      }
    }
    auto &platform = project.GetCurrentPlatform();
    for (const gd::String &behaviorType : defaultBehaviorTypes) {
      auto &behaviorMetadata =
          gd::MetadataProvider::GetBehaviorMetadata(platform, behaviorType);
      if (MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
        gd::LogWarning("Object: " + object.GetType() +
                       " has an unknown default behavior: " + behaviorType);
        continue;
      }
      const gd::String &behaviorName = behaviorMetadata.GetDefaultName();
      auto *behavior =
          object.AddNewBehavior(project, behaviorType, behaviorName);
      behavior->SetDefaultBehavior(true);
    }
  }

  const gd::Project &project;
  const gd::ObjectMetadata &objectMetadata;
};

void MetadataDeclarationHelper::UpdateCustomObjectDefaultBehaviors(
    gd::Project &project, const gd::ObjectMetadata &objectMetadata) {
  gd::WholeProjectBrowser projectBrowser;
  auto defaultBehaviorUpdater = DefaultBehaviorUpdater(project, objectMetadata);
  projectBrowser.ExposeObjects(project, defaultBehaviorUpdater);
}

} // namespace gdjs