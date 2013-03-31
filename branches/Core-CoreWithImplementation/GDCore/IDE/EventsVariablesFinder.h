/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EVENTSVARIABLESFINDER_H
#define EVENTSVARIABLESFINDER_H
#include <string>
#include <vector>
#include <set>
#include "GDCore/Events/Event.h"
namespace gd { class Instruction; }
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Perform search over a project or a layout searching for variables
 *
 * \ingroup IDE
 */
class EventsVariablesFinder
{
public:
    /**
     * Construct a list containing the name of all global variables used in the project.
     * \param project The project to be scanned
     * \return A std::set containing the names of all global variables used
     */
    static std::set < std::string > FindAllGlobalVariables(const gd::Project & project);

    /**
     * Construct a list containing the name of all layout variables used in the layout.
     * \param project The project
     * \param layout The layout to be scanned
     * \return A std::set containing the names of all layout variables used
     */
    static std::set < std::string > FindAllLayoutVariables(const gd::Project & project, const gd::Layout & layout);

private:

    /**
     * Construct a list of the value of the arguments for parameters of type @ parameterType
     * \param project The project used
     * \param project The layout used
     * \param instructions The instructions to be analyzed
     * \param parameterType The parameters type to be analyzed
     *
     * \return A std::set filled with the values used for all parameters of the specified type
     */
    static std::set < std::string > FindArgumentsInInstructions(const gd::Project & project, const gd::Layout & layout, const std::vector < gd::Instruction > & instructions, bool instructionsAreConditions, const std::string & parameterType);

    /**
     * Construct a list of the value of the arguments for parameters of type @ parameterType
     * \param project The project used
     * \param project The layout used
     * \param events The events to be analyzed
     * \param parameterType The parameters type to be analyzed
     *
     * \return A std::set filled with the values used for all parameters of the specified type
     */
    static std::set < std::string > FindArgumentsInEvents(const gd::Project & project, const gd::Layout & layout, const std::vector < gd::BaseEventSPtr > & events, const std::string & parameterType);

    EventsVariablesFinder() {};
    virtual ~EventsVariablesFinder() {};
};

}

#endif // EVENTSVARIABLESFINDER_H
