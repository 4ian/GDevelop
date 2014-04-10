/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_EVENTS_SERIALIZATION_H
#define GDCORE_EVENTS_SERIALIZATION_H
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Events/Instruction.h"
#include <boost/shared_ptr.hpp>
#include <vector>
namespace gd { class Project; }
namespace gd { class EventsList; }
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
     * \brief Load an events list from a TiXmlElement
     * \param project The project the events belongs to.
     * \param list The event list in which the events must be loaded.
     * \param events The TiXmlElement containing the events
     */
    static void LoadEventsFromXml(gd::Project & project, gd::EventsList & list, const TiXmlElement * events);

    /**
     * \brief Save an events list from a TiXmlElement
     * \param list The event list to be saved.
     * \param events The TiXmlElement in which the events must be saved.
     */
    static void SaveEventsToXml(const gd::EventsList & list, TiXmlElement * events);

    /**
     * \brief Load a list of conditions from a TiXmlElement
     */
    static void OpenConditions(gd::Project & project, std::vector < gd::Instruction > & list, const TiXmlElement * elem);

    /**
     * \brief Load a list of actions from a TiXmlElement
     */
    static void OpenActions(gd::Project & project, std::vector < gd::Instruction > & list, const TiXmlElement * elem);

    /**
     * \brief Save a list of conditions to a TiXmlElement
     */
    static void SaveConditions(const std::vector < gd::Instruction > & list, TiXmlElement * elem);

    /**
     * \brief Save a list of actions to a TiXmlElement
     */
    static void SaveActions(const std::vector < gd::Instruction > & list, TiXmlElement * elem);

    /**
     * \brief Internal method called when opening events created with GD2.x
     *
     * Some instructions names have been changed as well as parameters since GD 3.
     */
    static void UpdateInstructionsFromGD2x(gd::Project & project, std::vector < gd::Instruction > & list, bool instructionsAreActions);

    /**
     * \brief Internal method called when opening events created with GD 3.1.x
     *
     * Variables related and some storage instructions have been changed.
     */
    static void UpdateInstructionsFromGD31x(gd::Project & project, std::vector < gd::Instruction > & list, bool instructionsAreActions);
};

}

#endif // GDCORE_EVENTS_SERIALIZATION_H
