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

class EventsRefactorer
{
    public:
        static void RenameObjectInEvents(Game & game, Scene & scene, std::vector < BaseEventSPtr > & events, std::string oldName, std::string newName);

    private:
        static void RenameObjectInActions(Game & game, Scene & scene, std::vector < Instruction > & instructions, std::string oldName, std::string newName);
        static void RenameObjectInConditions(Game & game, Scene & scene, std::vector < Instruction > & instructions, std::string oldName, std::string newName);

        EventsRefactorer() {};
        virtual ~EventsRefactorer() {};
};

#endif // EVENTSREFACTORER_H
