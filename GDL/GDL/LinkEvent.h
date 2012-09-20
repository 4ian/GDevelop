/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#ifndef LINKCOMMENT_H
#define LINKCOMMENT_H
#include "GDCore/Events/LinkEvent.h"
#include <vector>
class Game;
class RuntimeScene;
class Scene;
namespace gd { class MainFrameWrapper; }
class wxWindow;

/**
 * \brief Internal built-in LinkEvent, inserting events from another scene/external events.
 */
class LinkEvent : public gd::LinkEvent
{
public:
    LinkEvent(): gd::LinkEvent() {};
    virtual ~LinkEvent() {};
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new LinkEvent(*this));}

    virtual void SaveToXml(TiXmlElement * eventElem) const;
    virtual void LoadFromXml(const TiXmlElement * eventElem);

    virtual void Preprocess(const Game & game, const Scene & scene, std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width) const;

    virtual EditEventReturnType EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_);
};

#endif // LINKCOMMENT_H

#endif

