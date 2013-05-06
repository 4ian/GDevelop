/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_STANDARDEVENT_H
#define GDCORE_STANDARDEVENT_H
#include <wx/bitmap.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include "GDCore/Events/Event.h"
namespace gd { class Instruction; }
namespace gd { class Project; }
class RuntimeScene;
class TiXmlElement;
class EventsCodeGenerationContext;
class EventsEditorItemsAreas;
class EventsEditorSelection;

namespace gd
{

/**
 * \brief Standard event, with conditions, actions and support for sub events.
 */
class GD_CORE_API StandardEvent : public gd::BaseEvent
{
public:
    StandardEvent();
    StandardEvent(const StandardEvent & event);
    virtual ~StandardEvent();

    StandardEvent& operator=(const StandardEvent & event);
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new StandardEvent(*this));}

    virtual bool IsExecutable() const {return true;}

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

    virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
    virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();

    virtual void SaveToXml(TiXmlElement * eventElem) const;
    virtual void LoadFromXml(gd::Project & project, const TiXmlElement * eventElem);

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width, const gd::Platform & platform) const;

private:
    void Init(const StandardEvent & event);

    std::vector < gd::Instruction > conditions;
    std::vector < gd::Instruction > actions;
    std::vector < gd::BaseEventSPtr > events;
};

}

#endif // GDCORE_STANDARDEVENT_H
