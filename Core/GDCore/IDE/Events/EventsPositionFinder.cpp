#include "GDCore/IDE/Events/EventsPositionFinder.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/String.h"

namespace gd {
class BaseEvent;
class EventsList;
}  // namespace gd

namespace gd {
bool EventsPositionFinder::DoVisitEvent(gd::BaseEvent& event) {
  auto it = std::find(searchedEvents.begin(), searchedEvents.end(), &event);
  if (it != searchedEvents.end()) {
    positions[it - searchedEvents.begin()] = index;
  }
  index++;
  return false;
}
EventsPositionFinder::~EventsPositionFinder() {}

}  // namespace gd
