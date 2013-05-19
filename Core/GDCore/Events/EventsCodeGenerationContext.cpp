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

void EventsCodeGenerationContext::InheritsFrom(const EventsCodeGenerationContext & parent_)
{
    //Objects lists declared by parent became "already declared" in the child context.
    alreadyDeclaredObjectsLists = parent_.alreadyDeclaredObjectsLists;
    for ( set<string>::iterator it = parent_.objectsListsToBeDeclared.begin() ; it != parent_.objectsListsToBeDeclared.end(); ++it )
        alreadyDeclaredObjectsLists.insert(*it);
    for ( set<string>::iterator it = parent_.emptyObjectsListsToBeDeclared.begin() ; it != parent_.emptyObjectsListsToBeDeclared.end(); ++it )
        alreadyDeclaredObjectsLists.insert(*it);

    scopeLevel = parent_.GetScopeLevel()+1;
    parent = &parent_;
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

std::set<std::string> EventsCodeGenerationContext::GetAllObjectsToBeDeclared() const
{
    std::set <std::string> allObjectListsToBeDeclared(objectsListsToBeDeclared.begin(), objectsListsToBeDeclared.end());
    allObjectListsToBeDeclared.insert(emptyObjectsListsToBeDeclared.begin(), emptyObjectsListsToBeDeclared.end());

    return allObjectListsToBeDeclared;
}

}
