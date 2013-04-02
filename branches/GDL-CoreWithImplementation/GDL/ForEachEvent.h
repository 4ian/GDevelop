/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef FOREACHEVENT_H
#define FOREACHEVENT_H
#include "GDCore/Events/Event.h"
class RuntimeScene;
namespace gd { class Instruction; }
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;
class Scene;
class wxWindow;

/**
 * \brief Builtin internal event that pick an object of a list each time it is repeated
 */
class ForEachEvent : public gd::BaseEvent
{
    public:
        ForEachEvent();
        ForEachEvent(const ForEachEvent & event);
        virtual ~ForEachEvent() {};

        ForEachEvent& operator=(const ForEachEvent & event);
        virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new ForEachEvent(*this));}

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

        std::string GetObjectToPick() const { return objectsToPick.GetPlainString(); };
        std::string GetObjectToPick() { return objectsToPick.GetPlainString(); };
        void SetObjectToPick(std::string objectsToPick_) { objectsToPick = gd::Expression(objectsToPick_); };

        virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
        virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();
        virtual std::vector < gd::Expression* > GetAllExpressions();

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(gd::Project & project, const TiXmlElement * eventElem);

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
        void Init(const ForEachEvent & event);

        gd::Expression objectsToPick;
        std::vector < gd::Instruction > conditions;
        std::vector < gd::Instruction > actions;
        std::vector < gd::BaseEventSPtr > events;

        bool objectsToPickSelected;
};


#endif // FOREACHEVENT_H

#endif

