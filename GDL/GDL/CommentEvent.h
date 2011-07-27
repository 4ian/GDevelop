/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COMMENTEVENT_H
#define COMMENTEVENT_H

#include "Event.h"
class TiXmlElement;
#if defined(GD_IDE_ONLY)
class Scene;
class Game;
class MainEditorCommand;
class wxWindow;
#endif

/**
 * \brief Internal builtin Comment Event, allowing to add a simple text in events.
 */
class GD_API CommentEvent : public BaseEvent
{
    public:
        CommentEvent() : BaseEvent(), r(255), v(230), b(109), textR(0), textG(0), textB(0) {};
        virtual ~CommentEvent() {};
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new CommentEvent(*this));}

        #if defined(GD_IDE_ONLY)
        void SaveToXml(TiXmlElement * eventElem) const;
        #endif
        void LoadFromXml(const TiXmlElement * eventElem);

        int r; ///< Background color Red component
        int v; ///< Background color Green component
        int b; ///< Background color Blue component

        int textR; ///< Text color Red component
        int textG; ///< Text color Green component
        int textB; ///< Text color Blue component

        string com1; ///< Comment string
        string com2; ///< Optional second comment string

#if defined(GD_IDE_ONLY)
        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxDC & dc, int x, int y, unsigned int width) const;

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);
#endif
};

#endif // COMMENTEVENT_H
