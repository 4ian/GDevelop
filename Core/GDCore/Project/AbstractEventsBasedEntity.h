/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_ABSTRACTEVENTSBASEDENTITY_H
#define GDCORE_ABSTRACTEVENTSBASEDENTITY_H

#include <vector>
#include "GDCore/Project/NamedPropertyDescriptor.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {

/**
 * \brief Represents a behavior or an object that is implemented with events.
 *
 * It's the responsibility of the IDE to run the logic to transform this into a
 * real behavior or object, by declaring an extension and running code generation.
 * See `EventsFunctionsExtensionsLoader`.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API AbstractEventsBasedEntity {
 public:
  AbstractEventsBasedEntity(
      const gd::String& _name,
      gd::EventsFunctionsContainer::FunctionOwner functionContainerSource);
  virtual ~AbstractEventsBasedEntity(){};

  /**
   * \brief Return a pointer to a new AbstractEventsBasedEntity constructed from
   * this one.
   */
  AbstractEventsBasedEntity* Clone() const { return new AbstractEventsBasedEntity(*this); };

  /**
   * \brief Get the description of the behavior or object, that is displayed in the
   * editor.
   */
  const gd::String& GetDescription() const { return description; };

  /**
   * \brief Set the description of the behavior or object, to be displayed in the editor.
   */
  virtual AbstractEventsBasedEntity& SetDescription(const gd::String& description_) {
    description = description_;
    return *this;
  }

  /**
   * \brief Get the internal name of the behavior or object.
   */
  const gd::String& GetName() const { return name; };

  /**
   * \brief Set the internal name of the behavior or object.
   */
  AbstractEventsBasedEntity& SetName(const gd::String& name_) {
    name = name_;
    return *this;
  }

  /**
   * \brief Get the name of the behavior or object, that is displayed in the editor.
   */
  const gd::String& GetFullName() const { return fullName; };

  /**
   * \brief Set the name of the behavior or object, to be displayed in the editor.
   */
  AbstractEventsBasedEntity& SetFullName(const gd::String& fullName_) {
    fullName = fullName_;
    return *this;
  }

  /**
   * \brief Return a reference to the functions of the events based behavior or object.
   */
  EventsFunctionsContainer& GetEventsFunctions() {
    return eventsFunctionsContainer;
  }

  /**
   * \brief Return a const reference to the functions of the events based
   * behavior or object.
   */
  const EventsFunctionsContainer& GetEventsFunctions() const {
    return eventsFunctionsContainer;
  }

  /**
   * \brief Return a reference to the list of the properties.
   */
  gd::PropertiesContainer& GetPropertyDescriptors() {
    return propertyDescriptors;
  }

  /**
   * \brief Return a const reference to the list of the properties.
   */
  const gd::PropertiesContainer& GetPropertyDescriptors() const {
    return propertyDescriptors;
  }

  /**
   * \brief Get the name of the action to change a property.
   */
  static gd::String GetPropertyActionName(const gd::String& propertyName) { return "SetProperty" + propertyName; };

  /**
   * \brief Get the name of the condition to compare a property.
   */
  static gd::String GetPropertyConditionName(const gd::String& propertyName) { return "Property" + propertyName; };

  /**
   * \brief Get the name of the expression to get a property.
   */
  static gd::String GetPropertyExpressionName(const gd::String& propertyName) { return "Property" + propertyName; };

  /**
   * \brief Get the name of the action to toggle a boolean property.
   */
  static gd::String GetPropertyToggleActionName(const gd::String& propertyName) { return "ToggleProperty" + propertyName; };

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the AbstractEventsBasedEntity to the specified element
   */
  virtual void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the AbstractEventsBasedEntity from the specified element
   */
  virtual void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}

 private:
  gd::String name;
  gd::String fullName;
  gd::String description;
  gd::EventsFunctionsContainer eventsFunctionsContainer;
  gd::PropertiesContainer propertyDescriptors;
  gd::String extensionName;
};

}  // namespace gd

#endif  // GDCORE_ABSTRACTEVENTSBASEDENTITY_H
