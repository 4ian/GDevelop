/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#ifndef LINKCOMMENT_H
#define LINKCOMMENT_H
#include "GDCore/Events/LinkEvent.h"
#include <vector>
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
namespace gd { class Project; }
class RuntimeScene;
namespace gd { class Layout; }
class wxWindow;

/**
 * \brief Internal built-in LinkEvent, inserting events from another scene/external events.
 */
class LinkEvent : public gd::LinkEvent
{
public:
    LinkEvent(): gd::LinkEvent(), linkWasInvalid(false) {};
    virtual ~LinkEvent() {};
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new LinkEvent(*this));}

    virtual void SaveToXml(TiXmlElement * eventElem) const;
    virtual void LoadFromXml(gd::Project & project, const TiXmlElement * eventElem);

    virtual bool IsExecutable() const { return true; };
    virtual void Preprocess(gd::Project & project, gd::Layout & scene, std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);
    virtual std::string GenerateEventCode(gd::Layout & scene, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext);

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width, const gd::Platform & platform) const;

    virtual EditEventReturnType EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_);

    bool linkWasInvalid; ///< Set to true by Preprocess if the links was invalid the last time is was processed. Used to display a warning in the events editor.
};

#endif // LINKCOMMENT_H

#endif

