/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include <boost/algorithm/string.hpp>
#include <boost/weak_ptr.hpp>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/LinkEvent.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/IDE/EventsChangesNotifier.h"

namespace gd
{

void EventsChangesNotifier::NotifyChangesInEventsOfScene(gd::Project & project, gd::Layout & layout)
{
    project.GetChangesNotifier().OnEventsModified(project, layout);

    //Notify others scenes, which include the changed scene ( even indirectly ), that their events has changed
    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        if ( &project.GetLayout(i) == &layout ) continue;

        std::vector< gd::Layout* > linkedScenes;
        std::vector< gd::ExternalEvents * > linkedExternalEvents;

        GetScenesAndExternalEventsLinkedTo(project.GetLayout(i).GetEvents(), project, linkedScenes, linkedExternalEvents);

        for (unsigned int j = 0;j<linkedScenes.size();++j)
        {
            if ( linkedScenes[j]->GetName() == layout.GetName() )
                project.GetChangesNotifier().OnEventsModified(project, project.GetLayout(i), /*indirectChange=*/true, layout.GetName());
        }
    }
    //Also notify external events
    for (unsigned int i = 0;i<project.GetExternalEventsCount();++i)
    {
        std::vector< gd::Layout* > linkedScenes;
        std::vector< gd::ExternalEvents * > linkedExternalEvents;

        GetScenesAndExternalEventsLinkedTo(project.GetExternalEvents(i).GetEvents(), project, linkedScenes, linkedExternalEvents);

        for (unsigned int j = 0;j<linkedScenes.size();++j)
        {
            if ( linkedScenes[j]->GetName() == layout.GetName() )
                project.GetChangesNotifier().OnEventsModified(project, project.GetExternalEvents(i), /*indirectChange=*/true, layout.GetName());
        }
    }
}

void EventsChangesNotifier::NotifyChangesInEventsOfExternalEvents(gd::Project & project, gd::ExternalEvents & externalEvents)
{
    project.GetChangesNotifier().OnEventsModified(project, externalEvents);

    //Notify scenes, which include the external events ( even indirectly ), that their events has changed
    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        std::vector< gd::Layout* > notUsed;
        std::vector< gd::ExternalEvents * > linkedExternalEvents;

        GetScenesAndExternalEventsLinkedTo(project.GetLayout(i).GetEvents(), project, notUsed, linkedExternalEvents);

        for (unsigned int j = 0;j<linkedExternalEvents.size();++j)
        {
            if ( linkedExternalEvents[j]->GetName() == externalEvents.GetName() )
                project.GetChangesNotifier().OnEventsModified(project, project.GetLayout(i), /*indirectChange=*/true, externalEvents.GetName());
        }
    }
    //Also notify external events
    for (unsigned int i = 0;i<project.GetExternalEventsCount();++i)
    {
        std::vector< gd::Layout* > linkedScenes;
        std::vector< gd::ExternalEvents * > linkedExternalEvents;

        GetScenesAndExternalEventsLinkedTo(project.GetExternalEvents(i).GetEvents(), project, linkedScenes, linkedExternalEvents);

        for (unsigned int j = 0;j<linkedScenes.size();++j)
        {
            if ( linkedScenes[j]->GetName() == externalEvents.GetName() )
                project.GetChangesNotifier().OnEventsModified(project, project.GetExternalEvents(i), /*indirectChange=*/true, externalEvents.GetName());
        }
    }
}

void EventsChangesNotifier::GetScenesAndExternalEventsLinkedTo(const std::vector< boost::shared_ptr<gd::BaseEvent> > & events,
                                                          gd::Project & project,
                                                          std::vector< gd::Layout * > & layouts,
                                                          std::vector< gd::ExternalEvents * > & externalEvents)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        boost::shared_ptr<gd::LinkEvent> linkEvent = boost::dynamic_pointer_cast<gd::LinkEvent>(events[i]);
        if ( linkEvent != boost::shared_ptr<LinkEvent>() )
        {
            //We've got a link event, search now linked scene/external events
            if ( project.HasExternalEventsNamed(linkEvent->GetTarget()) )
            {
                gd::ExternalEvents & linkedExternalEvents = project.GetExternalEvents(linkEvent->GetTarget());

                //Protect against circular references
                if ( find(externalEvents.begin(), externalEvents.end(), &linkedExternalEvents) == externalEvents.end() )
                {
                    externalEvents.push_back(&linkedExternalEvents);
                    GetScenesAndExternalEventsLinkedTo(linkedExternalEvents.GetEvents(), project, layouts, externalEvents);
                }
            }
            else if ( project.HasLayoutNamed(linkEvent->GetTarget()) )
            {
                gd::Layout & linkedLayout = project.GetLayout(linkEvent->GetTarget());

                //Protect against circular references
                if ( find(layouts.begin(), layouts.end(), &linkedLayout) == layouts.end() )
                {
                    layouts.push_back(&linkedLayout);
                    GetScenesAndExternalEventsLinkedTo(linkedLayout.GetEvents(), project, layouts, externalEvents);
                }
            }
        }

        if ( events[i]->CanHaveSubEvents() )
            GetScenesAndExternalEventsLinkedTo(events[i]->GetSubEvents(), project, layouts, externalEvents);
    }
}

}
