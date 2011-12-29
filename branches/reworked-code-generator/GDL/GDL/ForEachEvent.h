/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef FOREACHEVENT_H
#define FOREACHEVENT_H
#include "Event.h"
class RuntimeScene;
class Instruction;
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;
class Scene;
class MainEditorCommand;
class wxWindow;

/**
 * \brief Builtin internal event that pick an object of a list each time it is repeated
 */
class ForEachEvent : public BaseEvent
{
    public:
        ForEachEvent();
        ForEachEvent(const ForEachEvent & event);
        virtual ~ForEachEvent() {};

        ForEachEvent& operator=(const ForEachEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new ForEachEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual std::string GenerateEventCode(const Game & game, const Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

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

        string GetObjectToPick() const { return objectsToPick.GetPlainString(); };
        string GetObjectToPick() { return objectsToPick.GetPlainString(); };
        void SetObjectToPick(string objectsToPick_) { objectsToPick = GDExpression(objectsToPick_); };

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
        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);

    private:
        void Init(const ForEachEvent & event);

        GDExpression objectsToPick;
        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;

        bool objectsToPickSelected;
};


#endif // FOREACHEVENT_H

#endif
