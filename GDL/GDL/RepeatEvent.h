/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef REPEATEVENT_H
#define REPEATEVENT_H
#include "GDCore/Events/Event.h"
class RuntimeScene;
namespace gd { class Instruction; }
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;

/**
 * \brief Internal built-in event being repeated a number of times.
 */
class RepeatEvent : public gd::BaseEvent
{
    public:
        RepeatEvent();
        RepeatEvent(const RepeatEvent & event);
        virtual ~RepeatEvent() {};

        RepeatEvent& operator=(const RepeatEvent & event);
        virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new RepeatEvent(*this));}

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

        std::string GetRepeatExpression() const { return repeatNumberExpression.GetPlainString(); };
        std::string GetRepeatExpression() { return repeatNumberExpression.GetPlainString(); };
        void SetRepeatExpression(std::string repeatNumberExpression_) { repeatNumberExpression = gd::Expression(repeatNumberExpression_); };

        virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
        virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();
        virtual std::vector < gd::Expression* > GetAllExpressions();

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
        virtual EditEventReturnType EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_);

    private:
        void Init(const RepeatEvent & event);

        gd::Expression repeatNumberExpression;
        std::vector < gd::Instruction > conditions;
        std::vector < gd::Instruction > actions;
        std::vector < gd::BaseEventSPtr > events;

        bool repeatNumberExpressionSelected;
};

#endif // REPEATEVENT_H

#endif

