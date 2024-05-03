/*
 * GDevelop Core
 * Copyright 2008-2022 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_PROPERTYFUNCTIONGENERATOR_H
#define GDCORE_PROPERTYFUNCTIONGENERATOR_H

namespace gd {
class String;
class Project;
class EventsFunctionsExtension;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
class AbstractEventsBasedEntity;
class PropertyDescriptor;
class NamedPropertyDescriptor;
}  // namespace gd

namespace gd {

/**
 * \brief Generate a getter and a setter functions for properties.
 */
class GD_CORE_API PropertyFunctionGenerator {
 public:
  /**
   * \brief Generate a getter and a setter for the given behavior property.
   */
  static void GenerateBehaviorGetterAndSetter(
      gd::Project &project,
      gd::EventsFunctionsExtension &extension,
      gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::NamedPropertyDescriptor &property,
      bool isSharedProperties);
  /**
   * \brief Generate a getter and a setter for the given object property.
   */
  static void GenerateObjectGetterAndSetter(
      gd::Project &project,
      gd::EventsFunctionsExtension &extension,
      gd::EventsBasedObject &eventsBasedObject,
      const gd::NamedPropertyDescriptor &property);
  static bool CanGenerateGetterAndSetter(
      const gd::AbstractEventsBasedEntity &eventsBasedEntity,
      const gd::NamedPropertyDescriptor &property);

  /**
   * \brief Generate an event with a "return" action.
   */
  static void GenerateConditionSkeleton(gd::Project &project,
                                        gd::EventsFunction &eventFunction);

  ~PropertyFunctionGenerator(){};

 private:
  static void GenerateGetterAndSetter(
      gd::Project &project,
      gd::EventsFunctionsExtension &extension,
      gd::AbstractEventsBasedEntity &eventsBasedEntity,
      const gd::NamedPropertyDescriptor &property,
      const gd::String &objectType,
      bool isBehavior,
      bool isSharedProperties);

  static gd::String CapitalizeFirstLetter(const gd::String &string);
  static gd::String UnCapitalizeFirstLetter(const gd::String &string);
  static gd::String GetStringifiedExtraInfo(
      const gd::PropertyDescriptor &property);

  PropertyFunctionGenerator();
};

}  // namespace gd

#endif  // GDCORE_PROPERTYFUNCTIONGENERATOR_H
