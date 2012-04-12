#include <boost/shared_ptr.hpp>
#include "Clipboard.h"
#include "GDL/Object.h"
#include "GDL/Position.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDL/ExtensionsManager.h"

//Une macro a été définie quelque part ( windows.h ),
//transformant GetObject en GetObjectA.
//On la désactive.
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
    layoutCopied = layout->Clone();
    hasLayout = true;
}

gd::Layout * Clipboard::GetLayout()
{
    return layoutCopied->Clone();
}

void Clipboard::SetExternalEvents( const ExternalEvents & events )
{
    externalEventsCopied = events;
    hasExternalEvents = true;
}

ExternalEvents Clipboard::GetExternalEvents()
{
    return externalEventsCopied;
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

void Clipboard::SetObjectGroup( const ObjectGroup & group )
{
    objectGroupCopied = group;
    hasObjectGroup = true;
}

ObjectGroup Clipboard::GetObjectGroup()
{
    return objectGroupCopied;
}

void Clipboard::SetPositionsSelection( vector < InitialPosition > positionsSelection_ )
{
    positionsSelection = positionsSelection_;
    hasPositionsSelection = true;
}

Clipboard * Clipboard::singleton = NULL;
