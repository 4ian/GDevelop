/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef WHILEEVENT_H
#define WHILEEVENT_H

#include "GDCore/Events/Event.h"
class RuntimeScene;
namespace gd { class Instruction; }
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;

/**
 * While event is a standard event that is repeated while conditions are true
 */
class WhileEvent : public gd::BaseEvent
{
    public:
        WhileEvent() : infiniteLoopWarning(true), justCreatedByTheUser(true) {};
        WhileEvent(const WhileEvent & event);
        virtual ~WhileEvent() {};

        WhileEvent& operator=(const WhileEvent & event);
        virtual gd::BaseEventSPtr Clone() { return boost::shared_ptr<gd::BaseEvent>(new WhileEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual std::string GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        virtual bool CanHaveSubEvents() const {return true;}
        virtual const std::vector < gd::BaseEventSPtr > & GetSubEvents() const {return events;};
        virtual std::vector < gd::BaseEventSPtr > & GetSubEvents() {return events;};
        void SetSubEvents(std::vector < gd::BaseEventSPtr > & subEvents_) {events = subEvents_;};

        const std::vector < gd::Instruction > & GetConditions() const { return conditions; };
        std::vector < gd::Instruction > & GetConditions() { return conditions; };
        void SetConditions(std::vector < gd::Instruction > & conditions_) { conditions = conditions_; };

        const std::vector < gd::Instruction > & GetActions() const { return actions; };
        std::vector < gd::Instruction > & GetActions() { return actions; };
        void SetActions(std::vector < gd::Instruction > & actions_) { actions = actions_; };

        const std::vector < gd::Instruction > & GetWhileConditions() const { return whileConditions; };
        std::vector < gd::Instruction > & GetWhileConditions() { return whileConditions; };
        void SetWhileConditions(std::vector < gd::Instruction > & whileConditions_) { whileConditions = whileConditions_; };

        virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
        virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();

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

        /**
         * Called when the user want to edit the event
         */
        virtual EditEventReturnType EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);

    private:
        void Init(const WhileEvent & event);

        std::vector < gd::Instruction > whileConditions;
        std::vector < gd::Instruction > conditions;
        std::vector < gd::Instruction > actions;
        std::vector < gd::BaseEventSPtr > events;
        bool infiniteLoopWarning; ///< If true, code will be generated to warn the developer against an infinite loop.
        bool justCreatedByTheUser; ///< Used so as not to show message box to de/activate infinite loop warning when the user create the event

        mutable unsigned int whileConditionsHeight;

        int GetConditionsHeight() const;
        int GetActionsHeight() const;
        int GetWhileConditionsHeight() const;
};

#endif // WHILEEVENT_H

#endif
