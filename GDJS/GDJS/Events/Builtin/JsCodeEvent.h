/** \file
 *  GDevelop
 *  2008-2016 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef JSCODEEVENT_H
#define JSCODEEVENT_H
#include "GDCore/Events/Event.h"
namespace gd { class Instruction; }
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
namespace gd { class SerializerElement; }
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }
namespace gd { class Layout; }
class wxWindow;

namespace gdjs
{

/**
 * \brief Event used to insert raw javascript code into events.
 */
class JsCodeEvent : public gd::BaseEvent
{
public:
    JsCodeEvent();
    virtual ~JsCodeEvent() {};

    virtual JsCodeEvent * Clone() const { return new JsCodeEvent(*this);}

    virtual bool IsExecutable() const {return true;}
    virtual bool CanHaveSubEvents() const {return false;}

    const gd::String & GetInlineCode() const { return inlineCode; };
    void SetInlineCode(const gd::String & code) { inlineCode = code; };

    gd::String GetParameterObjects() const { return parameterObjects; };
    void SetParameterObjects(gd::String objectName) { parameterObjects = objectName; };

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

private:
    void Init(const JsCodeEvent & event);

    gd::String inlineCode; ///< Contains the Javacript code of the event.
    gd::String parameterObjects; ///< Name of the (group of) objects to pass as parameter.
};

}

#endif // JSCODEEVENT_H
