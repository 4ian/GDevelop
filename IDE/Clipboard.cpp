/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <boost/shared_ptr.hpp>
#include "Clipboard.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/ExternalLayout.h"
#include "GDL/Object.h"
#include "GDL/Position.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"

//Undefining an annoying macro changing GetObject in GetObjectA
#undef GetObject

Clipboard::Clipboard() :
objectCopied(NULL),
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

void Clipboard::SetObject( const gd::Object * object )
{
    objectCopied = object->Clone();

    hasObject = true;
}

gd::Object * Clipboard::GetObject()
{
    return objectCopied->Clone();
}

void Clipboard::SetEvents( const std::vector<gd::BaseEventSPtr> & events )
{
    eventsCopied = CloneVectorOfEvents(events);
    hasEvents = true;
}

std::vector<gd::BaseEventSPtr> Clipboard::GetEvents()
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

void Clipboard::SetExternalLayout( const gd::ExternalLayout * layout )
{
    if ( layout == NULL ) return;

    externalLayoutCopied = layout->Clone();
    hasExternalLayout = true;
}

gd::ExternalLayout * Clipboard::GetExternalLayout()
{
    if ( externalLayoutCopied == NULL ) return NULL;
    return externalLayoutCopied->Clone();
}

void Clipboard::SetConditions( const std::vector<gd::Instruction> & conditions )
{
    hasInstructions = true;
    instructionsAreConditions = true;
    instructionsCopied = conditions;
}

void Clipboard::SetActions( const std::vector<gd::Instruction> & actions )
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

void Clipboard::SetPositionsSelection( std::vector < InitialPosition > positionsSelection_ )
{
    positionsSelection = positionsSelection_;
    hasPositionsSelection = true;
}

Clipboard * Clipboard::singleton = NULL;

