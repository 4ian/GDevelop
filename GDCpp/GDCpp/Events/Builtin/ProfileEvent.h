/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef PROFILEEVENT_H
#define PROFILEEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCpp/Runtime/profile.h"

/**
 * \brief Event used internally by GD C++ Platform to profile events.
 */
class GD_API ProfileEvent : public gd::BaseEvent
{
public:
    ProfileEvent();
    ProfileEvent(const ProfileEvent & event);
    virtual ~ProfileEvent();

    ProfileEvent& operator=(const ProfileEvent & event);
    virtual ProfileEvent * Clone() const { return new ProfileEvent(*this);}

    void SetPreviousProfileEvent( std::shared_ptr<ProfileEvent> previousProfileEvent_ ) { previousProfileEvent = previousProfileEvent_; }

    virtual bool IsExecutable() const {return true;}
    virtual gd::String GenerateEventCode(gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context);

    std::size_t index;

private:
    void Init(const ProfileEvent & event);

    std::shared_ptr<ProfileEvent> previousProfileEvent;
};

#endif // PROFILEEVENT_H

#endif
