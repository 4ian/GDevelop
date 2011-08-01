#ifndef EVENTSCODEGENERATIONCONTEXT_H
#define EVENTSCODEGENERATIONCONTEXT_H

#include <string>
#include <set>
#include <boost/shared_ptr.hpp>
class Game;
class Scene;

/**
 * Used to manage the context ( objects concerned, objects being modified by an action... )
 * when generating code for events.
 */
class EventsCodeGenerationContext
{
    public:
        EventsCodeGenerationContext() : errorOccured(false), allObjectsMapNeeded(false),dynamicObjectsListsDeclaration(false),parentAlreadyUseDynamicDeclaration(false) {};
        virtual ~EventsCodeGenerationContext() {};

        /**
         * Call this method to make an EventsCodeGenerationContext as a "child" of another one.
         * The child will then for example not declare again objects already declared by its parent.
         */
        void InheritsFrom(const EventsCodeGenerationContext & parent);

        std::string currentObject; ///< Instruction have to set this to an object name, if they use one.

        bool errorOccured; ///< True if error occured during code generation.

        /**
         * Call this when an instruction in the event need an object list.
         */
        void ObjectNeeded(std::string objectName);

        /**
         * Call this when an instruction in the event need an object list.
         */
        void EmptyObjectsListNeeded(std::string objectName) {if (objectsToBeDeclared.find(objectName) == objectsToBeDeclared.end()) objectsListsToBeDeclaredEmpty.insert(objectName);};

        /**
         * Delete an object from objects to be declared list. Can be used by an event which manages itself some objects ( e.g ForEach events )
         */
        void ObjectNotNeeded(std::string objectName) {objectsToBeDeclared.erase(objectName); objectsListsToBeDeclaredEmpty.erase(objectName);};

        /**
         * Request a map of all objects
         */
        void MapOfAllObjectsNeeded(const Game & game, const Scene & scene);

        /**
         * In case of dynamic objects list declaration, some declarations have to be made at the level of instructions.
         */
        std::string GenerateOptionalInstructionLevelDeclarationCode() { std::string returnedStr = dynamicDeclaration; dynamicDeclaration.clear(); return returnedStr; };

        /**
         * Generate code for getting needed object lists from scene. Also clear objectsToBeDeclared.
         * Usually used by an event.
         */
        std::string GenerateObjectsDeclarationCode();

        /**
         * Declare an include file to be added
         */
        void AddIncludeFile(std::string file) { if ( !file.empty() && includeFiles != boost::shared_ptr<std::set<std::string> >() ) includeFiles->insert(file); };

        boost::shared_ptr< std::set<std::string> > includeFiles; ///< List of headers files used by instructions. A (shared) pointer is used so as context created from another one can share the same list.
        std::set<std::string> objectsAlreadyDeclared;
        std::set<std::string> objectsToBeDeclared;

        std::set<std::string> emptyObjectsListsAlreadyDeclared;
        std::set<std::string> objectsListsToBeDeclaredEmpty;

        bool allObjectsMapNeeded;

        bool dynamicObjectsListsDeclaration;
        bool parentAlreadyUseDynamicDeclaration;
        std::string dynamicDeclaration;
        std::set<std::string> objectsListsDynamicallyDeclared;

    private:
};

#endif // EVENTSCODEGENERATIONCONTEXT_H
