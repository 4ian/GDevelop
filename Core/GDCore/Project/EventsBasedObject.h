/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EventsBasedObject_H
#define GDCORE_EventsBasedObject_H

#include <vector>
#include "GDCore/Project/AbstractEventsBasedEntity.h"
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
class GD_CORE_API EventsBasedObject: public AbstractEventsBasedEntity {
 public:
  EventsBasedObject();
  ~EventsBasedObject(){};
  EventsBasedObject(const gd::EventsBasedObject &_layout);

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
   * \brief Set the internal name of the behavior.
   */
  EventsBasedObject& SetName(const gd::String& name_) {
    AbstractEventsBasedEntity::SetDescription(name_);
    return *this;
  }

  /**
   * \brief Set the name of the behavior, to be displayed in the editor.
   */
  EventsBasedObject& SetFullName(const gd::String& fullName_) {
    AbstractEventsBasedEntity::SetDescription(fullName_);
    return *this;
  }

  /**
   * \brief Return a reference to the layout.
   */
  Layout& GetLayout() {
    return *layout;
  }

  /**
   * \brief Return a reference to the layout.
   */
  const Layout& GetLayout() const {
    return *layout;
  }

  void SerializeTo(SerializerElement& element) const override;

  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element) override;

 private:
 std::unique_ptr<gd::Layout> layout;
};

}  // namespace gd

#endif  // GDCORE_EventsBasedObject_H
#endif
