#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"

class GD_CORE_API EventsListUnfolder {
 public:
  /**
   * \brief Recursively unfold all the event lists containing the specified
   * event. \note This is a quick and naive implementation, complexity is pretty
   * high.
   */
  static void UnfoldWhenContaining(gd::EventsList& list,
                                   const gd::BaseEvent& eventToContain) {
    for (size_t i = 0; i < list.size(); ++i) {
      gd::BaseEvent& event = list[i];
      if (event.CanHaveSubEvents() &&
          event.GetSubEvents().Contains(eventToContain)) {
        event.SetFolded(false);
        UnfoldWhenContaining(event.GetSubEvents(), eventToContain);
      }
    }
  }

  static void FoldAll(gd::EventsList& list) {
    for (size_t i = 0; i < list.size(); ++i) {
      gd::BaseEvent& event = list[i];
      event.SetFolded(true);
      if (event.CanHaveSubEvents() && event.GetSubEvents().size() > 0) {
        FoldAll(event.GetSubEvents());
      }
    }
  }

  /**
   * \brief Recursively unfold all the events until a certain level of depth.
   * 0 is the top level. If you want to unfold all events regardless of its depth,
   * use `maxLevel = -1`. `currentLevel` is used for the recursion.
   */
  static void UnfoldToLevel(gd::EventsList& list,
                            const int8_t maxLevel,
                            const std::size_t currentLevel = 0) {
    if (maxLevel >= 0 && currentLevel > maxLevel) return;

    for (size_t i = 0; i < list.size(); ++i) {
      gd::BaseEvent& event = list[i];
      event.SetFolded(false);
      if (event.CanHaveSubEvents() && event.GetSubEvents().size() > 0 &&
          (maxLevel == -1 || currentLevel <= maxLevel)) {
        UnfoldToLevel(event.GetSubEvents(), maxLevel, currentLevel + 1);
      }
    }
  }
};
