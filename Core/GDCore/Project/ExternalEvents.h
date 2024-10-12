/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXTERNALEVENTS_H
#define GDCORE_EXTERNALEVENTS_H
#include <ctime>
#include <memory>
#include <vector>

#include "GDCore/Events/EventsList.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
}
namespace gd {
class Project;
}
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Contains a list of events not directly linked to a layout.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ExternalEvents {
 public:
  ExternalEvents();
  ExternalEvents(const ExternalEvents&);
  virtual ~ExternalEvents(){};
  ExternalEvents& operator=(const ExternalEvents& rhs);

  /**
   * \brief Return a pointer to a new ExternalEvents constructed from this one.
   */
  ExternalEvents* Clone() const { return new ExternalEvents(*this); };

  /**
   * \brief Get external events name
   */
  virtual const gd::String& GetName() const { return name; };

  /**
   * \brief Change external events name
   */
  virtual void SetName(const gd::String& name_) { name = name_; };

  /**
   * \brief Get the layout associated with external events.
   *
   * This is used in the IDE to remember the layout used to edit the external
   * events.
   */
  virtual const gd::String& GetAssociatedLayout() const {
    return associatedScene;
  };

  /**
   * \brief Set the layout associated with external events.
   */
  virtual void SetAssociatedLayout(const gd::String& name_) {
    associatedScene = name_;
  };

  /**
   * \brief Get the events.
   */
  virtual const gd::EventsList& GetEvents() const { return events; }

  /**
   * \brief Get the events.
   */
  virtual gd::EventsList& GetEvents() { return events; }

  /**
   * \brief Serialize external events.
   */
  virtual void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the external events.
   */
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element);

 private:
  gd::String name;
  gd::String associatedScene;
  gd::EventsList events;       ///< List of events

  /**
   * Initialize from another ExternalEvents. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const ExternalEvents& externalEvents);
};

}  // namespace gd

#endif  // GDCORE_EXTERNALEVENTS_H
