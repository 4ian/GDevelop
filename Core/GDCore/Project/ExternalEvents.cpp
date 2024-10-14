#include "GDCore/Project/ExternalEvents.h"

#include "ExternalEvents.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

ExternalEvents::ExternalEvents() {
  // ctor
}

ExternalEvents::ExternalEvents(const ExternalEvents& externalEvents) {
  Init(externalEvents);
}

ExternalEvents& ExternalEvents::operator=(const ExternalEvents& rhs) {
  if (this != &rhs) Init(rhs);

  return *this;
}

void ExternalEvents::Init(const ExternalEvents& externalEvents) {
  name = externalEvents.GetName();
  associatedScene = externalEvents.GetAssociatedLayout();
  events = externalEvents.events;
}

void ExternalEvents::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("associatedLayout", associatedScene);
  gd::EventsListSerialization::SerializeEventsTo(events,
                                                 element.AddChild("events"));
}

void ExternalEvents::UnserializeFrom(gd::Project& project,
                                     const SerializerElement& element) {
  name = element.GetStringAttribute("name", "", "Name");
  associatedScene =
      element.GetStringAttribute("associatedLayout", "", "AssociatedScene");
  gd::EventsListSerialization::UnserializeEventsFrom(
      project, events, element.GetChild("events", 0, "Events"));
}

}  // namespace gd
