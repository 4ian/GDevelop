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
    dynamicObjectsListsDeclaration = parent.dynamicObjectsListsDeclaration;
}

void EventsCodeGenerationContext::ObjectNeeded(std::string objectName)
{
    if (!dynamicObjectsListsDeclaration)
    {
        if (objectsListsToBeDeclaredEmpty.find(objectName) == objectsListsToBeDeclaredEmpty.end()) objectsToBeDeclared.insert(objectName);
    }
    else
    {
        //Be sure not to declare again objects
        if ( objectsAlreadyDeclared.find(objectName) != objectsAlreadyDeclared.end() ) return;
        if ( objectsToBeDeclared.find(objectName) != objectsToBeDeclared.end() ) return;

        EmptyObjectsListNeeded(objectName);

        dynamicDeclaration += "if (find(objectsAlreadyDeclared.begin(), objectsAlreadyDeclared.end(), \""+objectName+"\") == objectsAlreadyDeclared.end()) ";
        dynamicDeclaration += "{";
        dynamicDeclaration += "    "+objectName+"objects = runtimeContext->GetObjectsRawPointers(\""+objectName+"\");\n";
        dynamicDeclaration += "    objectsAlreadyDeclared.push_back(\""+objectName+"\");";
        dynamicDeclaration += "}\n";
    }

};

std::string EventsCodeGenerationContext::GenerateObjectsDeclarationCode()
{
    std::string declarationsCode;

    if ( allObjectsMapNeeded ) declarationsCode += "std::map <std::string, std::vector<Object*> *> objectsListsMap;\n";
    if ( dynamicObjectsListsDeclaration ) declarationsCode += "std::vector <std::string> objectsAlreadyDeclared;\n";

    for ( set<string>::iterator it = objectsToBeDeclared.begin() ; it != objectsToBeDeclared.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects = runtimeContext->GetObjectsRawPointers(\""+*it+"\");\n";
            objectsAlreadyDeclared.insert(*it);
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<Object*> & "+*it+"objectsT = "+*it+"objects;\n";
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objectsT;\n";
        }

        if ( allObjectsMapNeeded ) declarationsCode += "objectsListsMap[\""+*it+"\"] = &"+*it+"objects;\n";
        if ( dynamicObjectsListsDeclaration ) declarationsCode += "objectsAlreadyDeclared.push_back(\""+*it+"\");\n";
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
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<Object*> & "+*it+"objectsT = "+*it+"objects;\n";
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objectsT;\n";
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
