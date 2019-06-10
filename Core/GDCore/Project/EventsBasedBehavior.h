/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENTSBASEDBEHAVIOR_H
#define GDCORE_EVENTSBASEDBEHAVIOR_H

#include <vector>
#include "GDCore/Project/NamedPropertyDescriptor.h"
#include "GDCore/Tools/SerializableWithNameList.h"
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
class GD_CORE_API EventsBasedBehavior {
 public:
  EventsBasedBehavior();
  virtual ~EventsBasedBehavior(){};

  /**
   * \brief Return a pointer to a new EventsBasedBehavior constructed from
   * this one.
   */
  EventsBasedBehavior* Clone() const { return new EventsBasedBehavior(*this); };

  /**
   * \brief Get the description of the behavior, that is displayed in the
   * editor.
   */
  const gd::String& GetDescription() const { return description; };

  /**
   * \brief Set the description of the behavior, to be displayed in the editor.
   */
  EventsBasedBehavior& SetDescription(const gd::String& description_) {
    description = description_;
    return *this;
  }

  /**
   * \brief Get the internal name of the behavior.
   */
  const gd::String& GetName() const { return name; };

  /**
   * \brief Set the internal name of the behavior.
   */
  EventsBasedBehavior& SetName(const gd::String& name_) {
    name = name_;
    return *this;
  }

  /**
   * \brief Get the name of the behavior, that is displayed in the editor.
   */
  const gd::String& GetFullName() const { return fullName; };

  /**
   * \brief Set the name of the behavior, to be displayed in the editor.
   */
  EventsBasedBehavior& SetFullName(const gd::String& fullName_) {
    fullName = fullName_;
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
   * \brief Return a reference to the functions of the events based behavior.
   */
  EventsFunctionsContainer& GetEventsFunctions() {
    return eventsFunctionsContainer;
  }

  /**
   * \brief Return a const reference to the functions of the events based
   * behavior.
   */
  const EventsFunctionsContainer& GetEventsFunctions() const {
    return eventsFunctionsContainer;
  }

  /**
   * \brief Return a reference to the list of the properties.
   */
  SerializableWithNameList<NamedPropertyDescriptor>& GetPropertyDescriptors() {
    return propertyDescriptors;
  }

  /**
   * \brief Return a const reference to the list of the properties.
   */
  const SerializableWithNameList<NamedPropertyDescriptor>& GetPropertyDescriptors()
      const {
    return propertyDescriptors;
  }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the EventsBasedBehavior to the specified element
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the EventsBasedBehavior from the specified element
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}

 private:
  gd::String name;
  gd::String fullName;
  gd::String description;
  gd::String objectType;
  gd::EventsFunctionsContainer eventsFunctionsContainer;
  SerializableWithNameList<NamedPropertyDescriptor> propertyDescriptors;
};

}  // namespace gd

#endif  // GDCORE_EVENTSBASEDBEHAVIOR_H
#endif
