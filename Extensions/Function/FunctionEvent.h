/**

Game Develop - Function Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef FUNCTIONEVENT_H
#define FUNCTIONEVENT_H
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/SceneNameMangler.h"
class RuntimeScene;
namespace gd { class Instruction; }
namespace gd { class SerializerElement; }
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }
namespace gd { class Layout; }
namespace gd { class MainFrameWrapper; }
class wxWindow;

/**
 * Function event is an event which is executed by an action ( This action can pass to the function parameters and objects concerned )
 * Functions are referenced in a (static) std::map so as to let action call them.
 */
class GD_EXTENSION_API FunctionEvent : public gd::BaseEvent
{
public:
    FunctionEvent();
    FunctionEvent(const FunctionEvent & event);
    virtual ~FunctionEvent() {};

    FunctionEvent& operator=(const FunctionEvent & event);
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new FunctionEvent(*this));}

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

    const std::string & GetObjectsPassedAsArgument() const { return objectsPassedAsArgument; };
    void SetObjectsPassedAsArgument(const std::string & objects) { objectsPassedAsArgument = objects; };

    virtual std::vector < std::vector<gd::Instruction>* > GetAllConditionsVectors();
    virtual std::vector < std::vector<gd::Instruction>* > GetAllActionsVectors();
    virtual std::vector < const std::vector<gd::Instruction>* > GetAllConditionsVectors() const;
    virtual std::vector < const std::vector<gd::Instruction>* > GetAllActionsVectors() const;

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

    /**
     * Tool function to generate an unique C++ name for a function.
     */
    static std::string MangleFunctionName(const FunctionEvent & functionEvent) { return "GDFunction"+gd::SceneNameMangler::GetMangledSceneName(functionEvent.GetName())+ToString(&functionEvent); };

    /**
     * Tool function to search for a function event in an event list.
     * \return NULL if the function was not found.
     */
    static const FunctionEvent* SearchForFunctionInEvents(const gd::EventsList & events, const std::string & functionName);

    static const std::string globalDeclaration;

private:
    void Init(const FunctionEvent & event);

    std::string name;
    std::string objectsPassedAsArgument;
    std::vector < gd::Instruction > conditions;
    std::vector < gd::Instruction > actions;
    gd::EventsList events;

    bool nameSelected;
};


#endif // FUNCTIONEVENT_H

#endif

