/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <boost/shared_ptr.hpp>
#include "Clipboard.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDL/Object.h"
#include "GDL/Position.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDL/ExtensionsManager.h"

//Undefining an annoying macro changing GetObject in GetObjectA
#undef GetObject

Clipboard::Clipboard() :
objectCopied(boost::shared_ptr<Object>()),
hasObject(false),
hasEvents(false),
hasExternalEvents(false),
hasInstructions(false),
instructionsAreConditions(true),
layoutCopied(NULL),
hasLayout(false),
hasObjectGroup(false),
hasPositionsSelection(false)
{
    //ctor
}

Clipboard::~Clipboard()
{
    if ( layoutCopied != NULL ) delete layoutCopied;
}

Clipboard * Clipboard::GetInstance()
{
    if ( NULL == singleton )
        singleton = new Clipboard;

    return singleton;
}

void Clipboard::DestroySingleton()
{
    if ( NULL != singleton )
    {
        delete singleton;
        singleton = NULL;
    }
}

void Clipboard::SetObject( ObjSPtr object )
{
    objectCopied = object->Clone();

    hasObject = true;
}

ObjSPtr Clipboard::GetObject()
{
    return objectCopied;
}

void Clipboard::SetEvents( const std::vector<BaseEventSPtr> & events )
{
    eventsCopied = CloneVectorOfEvents(events);
    hasEvents = true;
}

std::vector<BaseEventSPtr> Clipboard::GetEvents()
{
    return CloneVectorOfEvents(eventsCopied);
}

void Clipboard::SetLayout( const gd::Layout * layout )
{
    if ( layout == NULL ) return;

    layoutCopied = layout->Clone();
    hasLayout = true;
}

gd::Layout * Clipboard::GetLayout()
{
    if ( layoutCopied == NULL ) return NULL;
    return layoutCopied->Clone();
}

void Clipboard::SetExternalEvents( const gd::ExternalEvents * events )
{
    if ( events == NULL ) return;

    externalEventsCopied = events->Clone();
    hasExternalEvents = true;
}

gd::ExternalEvents * Clipboard::GetExternalEvents()
{
    if ( externalEventsCopied == NULL ) return NULL;
    return externalEventsCopied->Clone();
}

void Clipboard::SetConditions( const std::vector<Instruction> & conditions )
{
    hasInstructions = true;
    instructionsAreConditions = true;
    instructionsCopied = conditions;
}

void Clipboard::SetActions( const std::vector<Instruction> & actions )
{
    hasInstructions = true;
    instructionsAreConditions = false;
    instructionsCopied = actions;
}

void Clipboard::SetObjectGroup( const gd::ObjectGroup & group )
{
    objectGroupCopied = group;
    hasObjectGroup = true;
}

gd::ObjectGroup Clipboard::GetObjectGroup()
{
    return objectGroupCopied;
}

void Clipboard::SetPositionsSelection( vector < InitialPosition > positionsSelection_ )
{
    positionsSelection = positionsSelection_;
    hasPositionsSelection = true;
}

Clipboard * Clipboard::singleton = NULL;
