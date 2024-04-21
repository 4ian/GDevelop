/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"
#include <functional>
#include <map>
#include <memory>
#include <vector>


namespace gd {
class PlatformExtension;
class Project;
class EventsFunctionsExtension;
class EventsBasedBehavior;
class BehaviorMetadata;
class EventsBasedObject;
class ObjectMetadata;
class EventsFunction;
class PropertyDescriptor;
class EventsFunctionsContainer;
class AbstractFunctionMetadata;
class InstructionOrExpressionContainerMetadata;
class AbstractEventsBasedEntity;
class NamedPropertyDescriptor;
class ParameterMetadata;
class InstructionMetadata;
class ExpressionMetadata;
class MultipleInstructionMetadata;
} // namespace gd

namespace gdjs {

/**
 * \brief This file contains the logic to declare extension metadata from
 * events functions or events based behaviors.
 * These are basically adapters from gd::EventsFunctionsExtension, and children,
 * to a real extension declaration (like in `JsExtension.js` or `Extension.cpp`
 * files).
 *
 * \ingroup IDE
 */
class MetadataDeclarationHelper {
public:
  MetadataDeclarationHelper(){};
  virtual ~MetadataDeclarationHelper(){};

  gd::AbstractFunctionMetadata &GenerateFreeFunctionMetadata(
      const gd::Project &project, gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction);

  static gd::BehaviorMetadata &GenerateBehaviorMetadata(
      const gd::Project &project, gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      std::map<gd::String, gd::String> &behaviorMethodMangledNames);

  static gd::ObjectMetadata &GenerateObjectMetadata(
      gd::Project &project, gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsBasedObject &eventsBasedObject,
      std::map<gd::String, gd::String> &objectMethodMangledNames);

  /** Generate the namespace prefix for an extension. */
  static gd::String GetExtensionCodeNamespacePrefix(
      const gd::EventsFunctionsExtension &eventsFunctionsExtension);

  /** Generate the fully qualified name for a free function. */
  static gd::String GetFreeFunctionCodeName(
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction);

  /** Generate the namespace for a free function. */
  static gd::String
  GetFreeFunctionCodeNamespace(const gd::EventsFunction &eventsFunction,
                               const gd::String &codeNamespacePrefix);

  /** Generate the namespace for a behavior function. */
  static gd::String GetBehaviorFunctionCodeNamespace(
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::String &codeNamespacePrefix);

  /** Generate the namespace for an object function. */
  static gd::String
  GetObjectFunctionCodeNamespace(const gd::EventsBasedObject &eventsBasedObject,
                                 const gd::String &codeNamespacePrefix);

  /**
   * Declare an extension from an events based extension.
   */
  static void DeclareExtension(
      gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension);

  /**
   * Check if the name of the function is the name of a lifecycle function (for
   * events-based behaviors), that will be called automatically by the game
   * engine.
   */
  static bool IsBehaviorLifecycleEventsFunction(const gd::String &functionName);

  /**
   * Check if the name of the function is the name of a lifecycle function (for
   * events-based objects), that will be called automatically by the game
   * engine.
   */
  static bool IsObjectLifecycleEventsFunction(const gd::String &functionName);

  /**
   * Check if the name of the function is the name of a lifecycle function (for
   * events-based extensions), that will be called automatically by the game
   * engine.
   */
  static bool
  IsExtensionLifecycleEventsFunction(const gd::String &functionName);

  static gd::String ShiftSentenceParamIndexes(const gd::String &sentence,
                                              const int offset);

private:
  static const gd::String &
  GetExtensionIconUrl(gd::PlatformExtension &extension);

  /**
   * Declare the dependencies of an extension from an events based extension.
   */
  static void DeclareExtensionDependencies(
      gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension);

  static void DeclarePropertyInstructionAndExpression(
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
          addObjectAndBehaviorParameters);

  /**
   * Declare the instructions (actions/conditions) and expressions for the
   * properties of the given events based behavior.
   * This is akin to what would happen by manually declaring a JS extension
   * (see `JsExtension.js` files of extensions).
   */
  static void DeclareBehaviorPropertiesInstructionAndExpressions(
      gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
      const gd::EventsBasedBehavior &eventsBasedBehavior);

  /**
   * Declare the instructions (actions/conditions) and expressions for the
   * properties of the given events based object.
   * This is akin to what would happen by manually declaring a JS extension
   * (see `JsExtension.js` files of extensions).
   */
  static void DeclareObjectPropertiesInstructionAndExpressions(
      gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
      const gd::EventsBasedObject &eventsBasedObject);

