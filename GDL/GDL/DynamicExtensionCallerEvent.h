#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef DYNAMICEXTENSIONCALLEREVENT_H
#define DYNAMICEXTENSIONCALLEREVENT_H

#include <wx/bitmap.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include <string>
#include <boost/weak_ptr.hpp>
#include "Event.h"
class RuntimeScene;
class Game;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

/**
 * \brief Internal builtin event calling a dynamic extension event.
 */
class GD_API DynamicExtensionCallerEvent : public BaseEvent
{
    public:
        DynamicExtensionCallerEvent() : BaseEvent() {};
        DynamicExtensionCallerEvent(const DynamicExtensionCallerEvent & event);
        virtual ~DynamicExtensionCallerEvent() {};

        DynamicExtensionCallerEvent& operator=(const DynamicExtensionCallerEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new DynamicExtensionCallerEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        virtual void Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);

        virtual bool CanHaveSubEvents() const {return false;}

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        void SetDynamicExtensionEventName(std::string name) { dynamicExtensionEventName = name; }
        std::string GetDynamicExtensionEventName() const { return dynamicExtensionEventName; }

        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const;

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);


    private:
        void Init(const DynamicExtensionCallerEvent & event);

        std::string dynamicExtensionEventName;
        boost::weak_ptr<BaseEvent> dynamicExtensionEvent;
};

#endif // DYNAMICEXTENSIONCALLEREVENT_H

#endif
#endif
