#ifndef EVENTSREFACTORER_H
#define EVENTSREFACTORER_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
class BaseEvent;
class Game;
class Scene;
class Instruction;
typedef boost::shared_ptr<BaseEvent> BaseEventSPtr;

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
        static void RenameObjectInEvents(Game & game, Scene & scene, std::vector < BaseEventSPtr > & events, std::string oldName, std::string newName);

    private:
        /**
         * Replace all occurences of an object name by another name in an action
         * ( include : objects in parameters and in math/text expressions ).
         */
        static void RenameObjectInActions(Game & game, Scene & scene, std::vector < Instruction > & instructions, std::string oldName, std::string newName);

        /**
         * Replace all occurences of an object name by another name in a condition
         * ( include : objects in parameters and in math/text expressions ).
         */
        static void RenameObjectInConditions(Game & game, Scene & scene, std::vector < Instruction > & instructions, std::string oldName, std::string newName);

        EventsRefactorer() {};
        virtual ~EventsRefactorer() {};
};

#endif // EVENTSREFACTORER_H
