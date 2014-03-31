/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_REPEATEVENT_H
#define GDCORE_REPEATEVENT_H
#include "GDCore/Events/Event.h"
namespace gd { class Instruction; }
namespace gd { class Project; }
class RuntimeScene;
class TiXmlElement;
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }

namespace gd
{

/**
 * \brief Event being repeated a specified number of times.
 */
class GD_CORE_API RepeatEvent : public gd::BaseEvent
{
public:
    RepeatEvent();
    RepeatEvent(const RepeatEvent & event);
    virtual ~RepeatEvent() {};

    RepeatEvent& operator=(const RepeatEvent & event);
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new RepeatEvent(*this));}

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

    std::string GetRepeatExpression() const { return repeatNumberExpression.GetPlainString(); };
    std::string GetRepeatExpression() { return repeatNumberExpression.GetPlainString(); };
    void SetRepeatExpression(std::string repeatNumberExpression_) { repeatNumberExpression = gd::Expression(repeatNumberExpression_); };

    virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
    virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();
    virtual std::vector < gd::Expression* > GetAllExpressions();

    virtual void SaveToXml(TiXmlElement * eventElem) const;
    virtual void LoadFromXml(gd::Project & project, const TiXmlElement * eventElem);

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width, const gd::Platform & platform) const;

    /**
     * Called when the user want to edit the event
     */
    virtual EditEventReturnType EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_);

private:
    void Init(const RepeatEvent & event);

    gd::Expression repeatNumberExpression;
    std::vector < gd::Instruction > conditions;
    std::vector < gd::Instruction > actions;
    std::vector < gd::BaseEventSPtr > events;

    bool repeatNumberExpressionSelected;
};

}

#endif // GDCORE_REPEATEVENT_H
