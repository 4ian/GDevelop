/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY)
#ifndef GDCORE_GROUPEVENT_H
#define GDCORE_GROUPEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/EventsList.h"
namespace gd { class Instruction; }
namespace gd { class Project; }
class RuntimeScene;
class TiXmlElement;
class EventsCodeGenerationContext;
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }

namespace gd
{

/**
 * \brief A group event, containing only sub events and some (visual only) properties.
 */
class GD_CORE_API GroupEvent : public gd::BaseEvent
{
public:
    GroupEvent();
    virtual ~GroupEvent() {};
    virtual gd::BaseEvent * Clone() const { return new GroupEvent(*this);}

    virtual bool IsExecutable() const {return true;}

    /**
     * \brief Get the name of the group.
     */
    const std::string & GetName() const { return name; }

    /**
     * \brief Change the name of the group.
     */
    void SetName(const std::string & name_) { name = name_; }

    /**
     * \brief Change the color of the group
     */
    void SetBackgroundColor(unsigned int colorR, unsigned int colorG, unsigned int colorB);

    /**
     * \brief Get background color red component.
     */
    unsigned int getBackgroundColorR() const { return colorR; };

    /**
     * \brief Get background color green component.
     */
    unsigned int getBackgroundColorG() const { return colorG; };

    /**
     * \brief Get background color blue component.
     */
    unsigned int getBackgroundColorB() const { return colorB; };

    virtual bool CanHaveSubEvents() const {return true;}
    virtual const gd::EventsList & GetSubEvents() const {return events;};
    virtual gd::EventsList & GetSubEvents() {return events;};

    virtual void SerializeTo(SerializerElement & element) const;
    virtual void UnserializeFrom(gd::Project & project, const SerializerElement & element);

    virtual gd::BaseEvent::EditEventReturnType EditEvent(wxWindow* parent_, gd::Project & project, gd::Layout & scene, gd::MainFrameWrapper & mainFrameWrapper);

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width, const gd::Platform & platform) const;

private:
    EventsList events;

    std::string name;
    unsigned int colorR;
    unsigned int colorG;
    unsigned int colorB;
};

}

#endif // GDCORE_GROUPEVENT_H
#endif
