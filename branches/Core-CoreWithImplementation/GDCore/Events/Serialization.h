/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_EVENTS_SERIALIZATION_H
#define GDCORE_EVENTS_SERIALIZATION_H
#include "GDCore/Events/Event.h"
#include <boost/shared_ptr.hpp>
#include <vector>
class TiXmlElement;

namespace gd
{

/**
 * \brief Contains tools for loading and saving events to XML.
 */
class GD_CORE_API EventsListSerialization
{
public:
    /**
     * \brief Load an event list from a TiXmlElement
     * \param project The project the events belongs to.
     * \param list The event list in which the events must be loaded.
     * \param events The TiXmlElement containing the events
     */
    static void LoadEventsFromXml(gd::Project & project, std::vector < boost::shared_ptr<gd::BaseEvent> > & list, const TiXmlElement * events);

    /**
     * \brief Save an event list from a TiXmlElement
     * \param list The event list to be saved.
     * \param events The TiXmlElement in which the events must be saved.
     */
    static void SaveEventsToXml(const std::vector < boost::shared_ptr<gd::BaseEvent> > & list, TiXmlElement * events);
};

}

#endif // GDCORE_EVENTS_SERIALIZATION_H
