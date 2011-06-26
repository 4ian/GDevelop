#ifndef EVENTSCODEGENERATIONCONTEXT_H
#define EVENTSCODEGENERATIONCONTEXT_H

#include <string>
#include <set>
#include <boost/shared_ptr.hpp>

/**
 * Used to manage the context ( objects concerned, objects being modified by an action... )
 * when generating code for events.
 */
class EventsCodeGenerationContext
{
    public:
        EventsCodeGenerationContext() : errorOccured(false) {};
        virtual ~EventsCodeGenerationContext() {};

        std::string currentObject; ///< Instruction have to set this to an object name, if they use one.

        bool errorOccured; ///< True if error occured during code generation.

        /**
         * Call this when an instruction in the event need an object list.
         */
        void ObjectNeeded(std::string objectName) {objectsToBeDeclared.insert(objectName);};

        /**
         * Declare an include file to be added
         */
        void AddIncludeFile(std::string file) { if ( includeFiles != boost::shared_ptr<std::set<std::string> >() ) includeFiles->insert(file); };

        std::set<std::string> objectsAlreadyDeclared;
        std::set<std::string> objectsToBeDeclared;

        boost::shared_ptr< std::set<std::string> > includeFiles;

    private:
};

#endif // EVENTSCODEGENERATIONCONTEXT_H
