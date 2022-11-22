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
class EventsBasedBehavior;
class PropertyDescriptor;
class NamedPropertyDescriptor;
} // namespace gd

namespace gd {

/**
 * \brief Generate a getter and a setter functions for properties.
 */
class GD_CORE_API PropertyFunctionGenerator {
public:
  /**
   * \brief Generate a getter and a setter for the given property.
   */
  static void
  GenerateGetterAndSetter(gd::Project &project,
                          gd::EventsFunctionsExtension &extension,
                          gd::EventsBasedBehavior &eventsBasedBehavior,
                          const gd::NamedPropertyDescriptor &property,
                          bool isSceneProperties);

  ~PropertyFunctionGenerator();

private:
  static gd::String CapitalizeFirstLetter(const gd::String &string);
  static gd::String UnCapitalizeFirstLetter(const gd::String &string);
  static gd::String
  GetStringifiedExtraInfo(const gd::PropertyDescriptor &property);

  PropertyFunctionGenerator();
};

} // namespace gd

#endif // GDCORE_PROPERTYFUNCTIONGENERATOR_H
