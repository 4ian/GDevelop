/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LINKCOMMENT_H
#define LINKCOMMENT_H

#include <boost/shared_ptr.hpp>
#include "Event.h"

class LinkEvent : public BaseEvent
{
    public:
        LinkEvent(): BaseEvent() {};
        virtual ~LinkEvent() {};
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new LinkEvent(*this));}

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        string sceneLinked;
        int start;
        int end;

    private:
};

#endif // LINKCOMMENT_H
