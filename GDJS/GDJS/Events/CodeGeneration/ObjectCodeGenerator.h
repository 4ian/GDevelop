/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDJS_OBJECTCODEGENERATOR_H
#define GDJS_OBJECTCODEGENERATOR_H
#include <map>
#include <set>
#include <string>
#include <vector>

#include "GDCore/Project/EventsBasedObject.h"
namespace gd {
class NamedPropertyDescriptor;
}

namespace gdjs {

/**
 * \brief The class being responsible for generating JavaScript code for
 * EventsBasedObject.
 *
 * See also gd::EventsCodeGenerator.
 */
class ObjectCodeGenerator {
 public:
  ObjectCodeGenerator(gd::Project& project_) : project(project_){};

  /**
   * \brief Generate the complete JS class (`gdjs.CustomRuntimeObject`) for the
   * object.
   */
  gd::String GenerateRuntimeObjectCompleteCode(
      const gd::String& extensionName,
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& codeNamespace,
      const std::map<gd::String, gd::String>& objectMethodMangledNames,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime = false);

  /**
   * \brief Generate the name of the method to get the value of the property
   * of a object.
   */
  static gd::String GetObjectPropertyGetterName(
      const gd::String& propertyName) {
    return "_get" + propertyName;
  }

  /**
   * \brief Generate the name of the method to set the value of the property
   * of a object.
   */
  static gd::String GetObjectPropertySetterName(
      const gd::String& propertyName) {
    return "_set" + propertyName;
  }

  /**
   * \brief Generate the name of the method to toggle the value of the boolean
   * property of a behavior.
   */
  static gd::String GetObjectPropertyToggleFunctionName(
      const gd::String &propertyName) {
    return "_toggle" + propertyName;
  }

 private:
  gd::String GenerateRuntimeObjectTemplateCode(
      const gd::String& extensionName,
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& codeNamespace,
      std::function<gd::String()> generateInitializePropertiesCode,
      std::function<gd::String()> generateMethodsCode,
      std::function<gd::String()> generatePropertiesCode,
      std::function<gd::String()> generateUpdateFromObjectDataCode,
      std::function<gd::String()> generateInitializeAnimatableCode,
      std::function<gd::String()> generateAnimatableCode,
      std::function<gd::String()> generateTextContainerCode);

  gd::String GenerateRuntimeObjectPropertyTemplateCode(
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::NamedPropertyDescriptor& property);

  gd::String GenerateToggleBooleanPropertyTemplateCode(
    const gd::String &toggleName, const gd::String &getterName,
    const gd::String &setterName);

  gd::String GenerateInitializePropertyFromDataCode(
      const gd::NamedPropertyDescriptor& property);

  gd::String GenerateInitializePropertyFromDefaultValueCode(
      const gd::NamedPropertyDescriptor& property);

  gd::String GeneratePropertyValueCode(const gd::PropertyDescriptor& property);

  gd::String GenerateUpdatePropertyFromObjectDataCode(
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::NamedPropertyDescriptor& property);

  gd::String GenerateObjectOnDestroyToDeprecatedOnOwnerRemovedFromScene(
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& codeNamespace);

  gd::String GenerateDefaultDoStepPreEventsFunctionCode(
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& codeNamespace);

  gd::String GenerateDoStepPreEventsPreludeCode(
      const gd::EventsBasedObject& eventsBasedObject);

  gd::Project& project;

  static gd::String onCreatedFunctionName;
  static gd::String doStepPreEventsFunctionName;
};

}  // namespace gdjs
#endif  // GDJS_OBJECTCODEGENERATOR_H
