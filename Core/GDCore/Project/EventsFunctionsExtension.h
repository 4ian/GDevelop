/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENTSFUNCTIONEXTENSION_H
#define GDCORE_EVENTSFUNCTIONEXTENSION_H

#include <vector>
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {

/**
 * \brief Hold a list of Events Functions (gd::EventsFunction) and Events Based
 * Behaviors.
 *
 * Events functions can be generated as stand-alone functions, and
 * converted to actions/conditions/expressions.
 * Events behaviors can be generated to a runtime behavior, with functions
 * converted to behavior actions/conditions/expressions. Similarly, a
 * gd::EventsFunctionsExtension can be converted to an extension.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsFunctionsExtension : public EventsFunctionsContainer {
 public:
  EventsFunctionsExtension();
  EventsFunctionsExtension(const EventsFunctionsExtension&);
  EventsFunctionsExtension& operator=(const EventsFunctionsExtension& rhs);
  virtual ~EventsFunctionsExtension(){};

  /**
   * \brief Return a pointer to a new EventsFunctionsExtension constructed from
   * this one.
   */
  EventsFunctionsExtension* Clone() const {
    return new EventsFunctionsExtension(*this);
  };

  const gd::String& GetVersion() const { return version; };
  EventsFunctionsExtension& SetVersion(const gd::String& version_) {
    version = version_;
    return *this;
  }

  const gd::String& GetNamespace() const { return extensionNamespace; };
  EventsFunctionsExtension& SetNamespace(const gd::String& namespace_) {
    extensionNamespace = namespace_;
    return *this;
  }

  const gd::String& GetDescription() const { return description; };
  EventsFunctionsExtension& SetDescription(const gd::String& description_) {
    description = description_;
    return *this;
  }

  const gd::String& GetName() const { return name; };
  EventsFunctionsExtension& SetName(const gd::String& name_) {
    name = name_;
    return *this;
  }

  const gd::String& GetFullName() const { return fullName; };
  EventsFunctionsExtension& SetFullName(const gd::String& fullName_) {
    fullName = fullName_;
    return *this;
  }

  /**
   * \brief Return a reference to the list of the events based behaviors.
   */
  SerializableWithNameList<EventsBasedBehavior>& GetEventsBasedBehaviors() {
    return eventsBasedBehaviors;
  }

  /**
   * \brief Return a const reference to the list of the events based behaviors.
   */
  const SerializableWithNameList<EventsBasedBehavior>& GetEventsBasedBehaviors()
      const {
    return eventsBasedBehaviors;
  }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the EventsFunctionsExtension to the specified element
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the EventsFunctionsExtension from the specified element
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}

 private:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::EventsFunctionsExtension& other);

  gd::String version;
  gd::String extensionNamespace;
  gd::String description;
  gd::String name;
  gd::String fullName;
  SerializableWithNameList<EventsBasedBehavior> eventsBasedBehaviors;
};

}  // namespace gd

#endif  // GDCORE_EVENTSFUNCTIONEXTENSION_H
#endif
