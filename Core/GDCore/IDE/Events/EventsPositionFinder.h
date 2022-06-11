#ifndef EventsPositionFinder_H
#define EventsPositionFinder_H
#include "GDCore/Events/EventsList.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"

namespace gd {
class BaseEvent;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Scans an event list to retrieve the position of a list of searched
 * events when the events list is flattened.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsPositionFinder : public ArbitraryEventsWorker {
 public:
  EventsPositionFinder() : index(0){};
  virtual ~EventsPositionFinder();

  /**
   * Return the positions of all searched events
   */
  const std::vector<std::size_t>& GetPositions() const { return positions; }

  /**
   * Add an event for which the position must be reported in `GetPositions`.
   */
  void AddEventToSearch(gd::BaseEvent* event) {
    searchedEvents.push_back(event);
    positions.push_back(gd::String::npos);
  }

 private:
  bool DoVisitEvent(gd::BaseEvent& event) override;

  std::vector<gd::BaseEvent*> searchedEvents;
  std::vector<std::size_t> positions;
  std::size_t index;
};

}  // namespace gd

#endif  // EventsPositionFinder_H