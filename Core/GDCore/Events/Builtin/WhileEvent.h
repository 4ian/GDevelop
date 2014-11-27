/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#ifndef GDCORE_WHILEEVENT_H
#define GDCORE_WHILEEVENT_H
#include "GDCore/Events/EventsList.h"
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
 * \brief While event is a standard event that is repeated while some conditions are true
 *
 * \note The platforms are required to warn the user about a possible infinite loop if the iteration count reach 100 000
 * and if HasInfiniteLoopWarning() returns true.
 */
class GD_CORE_API WhileEvent : public gd::BaseEvent
{
public:
    WhileEvent() : infiniteLoopWarning(true), justCreatedByTheUser(true) {};
    virtual ~WhileEvent() {};
    virtual gd::WhileEvent * Clone() const { return new WhileEvent(*this);}

    virtual bool IsExecutable() const {return true;}

    virtual bool CanHaveSubEvents() const {return true;}
    virtual const gd::EventsList & GetSubEvents() const {return events;};
    virtual gd::EventsList & GetSubEvents() {return events;};

    const std::vector < gd::Instruction > & GetConditions() const { return conditions; };
    std::vector < gd::Instruction > & GetConditions() { return conditions; };

    const std::vector < gd::Instruction > & GetActions() const { return actions; };
    std::vector < gd::Instruction > & GetActions() { return actions; };

    const std::vector < gd::Instruction > & GetWhileConditions() const { return whileConditions; };
    std::vector < gd::Instruction > & GetWhileConditions() { return whileConditions; };
    void SetWhileConditions(std::vector < gd::Instruction > & whileConditions_) { whileConditions = whileConditions_; };

    bool HasInfiniteLoopWarning() const { return infiniteLoopWarning; }

    virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
    virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();
    virtual std::vector < const std::vector<gd::Instruction>* > GetAllConditionsVectors() const;
    virtual std::vector < const std::vector<gd::Instruction>* > GetAllActionsVectors() const;

    virtual void SerializeTo(SerializerElement & element) const;
    virtual void UnserializeFrom(gd::Project & project, const SerializerElement & element);

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
    std::vector < gd::Instruction > whileConditions;
    std::vector < gd::Instruction > conditions;
    std::vector < gd::Instruction > actions;
    EventsList events;
    bool infiniteLoopWarning; ///< If true, code will be generated to warn the developer against an infinite loop.
    bool justCreatedByTheUser; ///< Used so as not to show message box to de/activate infinite loop warning when the user create the event

    mutable unsigned int whileConditionsHeight;

    int GetConditionsHeight() const;
    int GetActionsHeight() const;
    int GetWhileConditionsHeight() const;
};

}

#endif // GDCORE_WHILEEVENT_H
