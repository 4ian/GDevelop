#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"

class GD_CORE_API EventsListUnfolder
{
public:
    /**
     * \brief Recursively unfold all the event lists containing the specified event.
     * \note This is a quick and naive implementation, complexity is pretty high.
     */
    static void UnfoldWhenContaining(gd::EventsList & list, const gd::BaseEvent & eventToContain) {
        for(size_t i = 0;i < list.size();++i)
        {
            gd::BaseEvent & event = list[i];
            if (event.CanHaveSubEvents() && event.GetSubEvents().Contains(eventToContain))
            {
                event.SetFolded(false);
                UnfoldWhenContaining(event.GetSubEvents(), eventToContain);
            }
        }
    }
};
