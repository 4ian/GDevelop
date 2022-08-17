/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSBASEDOBJECT_H
#define GDCORE_EVENTSBASEDOBJECT_H

#include <vector>
#include "GDCore/Project/AbstractEventsBasedEntity.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {

/**
 * \brief Represents an object that is implemented with events.
 *
 * It's the responsibility of the IDE to run the logic to transform this into a
 * real object, by declaring an extension and running code generation.
 * See `EventsFunctionsExtensionsLoader`.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsBasedObject: public AbstractEventsBasedEntity, public ObjectsContainer {
 public:
  EventsBasedObject();
  virtual ~EventsBasedObject();
  EventsBasedObject(const gd::EventsBasedObject &_eventBasedObject);

  /**
   * \brief Return a pointer to a new EventsBasedObject constructed from
   * this one.
   */
  EventsBasedObject* Clone() const { return new EventsBasedObject(*this); };

  EventsBasedObject& SetDescription(const gd::String& description_) override {
    AbstractEventsBasedEntity::SetDescription(description_);
    return *this;
  }

  /**
   * \brief Set the internal name of the object.
   */
  EventsBasedObject& SetName(const gd::String& name_) {
    AbstractEventsBasedEntity::SetName(name_);
    return *this;
  }

  /**
   * \brief Set the name of the object, to be displayed in the editor.
   */
  EventsBasedObject& SetFullName(const gd::String& fullName_) {
    AbstractEventsBasedEntity::SetFullName(fullName_);
    return *this;
  }

  void SerializeTo(SerializerElement& element) const override;

  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element) override;

 private:
};

}  // namespace gd

#endif  // GDCORE_EVENTSBASEDOBJECT_H
