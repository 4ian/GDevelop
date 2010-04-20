/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LINKCOMMENT_H
#define LINKCOMMENT_H

#include <boost/shared_ptr.hpp>
#include "Event.h"
#include <vector>
class Game;
class RuntimeScene;

#if defined(GDE)
class Scene;
class MainEditorCommand;
class wxWindow;
#endif

class LinkEvent : public BaseEvent
{
    public:
        LinkEvent(): BaseEvent(), start(0), end(0) {};
        virtual ~LinkEvent() {};
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new LinkEvent(*this));}

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        virtual void Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);

        string sceneLinked;
        int start;
        int end;

#if defined(GDE)
        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);
#endif

    private:
#ifdef GDE
        virtual void RenderInBitmap() const;
        unsigned int CalculateNecessaryHeight() const;
#endif
};

#endif // LINKCOMMENT_H
