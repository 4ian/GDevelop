/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include <set>

using namespace std;

namespace gd
{

void EventsCodeGenerationContext::InheritsFrom(const EventsCodeGenerationContext & parent)
{
    //Objects lists declared by parent became "already declared" in the child context.
    alreadyDeclaredObjectsLists = parent.alreadyDeclaredObjectsLists;
    for ( set<string>::iterator it = parent.objectsListsToBeDeclared.begin() ; it != parent.objectsListsToBeDeclared.end(); ++it )
        alreadyDeclaredObjectsLists.insert(*it);
    for ( set<string>::iterator it = parent.emptyObjectsListsToBeDeclared.begin() ; it != parent.emptyObjectsListsToBeDeclared.end(); ++it )
        alreadyDeclaredObjectsLists.insert(*it);
}

void EventsCodeGenerationContext::ObjectsListNeeded(const std::string & objectName)
{
    if ( emptyObjectsListsToBeDeclared.find(objectName) == emptyObjectsListsToBeDeclared.end() )
        objectsListsToBeDeclared.insert(objectName);
}
void EventsCodeGenerationContext::EmptyObjectsListNeeded(const std::string & objectName)
{
    if ( objectsListsToBeDeclared.find(objectName) == objectsListsToBeDeclared.end() )
        emptyObjectsListsToBeDeclared.insert(objectName);
}

std::set<std::string> EventsCodeGenerationContext::GetAllObjectsToBeDeclared()
{
    std::set <std::string> allObjectListsToBeDeclared(objectsListsToBeDeclared.begin(), objectsListsToBeDeclared.end());
    allObjectListsToBeDeclared.insert(emptyObjectsListsToBeDeclared.begin(), emptyObjectsListsToBeDeclared.end());

    return allObjectListsToBeDeclared;
}

}
