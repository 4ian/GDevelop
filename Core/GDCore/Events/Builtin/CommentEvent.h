/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef COMMENTEVENT_H
#define COMMENTEVENT_H

#include "GDCore/Events/Event.h"
class TiXmlElement;
namespace gd { class Layout; }
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
class wxWindow;
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }

namespace gd
{

/**
 * \brief Allows to add a text in the events editor.
 */
class GD_CORE_API CommentEvent : public gd::BaseEvent
{
public:
    CommentEvent() : BaseEvent(), r(255), v(230), b(109), textR(0), textG(0), textB(0) {};
    virtual ~CommentEvent() {};
    virtual gd::BaseEvent * Clone() const { return new CommentEvent(*this);}

    virtual void SerializeTo(SerializerElement & element) const;
    virtual void UnserializeFrom(gd::Project & project, const SerializerElement & element);

    int r; ///< Background color Red component
    int v; ///< Background color Green component
    int b; ///< Background color Blue component

    int textR; ///< Text color Red component
    int textG; ///< Text color Green component
    int textB; ///< Text color Blue component

    std::string com1; ///< Comment std::string
    std::string com2; ///< Optional second comment std::string

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & );

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width, const gd::Platform & ) const;

    virtual EditEventReturnType EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_);
};

}

#endif // COMMENTEVENT_H
