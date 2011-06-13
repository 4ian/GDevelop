#ifndef EVENTSCODEGENERATIONCONTEXT_H
#define EVENTSCODEGENERATIONCONTEXT_H

#include <string>
#include <set>

/**
 * Used to manage the context ( objects concerned, objects being modified by an action... )
 * when generating code for events.
 */
class EventsCodeGenerationContext
{
    public:
        EventsCodeGenerationContext() {};
        virtual ~EventsCodeGenerationContext() {};

        std::string currentObject;

        void ObjectNeeded(std::string objectName) {objectsToBeDeclared.insert(objectName);};

        std::set<std::string> objectsAlreadyDeclared;
        std::set<std::string> objectsToBeDeclared;

    private:
};

#endif // EVENTSCODEGENERATIONCONTEXT_H
