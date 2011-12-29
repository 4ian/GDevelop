/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef LINKCOMMENT_H
#define LINKCOMMENT_H
#include "Event.h"
#include <vector>
class Game;
class RuntimeScene;
class Scene;
class MainEditorCommand;
class wxWindow;

/**
 * \brief Internal built-in LinkEvent, inserting events from another scene/external events.
 */
class LinkEvent : public BaseEvent
{
    public:
        LinkEvent(): BaseEvent(), start(std::string::npos), end(std::string::npos) {};
        virtual ~LinkEvent() {};
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new LinkEvent(*this));}

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        virtual void Preprocess(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);

        string sceneLinked;
        int start;
        int end;

        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);
};

#endif // LINKCOMMENT_H

#endif
