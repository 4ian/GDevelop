/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "EventsCodeGenerationContext.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include <set>

using namespace std;

void EventsCodeGenerationContext::InheritsFrom(const EventsCodeGenerationContext & parent)
{
    //Objects lists declared by parent became "already declared" in the child context.
    objectsAlreadyDeclared = parent.objectsAlreadyDeclared;
    for ( set<string>::iterator it = parent.objectsToBeDeclared.begin() ; it != parent.objectsToBeDeclared.end(); ++it )
        objectsAlreadyDeclared.insert(*it);
    for ( set<string>::iterator it = parent.objectsListsDynamicallyDeclared.begin() ; it != parent.objectsListsDynamicallyDeclared.end(); ++it )
        objectsAlreadyDeclared.insert(*it);

    emptyObjectsListsAlreadyDeclared = parent.emptyObjectsListsAlreadyDeclared;
    for ( set<string>::iterator it = parent.objectsListsToBeDeclaredEmpty.begin() ; it != parent.objectsListsToBeDeclaredEmpty.end(); ++it )
        emptyObjectsListsAlreadyDeclared.insert(*it);

    currentObject = parent.currentObject;
    dynamicObjectsListsDeclaration = parent.dynamicObjectsListsDeclaration;
    if ( parent.dynamicObjectsListsDeclaration ) parentAlreadyUseDynamicDeclaration = true;

    includeFiles = parent.includeFiles;
    customCodeOutsideMain = parent.customCodeOutsideMain;
    customCodeInMain = parent.customCodeInMain;
    customGlobalDeclaration = parent.customGlobalDeclaration;

}

void EventsCodeGenerationContext::ObjectNeeded(std::string objectName)
{
    if (!dynamicObjectsListsDeclaration)
    {
        if (objectsListsToBeDeclaredEmpty.find(objectName) == objectsListsToBeDeclaredEmpty.end()) objectsToBeDeclared.insert(objectName);
    }
    else
    {
        EmptyObjectsListNeeded(objectName);

        //Be sure not to declare again objects
        if ( objectsAlreadyDeclared.find(objectName) != objectsAlreadyDeclared.end() ) return;
        if ( objectsToBeDeclared.find(objectName) != objectsToBeDeclared.end() ) return;
        if ( objectsListsDynamicallyDeclared.find(objectName) != objectsListsDynamicallyDeclared.end() ) return;

        objectsListsDynamicallyDeclared.insert(objectName);

        dynamicDeclaration += "if (find(objectsAlreadyDeclared.begin(), objectsAlreadyDeclared.end(), \""+objectName+"\") == objectsAlreadyDeclared.end()) ";
        dynamicDeclaration += "{\n";
        dynamicDeclaration += "    "+objectName+"objects = runtimeContext->GetObjectsRawPointers(\""+objectName+"\");\n";
        dynamicDeclaration += "    objectsAlreadyDeclared.push_back(\""+objectName+"\");";
        dynamicDeclaration += "}\n";
    }

};

std::string EventsCodeGenerationContext::GenerateObjectsDeclarationCode()
{
    std::string declarationsCode;

    if ( allObjectsMapNeeded ) declarationsCode += "std::map <std::string, std::vector<Object*> *> objectsListsMap;\n";
    if ( dynamicObjectsListsDeclaration )
    {
        if ( !parentAlreadyUseDynamicDeclaration)
            declarationsCode += "std::vector <std::string> objectsAlreadyDeclared;\n";
        else
            declarationsCode += "std::vector <std::string> & objectsAlreadyDeclaredT = objectsAlreadyDeclared;std::vector <std::string> objectsAlreadyDeclared = objectsAlreadyDeclaredT;\n";
    }

    for ( set<string>::iterator it = objectsToBeDeclared.begin() ; it != objectsToBeDeclared.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() && emptyObjectsListsAlreadyDeclared.find(*it) == emptyObjectsListsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects = runtimeContext->GetObjectsRawPointers(\""+*it+"\");\n";
            objectsAlreadyDeclared.insert(*it);

            if ( dynamicObjectsListsDeclaration ) declarationsCode += "objectsAlreadyDeclared.push_back(\""+*it+"\");\n";
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<Object*> & "+*it+"objectsT = "+*it+"objects;\n";
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objectsT;\n";
        }

        if ( allObjectsMapNeeded ) declarationsCode += "objectsListsMap[\""+*it+"\"] = &"+*it+"objects;\n";
    }
    for ( set<string>::iterator it = objectsListsToBeDeclaredEmpty.begin() ; it != objectsListsToBeDeclaredEmpty.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() && emptyObjectsListsAlreadyDeclared.find(*it) == emptyObjectsListsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects;\n";
            objectsAlreadyDeclared.insert(*it);
            emptyObjectsListsAlreadyDeclared.insert(*it);

            // No : We declare an object list, but it is empty, and is not considered as declared.
            //if ( dynamicObjectsListsDeclaration ) declarationsCode += "objectsAlreadyDeclared.push_back(\""+*it+"\");\n"; Let me commented please.
        }
        else
        {
            //Could normally be done in one line, but clang sometimes miscompile it.
            declarationsCode += "std::vector<Object*> & "+*it+"objectsT = "+*it+"objects;\n";
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objectsT;\n";

            //if ( dynamicObjectsListsDeclaration ) declarationsCode += "objectsAlreadyDeclared.push_back(\""+*it+"\");\n";
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