  /**
   * Declare the instructions (actions/conditions) and expressions for the
   * properties of the given events based object.
   * This is akin to what would happen by manually declaring a JS extension
   * (see `JsExtension.js` files of extensions).
   */
  static void DeclareObjectInternalInstructions(
      gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
      const gd::EventsBasedObject &eventsBasedObject);

  static const gd::String defaultExtensionIconPath;

  /**
   * Declare the behavior for the given
   * events based behavior.
   */
  static gd::BehaviorMetadata &
  DeclareBehaviorMetadata(const gd::Project &project,
                          gd::PlatformExtension &extension,
                          const gd::EventsBasedBehavior &eventsBasedBehavior);

  /**
   * Declare the object for the given
   * events based object.
   */
  static gd::ObjectMetadata &
  DeclareObjectMetadata(gd::PlatformExtension &extension,
                        const gd::EventsBasedObject &eventsBasedObject);

  static void
  AddParameter(gd::AbstractFunctionMetadata &instructionOrExpression,
               const gd::ParameterMetadata &parameter);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * (free) events function.
   */
  gd::AbstractFunctionMetadata &DeclareInstructionOrExpressionMetadata(
      gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * (free) events function.
   */
  gd::AbstractFunctionMetadata &DeclareExpressionMetadata(
      gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * (free) events function.
   */
  static gd::InstructionMetadata &DeclareInstructionMetadata(
      gd::PlatformExtension &extension,
      const gd::EventsFunctionsExtension &eventsFunctionsExtension,
      const gd::EventsFunction &eventsFunction);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * behavior events function.
   */
  gd::AbstractFunctionMetadata &DeclareBehaviorInstructionOrExpressionMetadata(
      gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction,
      std::map<gd::String, gd::String> &objectMethodMangledNames);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * behavior events function.
   */
  gd::AbstractFunctionMetadata &DeclareBehaviorExpressionMetadata(
      gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * behavior events function.
   */
  static gd::InstructionMetadata &DeclareBehaviorInstructionMetadata(
      gd::PlatformExtension &extension, gd::BehaviorMetadata &behaviorMetadata,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * object events function.
   */
  gd::AbstractFunctionMetadata &DeclareObjectInstructionOrExpressionMetadata(
      gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction,
      std::map<gd::String, gd::String> &objectMethodMangledNames);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * object events function.
   */
  gd::AbstractFunctionMetadata &DeclareObjectExpressionMetadata(
      gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction);

  /**
   * Declare the instruction (action/condition) or expression for the given
   * object events function.
   */
  static gd::InstructionMetadata &DeclareObjectInstructionMetadata(
      gd::PlatformExtension &extension, gd::ObjectMetadata &objectMetadata,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction);

  /**
   * Add to the instruction (action/condition) or expression the parameters
   * expected by the events function.
   */
  static void DeclareEventsFunctionParameters(
      const gd::EventsFunctionsContainer &eventsFunctionsContainer,
      const gd::EventsFunction &eventsFunction,
      gd::ExpressionMetadata &expression,
      const int userDefinedFirstParameterIndex);

  /**
   * Add to the instruction (action/condition) or expression the parameters
   * expected by the events function.
   */
  static void DeclareEventsFunctionParameters(
      const gd::EventsFunctionsContainer &eventsFunctionsContainer,
      const gd::EventsFunction &eventsFunction,
      gd::InstructionMetadata &instruction,
      const int userDefinedFirstParameterIndex);

  /**
   * Add to the instruction (action/condition) or expression the parameters
   * expected by the events function.
   */
  static void DeclareEventsFunctionParameters(
      const gd::EventsFunctionsContainer &eventsFunctionsContainer,
      const gd::EventsFunction &eventsFunction,
      gd::MultipleInstructionMetadata &multipleInstructionMetadata,
      const int userDefinedFirstParameterIndex);

  static void
  UpdateCustomObjectDefaultBehaviors(gd::Project &project,
                                     const gd::ObjectMetadata &objectMetadata);

  static gd::String RemoveTrailingDot(const gd::String &description);

  static gd::String
  GetStringifiedExtraInfo(const gd::PropertyDescriptor &property);

  static gd::String UncapitalizeFirstLetter(const gd::String &string);

  std::vector<gd::MultipleInstructionMetadata> expressionAndConditions;
};

} // namespace gdjs
