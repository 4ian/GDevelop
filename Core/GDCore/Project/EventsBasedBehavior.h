/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSBASEDBEHAVIOR_H
#define GDCORE_EVENTSBASEDBEHAVIOR_H

#include <vector>
#include "GDCore/Project/AbstractEventsBasedEntity.h"
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
 * \brief Represents a behavior that is implemented with events.
 *
 * It's the responsibility of the IDE to run the logic to transform this into a
 * real behavior, by declaring an extension and running code generation.
 * See `EventsFunctionsExtensionsLoader`.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsBasedBehavior: public AbstractEventsBasedEntity {
 public:
  EventsBasedBehavior();
  virtual ~EventsBasedBehavior(){};

  /**
   * \brief Return a pointer to a new EventsBasedBehavior constructed from
   * this one.
   */
  EventsBasedBehavior* Clone() const { return new EventsBasedBehavior(*this); };

  EventsBasedBehavior& SetDescription(const gd::String& description_) override {
    AbstractEventsBasedEntity::SetDescription(description_);
    return *this;
  }

  /**
   * \brief Set the internal name of the behavior.
   */
  EventsBasedBehavior& SetName(const gd::String& name_) {
    AbstractEventsBasedEntity::SetName(name_);
    return *this;
  }

  /**
   * \brief Set the name of the behavior, to be displayed in the editor.
   */
  EventsBasedBehavior& SetFullName(const gd::String& fullName_) {
    AbstractEventsBasedEntity::SetFullName(fullName_);
    return *this;
  }

  /**
   * \brief Get the object type the behavior should be used with.
   */
  const gd::String& GetObjectType() const { return objectType; };

  /**
   * \brief Set the object type the behavior should be used with.
   */
  EventsBasedBehavior& SetObjectType(const gd::String& objectType_) {
    objectType = objectType_;
    return *this;
  }

  /**
   * \brief Check if the behavior is private - it can't be used outside of its
   * extension.
   */
  bool IsPrivate() const { return isPrivate; }

  /**
   * \brief Set that the behavior is private - it can't be used outside of its
   * extension.
   */
  EventsBasedBehavior& SetPrivate(bool _isPrivate) {
    isPrivate = _isPrivate;
    return *this;
  }

  /**
   * \brief Return a reference to the list of shared properties.
   */
  gd::PropertiesContainer& GetSharedPropertyDescriptors() {
    return sharedPropertyDescriptors;
  }

  /**
   * \brief Return a const reference to the list of shared properties.
   */
  const gd::PropertiesContainer& GetSharedPropertyDescriptors()
      const {
    return sharedPropertyDescriptors;
  }

  /**
   * \brief Get the name of the action to change a shared property.
   */
  static gd::String GetSharedPropertyActionName(const gd::String &propertyName) {
    return "SetSharedProperty" + propertyName;
  };

  /**
   * \brief Get the name of the condition to compare a shared property.
   */
  static gd::String GetSharedPropertyConditionName(const gd::String &propertyName) {
    return "SharedProperty" + propertyName;
  };

  /**
   * \brief Get the name of the expression to get a shared property.
   */
  static gd::String
  GetSharedPropertyExpressionName(const gd::String &propertyName) {
    return "SharedProperty" + propertyName;
  };

  /**
   * \brief Get the name of the action to toggle a boolean shared property.
   */
  static gd::String GetSharedPropertyToggleActionName(const gd::String &propertyName) {
    return "ToggleSharedProperty" + propertyName;
  };

  void SerializeTo(SerializerElement& element) const override;

  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element) override;

 private:
  gd::String objectType;
  bool isPrivate = false;
  gd::PropertiesContainer sharedPropertyDescriptors;
};

}  // namespace gd

#endif  // GDCORE_EVENTSBASEDBEHAVIOR_H
