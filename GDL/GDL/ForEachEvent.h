/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef FOREACHEVENT_H
#define FOREACHEVENT_H
#include "GDCore/Events/Event.h"
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
        virtual std::string GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        virtual bool CanHaveSubEvents() const {return true;}
        virtual const std::vector < BaseEventSPtr > & GetSubEvents() const {return events;};
        virtual std::vector < BaseEventSPtr > & GetSubEvents() {return events;};
        void SetSubEvents(std::vector < BaseEventSPtr > & subEvents_) {events = subEvents_;};

        const std::vector < Instruction > & GetConditions() const { return conditions; };
        std::vector < Instruction > & GetConditions() { return conditions; };
        void SetConditions(std::vector < Instruction > & conditions_) { conditions = conditions_; };

        const std::vector < Instruction > & GetActions() const { return actions; };
        std::vector < Instruction > & GetActions() { return actions; };
        void SetActions(std::vector < Instruction > & actions_) { actions = actions_; };

        std::string GetObjectToPick() const { return objectsToPick.GetPlainString(); };
        std::string GetObjectToPick() { return objectsToPick.GetPlainString(); };
        void SetObjectToPick(std::string objectsToPick_) { objectsToPick = GDExpression(objectsToPick_); };

        virtual std::vector < std::vector<Instruction>* > GetAllConditionsVectors();
        virtual std::vector < std::vector<Instruction>* > GetAllActionsVectors();
        virtual std::vector < GDExpression* > GetAllExpressions();

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
        void Init(const ForEachEvent & event);

        GDExpression objectsToPick;
        std::vector < Instruction > conditions;
        std::vector < Instruction > actions;
        std::vector < BaseEventSPtr > events;

        bool objectsToPickSelected;
};


#endif // FOREACHEVENT_H

#endif
