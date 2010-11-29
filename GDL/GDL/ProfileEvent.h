/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#ifndef PROFILEEVENT_H
#define PROFILEEVENT_H
#include <wx/bitmap.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include "Event.h"
#include "GDL/profile.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

/**
 * Event used internally by Game Develop to profile events.
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
        void SetClock( boost::shared_ptr<btClock> profileClock_ ) { profileClock = profileClock_; }

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );
        void Stop();

        unsigned long int GetTime() const { return time; }

    private:
        void Init(const ProfileEvent & event);

        boost::shared_ptr<btClock> profileClock;
        boost::shared_ptr<ProfileEvent> previousProfileEvent;
        unsigned long int time;
};

#endif // PROFILEEVENT_H

#endif
