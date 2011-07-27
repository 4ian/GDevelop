#include "EventsCodeGenerationContext.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include <set>

using namespace std;

void EventsCodeGenerationContext::InheritsFrom(const EventsCodeGenerationContext & parent)
{
    objectsAlreadyDeclared = parent.objectsToBeDeclared;
    includeFiles = parent.includeFiles;
    currentObject = parent.currentObject;
    allObjectsMapNeeded = parent.allObjectsMapNeeded;
}

std::string EventsCodeGenerationContext::GenerateObjectsDeclarationCode()
{
    std::string declarationsCode;

    if ( allObjectsMapNeeded )
    {
        declarationsCode += "std::map <std::string, std::vector<Object*> *> objectsListsMap;\n";
    }

    for ( set<string>::iterator it = objectsToBeDeclared.begin() ; it != objectsToBeDeclared.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects = runtimeContext->GetObjectsRawPointers(\""+*it+"\");\n";
            objectsAlreadyDeclared.insert(*it);
        }
        else
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objects;\n";

        }

        if ( allObjectsMapNeeded ) declarationsCode += "objectsListsMap[\""+*it+"\"] = &"+*it+"objects;\n";
    }
    for ( set<string>::iterator it = objectsListsToBeDeclaredEmpty.begin() ; it != objectsListsToBeDeclaredEmpty.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects;\n";
            objectsAlreadyDeclared.insert(*it);
        }
        else
        {

            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objects;\n";

        }

        if ( allObjectsMapNeeded ) declarationsCode += "objectsListsMap[\""+*it+"\"] = &"+*it+"objects;\n";
    }

    return declarationsCode;
}

void EventsCodeGenerationContext::MapOfAllObjectsNeeded(const Game & game, const Scene & scene)
{
    allObjectsMapNeeded = true;

    for (unsigned int i = 0;i<game.globalObjects.size();++i)
    {
        EmptyObjectsListNeeded(game.globalObjects[i]->GetName());
    }
    for (unsigned int i = 0;i<scene.initialObjects.size();++i)
    {
        EmptyObjectsListNeeded(scene.initialObjects[i]->GetName());
    }
}
