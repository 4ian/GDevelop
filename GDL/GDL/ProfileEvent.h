/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PROFILEEVENT_H
#define PROFILEEVENT_H
#include "GDCore/Events/Event.h"
#include "GDL/profile.h"

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
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new ProfileEvent(*this));}

    void SetPreviousProfileEvent( boost::shared_ptr<ProfileEvent> previousProfileEvent_ ) { previousProfileEvent = previousProfileEvent_; }

    virtual bool IsExecutable() const {return true;}
    virtual std::string GenerateEventCode(gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context);

    unsigned int index;

private:
    void Init(const ProfileEvent & event);

    boost::shared_ptr<ProfileEvent> previousProfileEvent;
};

#endif // PROFILEEVENT_H

#endif

