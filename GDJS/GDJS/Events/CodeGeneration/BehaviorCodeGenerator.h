/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDJS_BEHAVIORCODEGENERATOR_H
#define GDJS_BEHAVIORCODEGENERATOR_H
#include <map>
#include <set>
#include <string>
#include <vector>

#include "GDCore/Project/EventsBasedBehavior.h"
namespace gd {
class NamedPropertyDescriptor;
}

namespace gdjs {

/**
 * \brief The class being responsible for generating JavaScript code for
 * EventsBasedBhavior.
 *
 * See also gd::EventsCodeGenerator.
 */
class BehaviorCodeGenerator {
 public:
  BehaviorCodeGenerator(gd::Project& project_) : project(project_){};

  /**
   * \brief Generate the complete JS class (`gdjs.RuntimeBehavior`) for the
   * behavior.
   */
  gd::String GenerateRuntimeBehaviorCompleteCode(
      const gd::String& extensionName,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& codeNamespace,
      const std::map<gd::String, gd::String>& behaviorMethodMangledNames,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime = false);

  /**
   * \brief Generate the name of the method to get the value of the property
   * of a behavior.
   */
  static gd::String GetBehaviorPropertyGetterName(
      const gd::String& propertyName) {
    return "_get" + propertyName;
  }

  /**
   * \brief Generate the name of the method to set the value of the property
   * of a behavior.
   */
  static gd::String GetBehaviorPropertySetterName(
      const gd::String& propertyName) {
    return "_set" + propertyName;
  }

 private:
  gd::String GenerateRuntimeBehaviorTemplateCode(
      const gd::String& extensionName,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& codeNamespace,
      std::function<gd::String()> generateInitializePropertiesCode,
      std::function<gd::String()> generateMethodsCode,
      std::function<gd::String()> generatePropertiesCode,
      std::function<gd::String()> generateUpdateFromBehaviorDataCode);
  gd::String GenerateRuntimeBehaviorPropertyTemplateCode(
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::NamedPropertyDescriptor& property);
  gd::String GenerateInitializePropertyFromDataCode(
      const gd::NamedPropertyDescriptor& property);
  gd::String GenerateInitializePropertyFromDefaultValueCode(
      const gd::NamedPropertyDescriptor& property);
  gd::String GeneratePropertyValueCode(const gd::PropertyDescriptor& property);
  gd::String GenerateUpdatePropertyFromBehaviorDataCode(
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::NamedPropertyDescriptor& property);
  gd::String GenerateBehaviorOnDestroyToDeprecatedOnOwnerRemovedFromScene(
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& codeNamespace);
  gd::String GenerateDefaultDoStepPreEventsFunctionCode(
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& codeNamespace);
  gd::String GenerateDoStepPreEventsPreludeCode();

  gd::Project& project;

  static gd::String doStepPreEventsFunctionName;
};

}  // namespace gdjs
#endif  // GDJS_BEHAVIORCODEGENERATOR_H
