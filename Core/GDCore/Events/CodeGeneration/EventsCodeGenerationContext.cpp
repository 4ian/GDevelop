/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include <set>

using namespace std;

namespace gd
{

void EventsCodeGenerationContext::InheritsFrom(const EventsCodeGenerationContext & parent_)
{
    parent = &parent_;

    //Objects lists declared by parent became "already declared" in the child context.
    alreadyDeclaredObjectsLists = parent_.alreadyDeclaredObjectsLists;
    for ( std::set<gd::String>::iterator it = parent_.objectsListsToBeDeclared.begin() ; it != parent_.objectsListsToBeDeclared.end(); ++it )
        alreadyDeclaredObjectsLists.insert(*it);
    for ( std::set<gd::String>::iterator it = parent_.emptyObjectsListsToBeDeclared.begin() ; it != parent_.emptyObjectsListsToBeDeclared.end(); ++it )
        alreadyDeclaredObjectsLists.insert(*it);

    depthOfLastUse = parent_.depthOfLastUse;
    customConditionDepth = parent_.customConditionDepth;
    contextDepth = parent_.GetContextDepth()+1;
    if ( parent_.maxDepthLevel )
    {
        maxDepthLevel = parent_.maxDepthLevel;
        *maxDepthLevel = std::max(*maxDepthLevel, contextDepth);
    }
}

void EventsCodeGenerationContext::ObjectsListNeeded(const gd::String & objectName)
{
    if ( emptyObjectsListsToBeDeclared.find(objectName) == emptyObjectsListsToBeDeclared.end() )
        objectsListsToBeDeclared.insert(objectName);

    depthOfLastUse[objectName] = GetContextDepth();
}
void EventsCodeGenerationContext::EmptyObjectsListNeeded(const gd::String & objectName)
{
    if ( objectsListsToBeDeclared.find(objectName) == objectsListsToBeDeclared.end() )
        emptyObjectsListsToBeDeclared.insert(objectName);

    depthOfLastUse[objectName] = GetContextDepth();
}

std::set<gd::String> EventsCodeGenerationContext::GetAllObjectsToBeDeclared() const
{
    std::set <gd::String> allObjectListsToBeDeclared(objectsListsToBeDeclared.begin(), objectsListsToBeDeclared.end());
    allObjectListsToBeDeclared.insert(emptyObjectsListsToBeDeclared.begin(), emptyObjectsListsToBeDeclared.end());

    return allObjectListsToBeDeclared;
}

unsigned int EventsCodeGenerationContext::GetLastDepthObjectListWasNeeded(const gd::String & name) const
{
    if ( depthOfLastUse.count(name) != 0 )
        return depthOfLastUse.find(name)->second;

    std::cout << "WARNING: During code generation, the last depth of an object list was 0." << std::endl;
    return 0;
}

}
