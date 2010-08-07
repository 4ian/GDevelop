#include <boost/shared_ptr.hpp>
#include "Clipboard.h"
#include "MemTrace.h"
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Instruction.h"
#include "GDL/ExtensionsManager.h"

#ifndef RELEASE
extern MemTrace MemTracer;
#endif

//Une macro a été définie quelque part ( windows.h ),
//transformant GetObject en GetObjectA.
//On la désactive.
#undef GetObject

Clipboard::Clipboard() :
objectCopied(boost::shared_ptr<Object>()),
hasObject(false),
eventCopied(boost::shared_ptr<BaseEvent>()),
hasEvent(false),
hasExternalEvents(false),
hasAction(false),
hasCondition(false),
hasScene(false),
hasObjectGroup(false)
{
#ifndef RELEASE
    MemTracer.AddObj( "Clipboard", ( long )this );
#endif
    //ctor
}

Clipboard::~Clipboard()
{
#ifndef RELEASE
    MemTracer.DelObj( ( long )this );
#endif
    //dtor
}

Clipboard * Clipboard::getInstance()
{
    if ( NULL == singleton )
        singleton = new Clipboard;

    return singleton;
}

void Clipboard::kill()
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

void Clipboard::SetEvent( BaseEventSPtr event )
{
    eventCopied = event->Clone();
    hasEvent = true;
}

BaseEventSPtr Clipboard::GetEvent()
{
    return eventCopied->Clone();
}

void Clipboard::SetScene( const Scene & scene )
{
    sceneCopied = scene;
    hasScene = true;
}

Scene Clipboard::GetScene()
{
    return sceneCopied;
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

void Clipboard::SetCondition( const Instruction & condition )
{
    conditionCopied = condition;
    hasCondition = true;
}

Instruction Clipboard::GetCondition()
{
    return conditionCopied;
}

void Clipboard::SetAction( const Instruction & action )
{
    actionCopied = action ;
    hasAction = true;
}

Instruction Clipboard::GetAction()
{
    return actionCopied;
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

Clipboard * Clipboard::singleton = NULL;
