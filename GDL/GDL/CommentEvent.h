/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COMMENTEVENT_H
#define COMMENTEVENT_H

#include <boost/shared_ptr.hpp>
#include <boost/serialization/vector.hpp>
#include <boost/serialization/shared_ptr.hpp>
#include <boost/serialization/nvp.hpp>
#include "Event.h"
class TiXmlElement;

#if defined(GDE)
class Scene;
class Game;
class MainEditorCommand;
class wxWindow;
#endif

class GD_API CommentEvent : public BaseEvent
{
    public:
        CommentEvent() : BaseEvent(), r(255), v(230), b(109) {};
        virtual ~CommentEvent() {};
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new CommentEvent(*this));}

        void SaveToXml(TiXmlElement * eventElem) const;
        void LoadFromXml(const TiXmlElement * eventElem);

        int r;
        int v;
        int b;

        string com1;
        string com2;

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
                & BOOST_SERIALIZATION_NVP(r)
                & BOOST_SERIALIZATION_NVP(v)
                & BOOST_SERIALIZATION_NVP(b)
                & BOOST_SERIALIZATION_NVP(com1)
                & BOOST_SERIALIZATION_NVP(com2);
        }
};
BOOST_SERIALIZATION_SHARED_PTR(CommentEvent)
BOOST_CLASS_EXPORT_KEY(CommentEvent)

#endif // COMMENTEVENT_H
