/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "ProfileEvent.h"
#include "GDCpp/BuiltinExtensions/ProfileTools.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Scene.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include <iostream>

ProfileEvent::ProfileEvent() :
BaseEvent(),
index(0)
{
}

ProfileEvent::~ProfileEvent()
{
}

std::string ProfileEvent::GenerateEventCode(gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
{
    const gd::Layout & scene = codeGenerator.GetLayout();
    codeGenerator.AddIncludeFile("GDCpp/BuiltinExtensions/ProfileTools.h");

    ProfileLink profileLink;
    profileLink.originalEvent = originalEvent;
    std::cout << scene.GetProfiler() << std::endl;
    if ( scene.GetProfiler() ) //Should always be not NULL
    {
        scene.GetProfiler()->profileEventsInformation.push_back(profileLink);
        index = scene.GetProfiler()->profileEventsInformation.size()-1;
    }
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

