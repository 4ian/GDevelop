/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PROFILEEVENT_H
#define PROFILEEVENT_H
#include <wx/bitmap.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include "GDCore/Events/Event.h"
#include "GDL/profile.h"

/**
 * \brief Event used internally by Game Develop to profile events.
 */
class GD_API ProfileEvent : public BaseEvent
{
    public:
        ProfileEvent();
        ProfileEvent(const ProfileEvent & event);
        virtual ~ProfileEvent();

        ProfileEvent& operator=(const ProfileEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new ProfileEvent(*this));}

        void SetPreviousProfileEvent( boost::shared_ptr<ProfileEvent> previousProfileEvent_ ) { previousProfileEvent = previousProfileEvent_; }

        virtual bool IsExecutable() const {return true;}
        virtual std::string GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        unsigned int index;

    private:
        void Init(const ProfileEvent & event);

        boost::shared_ptr<ProfileEvent> previousProfileEvent;
};

#endif // PROFILEEVENT_H

#endif
