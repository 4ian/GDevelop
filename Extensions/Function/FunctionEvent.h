/**

GDevelop - Function Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)

#ifndef FUNCTIONEVENT_H
#define FUNCTIONEVENT_H
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/SceneNameMangler.h"
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
    virtual ~FunctionEvent() {};
    virtual FunctionEvent * Clone() const { return new FunctionEvent(*this);}

    virtual bool IsExecutable() const {return true;}

    virtual bool CanHaveSubEvents() const {return true;}
    virtual const gd::EventsList & GetSubEvents() const {return events;};
    virtual gd::EventsList & GetSubEvents() {return events;};

    const gd::InstructionsList & GetConditions() const { return conditions; };
    gd::InstructionsList & GetConditions() { return conditions; };

    const gd::InstructionsList & GetActions() const { return actions; };
    gd::InstructionsList & GetActions() { return actions; };

    gd::String GetName() const { return name; };
    void SetName(gd::String name_) { name = name_; };

    const gd::String & GetObjectsPassedAsArgument() const { return objectsPassedAsArgument; };
    void SetObjectsPassedAsArgument(const gd::String & objects) { objectsPassedAsArgument = objects; };

    virtual std::vector < gd::InstructionsList* > GetAllConditionsVectors();
    virtual std::vector < gd::InstructionsList* > GetAllActionsVectors();
    virtual std::vector < const gd::InstructionsList* > GetAllConditionsVectors() const;
    virtual std::vector < const gd::InstructionsList* > GetAllActionsVectors() const;

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
     * \brief Tool function to generate an unique C++ name for a function used
     * inside a layout.
     */
    static gd::String MangleFunctionName(const gd::Layout & layout, const FunctionEvent & functionEvent);

    /**
     * \brief Tool function to search for a function event in an event list.
     * \return NULL if the function was not found.
     */
    static const FunctionEvent* SearchForFunctionInEvents(const gd::Project & project, const gd::EventsList & events, const gd::String & functionName);

private:
    gd::String name;
    gd::String objectsPassedAsArgument;
    gd::InstructionsList conditions;
    gd::InstructionsList actions;
    gd::EventsList events;

    bool nameSelected;
};


#endif // FUNCTIONEVENT_H

#endif

