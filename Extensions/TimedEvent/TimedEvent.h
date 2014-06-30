/**

Game Develop - Timed Event Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#if defined(GD_IDE_ONLY)

#ifndef TIMEDEVENT_H
#define TIMEDEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include <map>
#include "GDCpp/ManualTimer.h"
class RuntimeScene;
namespace gd { class Instruction; }
namespace gd { class SerializerElement; }
class EventsCodeGenerationContext;
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }
namespace gd { class Layout; }
namespace gd { class MainFrameWrapper; }
class wxWindow;

/**
 * Timed event
 */
class GD_EXTENSION_API TimedEvent : public gd::BaseEvent
{
public:
    TimedEvent();
    TimedEvent(const TimedEvent & event);
    virtual ~TimedEvent();

    TimedEvent& operator=(const TimedEvent & event);
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new TimedEvent(*this));}

    virtual bool IsExecutable() const {return true;}

    virtual bool CanHaveSubEvents() const {return true;}
    virtual const gd::EventsList & GetSubEvents() const {return events;};
    virtual gd::EventsList & GetSubEvents() {return events;};

    const std::vector < gd::Instruction > & GetConditions() const { return conditions; };
    std::vector < gd::Instruction > & GetConditions() { return conditions; };
    void SetConditions(std::vector < gd::Instruction > & conditions_) { conditions = conditions_; };

    const std::vector < gd::Instruction > & GetActions() const { return actions; };
    std::vector < gd::Instruction > & GetActions() { return actions; };
    void SetActions(std::vector < gd::Instruction > & actions_) { actions = actions_; };

    std::string GetName() const { return name; };
    void SetName(std::string name_) { name = name_; };

    std::string GetTimeoutExpression() const { return timeout.GetPlainString(); };
    void SetTimeoutExpression(std::string timeout_) { timeout = gd::Expression(timeout_); };

    virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
    virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();
    virtual std::vector < gd::Expression* > GetAllExpressions();
    virtual std::vector < const std::vector<gd::Instruction>* > GetAllConditionsVectors() const;
    virtual std::vector < const std::vector<gd::Instruction>* > GetAllActionsVectors() const;
    virtual std::vector < const gd::Expression* > GetAllExpressions() const;

    virtual void SerializeTo(gd::SerializerElement & element) const;
    virtual void UnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
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

    static std::vector< TimedEvent* > codeGenerationCurrentParents;
    std::vector< TimedEvent* > codeGenerationChildren;

private:
    void Init(const TimedEvent & event);

    std::string name;
    gd::Expression timeout;
    std::vector < gd::Instruction > conditions;
    std::vector < gd::Instruction > actions;
    gd::EventsList events;

    bool nameSelected;
};

#endif // TIMEDEVENT_H

#endif

