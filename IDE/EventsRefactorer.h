#ifndef EVENTSREFACTORER_H
#define EVENTSREFACTORER_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
namespace gd {class Layout; }
namespace gd {class Project; }
namespace gd {class ExternalEvents; }
namespace gd { class BaseEvent; }
class Game;
class Scene;
class Instruction;
class ExternalEvents;
namespace gd {typedef boost::shared_ptr<gd::BaseEvent> BaseEventSPtr;}

/**
 * \brief Class containing functions allowing to do refactoring tasks on events
 * Class containing functions allowing to do refactoring tasks on events
 * ( i.e Change object's name, delete an object... )
 */
class EventsRefactorer
{
    public:
        /**
         * Replace all occurences of an object name by another name
         * ( include : objects in parameters and in math/text expressions of all events ).
         */
        static void RenameObjectInEvents(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & events, std::string oldName, std::string newName);

        /**
         * Remove all actions or conditions using an object
         */
        static void RemoveObjectInEvents(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & events, std::string name);

        /**
         * Search for a string in events
         */
        static std::vector < boost::weak_ptr<gd::BaseEvent> > SearchInEvents(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & events,
                                          std::string search,
                                          bool matchCase,
                                          bool inConditions,
                                          bool inAction);

        /**
         * Replace all occurences of a string in events
         */
        static void ReplaceStringInEvents(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & events,
                                          std::string toReplace,
                                          std::string newString,
                                          bool matchCase,
                                          bool inConditions,
                                          bool inActions);

		static void NotifyChangesInEventsOfScene(gd::Project & project, gd::Layout & layout);
		static void NotifyChangesInEventsOfExternalEvents(gd::Project & project, gd::ExternalEvents & externalEvents);

    private:
        /**
         * Replace all occurences of an object name by another name in an action
         * ( include : objects in parameters and in math/text expressions ).
         *
         * \return true if something was modified.
         */
        static bool RenameObjectInActions(Game & game, Scene & scene, std::vector < Instruction > & instructions, std::string oldName, std::string newName);

        /**
         * Replace all occurences of an object name by another name in a condition
         * ( include : objects in parameters and in math/text expressions ).
         *
         * \return true if something was modified.
         */
        static bool RenameObjectInConditions(Game & game, Scene & scene, std::vector < Instruction > & instructions, std::string oldName, std::string newName);

        /**
         * Remove all conditions of the list using an object
         *
         * \return true if something was modified.
         */
        static bool RemoveObjectInConditions(Game & game, Scene & scene, std::vector < Instruction > & conditions, std::string name);

        /**
         * Remove all actions of the list using an object
         *
         * \return true if something was modified.
         */
        static bool RemoveObjectInActions(Game & game, Scene & scene, std::vector < Instruction > & conditions, std::string name);

        /**
         * Replace all occurences of a string in conditions
         *
         * \return true if something was modified.
         */
        static bool ReplaceStringInConditions(Game & game, Scene & scene, std::vector < Instruction > & conditions, std::string toReplace, std::string newString, bool matchCase);

        /**
         * Replace all occurences of a string in actions
         *
         * \return true if something was modified.
         */
        static bool ReplaceStringInActions(Game & game, Scene & scene, std::vector < Instruction > & conditions, std::string toReplace, std::string newString, bool matchCase);

        static bool SearchStringInActions(Game & game, Scene & scene, std::vector < Instruction > & actions, std::string search, bool matchCase);
        static bool SearchStringInConditions(Game & game, Scene & scene, std::vector < Instruction > & conditions, std::string search, bool matchCase);

        /**
         * Fill layouts and externalEvents vector with pointers to layouts and external events linked (even indirectly) by the events.
         *
         * \see EventsRefactorer::NotifyChangesInEventsOfScene
         * \see EventsRefactorer::NotifyChangesInEventsOfExternalEvents
         */
        static void GetScenesAndExternalEventsLinkedTo(const std::vector< boost::shared_ptr<gd::BaseEvent> > & events, gd::Project & project, std::vector< gd::Layout * > & layouts, std::vector< gd::ExternalEvents * > & externalEvents);

        EventsRefactorer() {};
        virtual ~EventsRefactorer() {};
};

#endif // EVENTSREFACTORER_H
