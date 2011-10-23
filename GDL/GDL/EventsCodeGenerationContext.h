/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

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
class GD_API EventsCodeGenerationContext
{
    public:
        EventsCodeGenerationContext() : errorOccured(false), allObjectsMapNeeded(false),dynamicObjectsListsDeclaration(false),parentAlreadyUseDynamicDeclaration(false), contextReallyNeedAlreadyConcernedObjects(false) {};
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
         * Set an object to be already declared. Can be used by an event which declare itself the objects.
         */
        void ObjectAlreadyDeclared(std::string objectName) {objectsAlreadyDeclared.insert(objectName);}

        /**
         * Request a map of all objects
         */
        void MapOfAllObjectsNeeded(const Game & game, const Scene & scene);
        bool MapOfAllObjectsIsNeeded() const { return allObjectsMapNeeded; };

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

        /**
         * Add a declaration which will be inserted after includes
         */
        void AddGlobalDeclaration(std::string declaration) { if(customGlobalDeclaration!=boost::shared_ptr< std::set<std::string> >()) customGlobalDeclaration->insert(declaration); };

        /**
         * Add some code before events outside main function.
         */
        void AddCustomCodeOutsideMain(std::string code) { if(customCodeOutsideMain!=boost::shared_ptr< std::string >()) *customCodeOutsideMain += code; };

        /**
         * Add some code before events in main function.
         */
        void AddCustomCodeInMain(std::string code) { if(customCodeInMain!=boost::shared_ptr< std::string >()) *customCodeInMain += code; };

        /**
         * Called when an instruction need dynamic object lists declaration ( CreateObject for example, and all instruction with a "listOfAlreadyPickedObjects" parameter ).
         */
        void NeedObjectListsDynamicDeclaration()
        {
            dynamicObjectsListsDeclaration=true;
            contextReallyNeedAlreadyConcernedObjects=true;  //We really need objectsAlreadyDeclared in code
        }

        boost::shared_ptr< std::set<std::string> > includeFiles; ///< List of headers files used by instructions. A (shared) pointer is used so as context created from another one can share the same list.

        std::set<std::string> objectsToBeDeclared; ///< Objects list to be declared ( i.e. filled with objects of scene ) in this context.
        std::set<std::string> objectsListsToBeDeclaredEmpty; ///< Empty objects list to be declared in this context.

        boost::shared_ptr< std::string > customCodeOutsideMain; ///< Custom code inserted before events ( and not in events function )
        boost::shared_ptr< std::string > customCodeInMain; ///< Custom code inserted before events ( in main function )
        boost::shared_ptr< std::set<std::string> > customGlobalDeclaration; ///< Custom global C++ declarations inserted after includes

    private:
        std::set<std::string> objectsAlreadyDeclared; ///< Objects list declared in parent contexts.
        std::set<std::string> emptyObjectsListsAlreadyDeclared; ///< Empty object list declared in parent context.
        std::set<std::string> objectsListsDynamicallyDeclared; ///< Objects list which have been declared dynamically ( i.e : Declared "empty", and then filled with objects of scene if needed in an instruction ).

        bool allObjectsMapNeeded; ///< Set this to true if a std::map containing pointers to all objects lists is needed.

        bool dynamicObjectsListsDeclaration; ///< Set this to true when object declaration must be dynamic: The next object lists will be declared empty, and a dynamic declaration wille be generated.
        bool parentAlreadyUseDynamicDeclaration;
        bool contextReallyNeedAlreadyConcernedObjects; ///< Sometimes, when dynamicObjectsListsDeclaration is set to true owing to the parent context, the current context could then not use any dynamic declaration. We use this bool to know if we must really declare an "alreadyConcernedObjects" vector.

        std::string dynamicDeclaration; ///< String which is filled by dynamic declarations, if needed.
};

#endif // EVENTSCODEGENERATIONCONTEXT_H
