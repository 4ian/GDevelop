/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_LINKEVENT_H
#define GDCORE_LINKEVENT_H
#include "GDCore/Events/Event.h"
#include "GDCore/String.h"

namespace gd
{

/**
 * \brief A link pointing to external events (or events of another layout) that should be included
 * and run instead of the link.
 */
class GD_CORE_API LinkEvent : public gd::BaseEvent
{
public:
    LinkEvent() : BaseEvent(), includeAll(true), includeStart(gd::String::npos), includeEnd(gd::String::npos), linkWasInvalid(false) {};
    virtual ~LinkEvent();
    virtual gd::LinkEvent * Clone() const { return new LinkEvent(*this);}

    /**
     * Get the link target (i.e. the scene or external events the link refers to).
     */
    const gd::String & GetTarget() const { return target; };

    /**
     * Change the link target (i.e. the scene or external events the link refers to).
     */
    void SetTarget(const gd::String & target_) { target = target_; };

    /**
     * Return true if the link event must include all the events of the target.
     */
    bool IncludeAllEvents() const { return includeAll; };

    /**
     * Return true if the link event must include all the events of the target.
     */
    void SetIncludeAllEvents(bool includeAllEvents) { includeAll = includeAllEvents; };

    /**
     * Set the number of the first and last event to be included ( Meaningful only if includeAll was set to false, see SetIncludeAllEvents )
     */
    void SetIncludeStartAndEnd(std::size_t includeStart_, std::size_t includeEnd_) { includeStart = includeStart_; includeEnd = includeEnd_;  };

    /**
     * Get the number of the first event to be included. (Meaningful only if includeAll was set to false, see SetIncludeAllEvents)
     */
    std::size_t GetIncludeStart() const { return includeStart; };

    /**
     * Get the number of the last event to be included. (Meaningful only if includeAll was set to false, see SetIncludeAllEvents)
     */
    std::size_t GetIncludeEnd() const { return includeEnd; };

    /**
     * The link event must always be preprocessed.
     */
    virtual bool MustBePreprocessed() { return true;}

    /**
     * \brief Get a pointer to the list of events that are targeted by the link.
     *
     * @param project The project containing the link.
     * @return NULL if nothing is found or a pointer to the list of events being linked.
     */
    const EventsList * GetLinkedEvents(const gd::Project & project) const;

    /**
     * \brief Replace the link in the events list by the linked events.
     * When implementing a platform with a link event, you should call this function when preprocessing the events
     * (See gd::EventMetadata::codeGeneration).
     */
    void ReplaceLinkByLinkedEvents(gd::Project & project, EventsList & eventList, std::size_t indexOfTheEventInThisList);

    virtual bool IsExecutable() const { return true; };

    /**
     * Called by event editor to draw the event.
     */
    virtual void Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * Must return the height of the event when rendered
     */
    virtual unsigned int GetRenderedHeight(unsigned int width, const gd::Platform & platform) const;

    virtual EditEventReturnType EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_);

    virtual void SerializeTo(SerializerElement & element) const;
    virtual void UnserializeFrom(gd::Project & project, const SerializerElement & element);

private:
    gd::String target; ///< The name of the external events (or scene) to be included
    bool includeAll; ///< If set to true, all the events of the target should be included
    std::size_t includeStart; ///< If includeAll is set to false, represents the number of the first event of the target to included.
    std::size_t includeEnd; ///< If includeAll is set to false, represents the number of the last event of the target to included.
    bool linkWasInvalid; ///< Set to true by Preprocess if the links was invalid the last time is was processed. Used to display a warning in the events editor.
};

}

#endif // GDCORE_LINKEVENT_H
