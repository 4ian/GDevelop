/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "ProfileEvent.h"
#include "GDL/BuiltinExtensions/ProfileTools.h"
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDL/IDE/BaseProfiler.h"
#include <iostream>

ProfileEvent::ProfileEvent() :
BaseEvent(),
index(0)
{
}

ProfileEvent::~ProfileEvent()
{
}

std::string ProfileEvent::GenerateEventCode(gd::Layout & scene, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
{
    codeGenerator.AddIncludeFile("GDL/BuiltinExtensions/ProfileTools.h");

    ProfileLink profileLink;
    profileLink.originalEvent = originalEvent;
    scene.GetProfiler()->profileEventsInformation.push_back(profileLink);
    index = scene.GetProfiler()->profileEventsInformation.size()-1;

    std::string code;

    if ( previousProfileEvent )
        code += "EndProfileTimer(*runtimeContext->scene, "+ToString(previousProfileEvent->index)+");\n";

    code += "StartProfileTimer(*runtimeContext->scene, "+ToString(index)+");\n";

    return code;
}

/**
 * Initialize from another ProfileEvent.
 * Used by copy ctor and assignement operator
 */
void ProfileEvent::Init(const ProfileEvent & event)
{
    previousProfileEvent = event.previousProfileEvent;
}

/**
 * Custom copy operator
 */
ProfileEvent::ProfileEvent(const ProfileEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
ProfileEvent& ProfileEvent::operator=(const ProfileEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

#endif

