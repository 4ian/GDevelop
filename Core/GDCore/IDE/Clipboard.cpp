/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <memory>
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"

//Undefining an annoying macro changing GetObject in GetObjectA
#undef GetObject

namespace gd
{

Clipboard::Clipboard() :
objectCopied(NULL),
hasObject(false),
hasEvents(false),
hasInstructions(false),
instructionsAreConditions(true),
externalEventsCopied(NULL),
hasExternalEvents(false),
externalLayoutCopied(NULL),
hasExternalLayout(false),
layoutCopied(NULL),
hasLayout(false),
hasObjectGroup(false),
hasInstances(false)
{
    //ctor
}

Clipboard::~Clipboard()
{
    if ( layoutCopied != NULL ) delete layoutCopied;
}

Clipboard * Clipboard::Get()
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

void Clipboard::SetEvents( const gd::EventsList & events )
{
    eventsCopied = events;
    hasEvents = true;
}

gd::EventsList Clipboard::GetEvents()
{
    return eventsCopied;
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

void Clipboard::SetExternalEvents( const gd::ExternalEvents & events )
{
    if (externalEventsCopied) delete externalEventsCopied;
    externalEventsCopied = new gd::ExternalEvents(events);
    hasExternalEvents = true;
}

gd::ExternalEvents Clipboard::GetExternalEvents()
{
    return *externalEventsCopied;
}

void Clipboard::SetExternalLayout( const gd::ExternalLayout & layout )
{
    if (externalLayoutCopied) delete externalLayoutCopied;
    externalLayoutCopied = new gd::ExternalLayout(layout);
    hasExternalLayout = true;
}

gd::ExternalLayout Clipboard::GetExternalLayout()
{
    return *externalLayoutCopied;
}

void Clipboard::SetConditions( const gd::InstructionsList & conditions )
{
    hasInstructions = true;
    instructionsAreConditions = true;
    instructionsCopied = conditions;
}

void Clipboard::SetActions( const gd::InstructionsList & actions )
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

void Clipboard::SetInstances( std::vector < std::shared_ptr<gd::InitialInstance> > instances )
{
    instancesCopied = instances;
    hasInstances = true;
}

Clipboard * Clipboard::singleton = NULL;

}
