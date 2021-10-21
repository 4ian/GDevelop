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
   * Get the latest time of the build.
   * Used when the IDE found that the external events can be compiled separately
   * from scene's events.
   *
   * \todo This is specific to GD C++ Platform
   */
  time_t GetLastChangeTimeStamp() const { return lastChangeTimeStamp; };

  /**
   * Change the latest time of the build of the external events.
   *
   * \todo This is specific to GD C++ Platform
   */
  void SetLastChangeTimeStamp(time_t newTimeStamp) {
    lastChangeTimeStamp = newTimeStamp;
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
  time_t lastChangeTimeStamp;  ///< Time of the last build
  gd::EventsList events;       ///< List of events

  /**
   * Initialize from another ExternalEvents. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const ExternalEvents& externalEvents);
};

/**
 * \brief Functor testing ExternalEvents' name
 */
struct ExternalEventsHasName
    : public std::binary_function<std::unique_ptr<gd::ExternalEvents>,
                                  gd::String,
                                  bool> {
  bool operator()(const std::unique_ptr<gd::ExternalEvents>& externalEvents,
                  gd::String name) const {
    return externalEvents->GetName() == name;
  }
};

}  // namespace gd

#endif  // GDCORE_EXTERNALEVENTS_H
