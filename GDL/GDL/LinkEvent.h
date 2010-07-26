/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LINKCOMMENT_H
#define LINKCOMMENT_H
/*
#include <boost/shared_ptr.hpp>
#include <boost/serialization/vector.hpp>
#include <boost/serialization/shared_ptr.hpp>
#include <boost/serialization/nvp.hpp>*/
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

        #if defined(GDE)
        virtual void SaveToXml(TiXmlElement * eventElem) const;
        #endif
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        virtual void Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);

        string sceneLinked;
        int start;
        int end;

#if defined(GDE)
        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const;

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);
#endif

        friend class boost::serialization::access;

        /**
         * Serialize
         */
        template<class Archive>
        void serialize(Archive& ar, const unsigned int version){
            ar  & BOOST_SERIALIZATION_BASE_OBJECT_NVP(BaseEvent)
                & BOOST_SERIALIZATION_NVP(sceneLinked)
                & BOOST_SERIALIZATION_NVP(start)
                & BOOST_SERIALIZATION_NVP(end);
        }
};
/*BOOST_SERIALIZATION_SHARED_PTR(LinkEvent)
BOOST_CLASS_EXPORT_KEY(LinkEvent)*/

#endif // LINKCOMMENT_H
