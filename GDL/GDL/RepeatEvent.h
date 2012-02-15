/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef REPEATEVENT_H
#define REPEATEVENT_H
#include "Event.h"
class RuntimeScene;
class Instruction;
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;

/**
 * \brief Internal built-in event being repeated a number of times.
 */
class RepeatEvent : public BaseEvent
{
    public:
        RepeatEvent();
        RepeatEvent(const RepeatEvent & event);
        virtual ~RepeatEvent() {};

        RepeatEvent& operator=(const RepeatEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new RepeatEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual std::string GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        virtual bool CanHaveSubEvents() const {return true;}
        virtual const vector < BaseEventSPtr > & GetSubEvents() const {return events;};
        virtual vector < BaseEventSPtr > & GetSubEvents() {return events;};
        void SetSubEvents(vector < BaseEventSPtr > & subEvents_) {events = subEvents_;};

        const vector < Instruction > & GetConditions() const { return conditions; };
        vector < Instruction > & GetConditions() { return conditions; };
        void SetConditions(vector < Instruction > & conditions_) { conditions = conditions_; };

        const vector < Instruction > & GetActions() const { return actions; };
        vector < Instruction > & GetActions() { return actions; };
        void SetActions(vector < Instruction > & actions_) { actions = actions_; };

        string GetRepeatExpression() const { return repeatNumberExpression.GetPlainString(); };
        string GetRepeatExpression() { return repeatNumberExpression.GetPlainString(); };
        void SetRepeatExpression(string repeatNumberExpression_) { repeatNumberExpression = GDExpression(repeatNumberExpression_); };

        virtual vector < vector<Instruction>* > GetAllConditionsVectors();
        virtual vector < vector<Instruction>* > GetAllActionsVectors();
        virtual vector < GDExpression* > GetAllExpressions();

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
        void Init(const RepeatEvent & event);

        GDExpression repeatNumberExpression;
        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;

        bool repeatNumberExpressionSelected;
};

#endif // REPEATEVENT_H

#endif
