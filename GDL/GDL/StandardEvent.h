/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef STANDARDEVENT_H
#define STANDARDEVENT_H
#include <wx/bitmap.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include "GDCore/Events/Event.h"
class RuntimeScene;
class Instruction;
class TiXmlElement;
class EventsCodeGenerationContext;
class EventsEditorItemsAreas;
class EventsEditorSelection;

/**
 * Standard event, with conditions, actions and sub events.
 */
class GD_API StandardEvent : public gd::BaseEvent
{
    public:
        StandardEvent();
        StandardEvent(const StandardEvent & event);
        virtual ~StandardEvent() {};

        StandardEvent& operator=(const StandardEvent & event);
        virtual gd::BaseEventSPtr Clone() { return boost::shared_ptr<gd::BaseEvent>(new StandardEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual std::string GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        virtual bool CanHaveSubEvents() const {return true;}
        virtual const std::vector < gd::BaseEventSPtr > & GetSubEvents() const {return events;};
        virtual std::vector < gd::BaseEventSPtr > & GetSubEvents() {return events;};
        void SetSubEvents(std::vector < gd::BaseEventSPtr > & subEvents_) {events = subEvents_;};

        const std::vector < Instruction > & GetConditions() const { return conditions; };
        std::vector < Instruction > & GetConditions() { return conditions; };
        void SetConditions(std::vector < Instruction > & conditions_) { conditions = conditions_; };
        const std::vector < Instruction > & GetActions() const { return actions; };
        std::vector < Instruction > & GetActions() { return actions; };
        void SetActions(std::vector < Instruction > & actions_) { actions = actions_; };

        virtual std::vector < std::vector<Instruction>* > GetAllConditionsVectors();
        virtual std::vector < std::vector<Instruction>* > GetAllActionsVectors();

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

    private:
        void Init(const StandardEvent & event);

        std::vector < Instruction > conditions;
        std::vector < Instruction > actions;
        std::vector < gd::BaseEventSPtr > events;
};


#endif // STANDARDEVENT_H

#endif
