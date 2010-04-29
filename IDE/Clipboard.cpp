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
eventCopied(boost::shared_ptr<BaseEvent>()),
hasObject(false),
hasEvent(false),
hasAction(false),
hasCondition(false),
hasScene(false)
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
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    objectCopied = extensionsManager->CreateObject(object);

    hasObject = true;
}

ObjSPtr Clipboard::GetObject()
{
    return objectCopied;
}

bool Clipboard::HasObject()
{
    if (hasObject)
        return true;

    return false;
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

bool Clipboard::HasEvent()
{
    if (hasEvent)
        return true;

    return false;
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

bool Clipboard::HasScene()
{
    if (hasScene)
        return true;

    return false;
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

bool Clipboard::HasCondition()
{
    if (hasCondition)
        return true;

    return false;
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

bool Clipboard::HasAction()
{
    if (hasAction)
        return true;

    return false;
}

Clipboard * Clipboard::singleton = NULL;
