/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/Events/Event.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"

namespace gd
{

std::vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent() :
folded(false),
eventHeightNeedUpdate(true),
totalTimeDuringLastSession(0),
percentDuringLastSession(0),
disabled(false)
{
}

std::string BaseEvent::GenerateEventCode(gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
{
    if ( IsDisabled() ) return "";

    try
    {
        if ( type.empty() ) return "";

        const gd::Platform & platform = codeGenerator.GetPlatform();

        //First try to guess the extension used
        std::string eventNamespace = type.substr(0, type.find("::"));
        boost::shared_ptr<gd::PlatformExtension> guessedExtension = platform.GetExtension(eventNamespace);
        if ( guessedExtension )
        {
            std::map<std::string, gd::EventMetadata > & allEvents = guessedExtension->GetAllEvents();
            if ( allEvents.find(type) != allEvents.end() && allEvents[type].codeGeneration )
                return allEvents[type].codeGeneration->Generate(*this, codeGenerator, context);
        }


        //Else make a search in all the extensions
        for (unsigned int i = 0;i<platform.GetAllPlatformExtensions().size();++i)
        {
            boost::shared_ptr<gd::PlatformExtension> extension = platform.GetAllPlatformExtensions()[i];
            if ( !extension ) continue;

            std::map<std::string, gd::EventMetadata > & allEvents = extension->GetAllEvents();
            if ( allEvents.find(type) != allEvents.end() && allEvents[type].codeGeneration )
                return allEvents[type].codeGeneration->Generate(*this, codeGenerator, context);
        }
    }
    catch(...)
    {
        std::cout << "ERROR: Exception caught during code generation for event \"" << type <<"\"." << std::endl;
    }

    return "";
}

void BaseEvent::Preprocess(gd::EventsCodeGenerator & codeGenerator, std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    if ( IsDisabled() || !MustBePreprocessed() ) return;

    try
    {
        if ( type.empty() ) return;

        const gd::Platform & platform = codeGenerator.GetPlatform();

        //First try to guess the extension used
        std::string eventNamespace = type.substr(0, type.find("::"));
        boost::shared_ptr<gd::PlatformExtension> guessedExtension = platform.GetExtension(eventNamespace);
        if ( guessedExtension )
        {
            std::map<std::string, gd::EventMetadata > & allEvents = guessedExtension->GetAllEvents();
            if ( allEvents.find(type) != allEvents.end() && allEvents[type].codeGeneration )
                return allEvents[type].codeGeneration->Preprocess(*this, codeGenerator, eventList, indexOfTheEventInThisList);
        }


        //Else make a search in all the extensions
        for (unsigned int i = 0;i<platform.GetAllPlatformExtensions().size();++i)
        {
            boost::shared_ptr<gd::PlatformExtension> extension = platform.GetAllPlatformExtensions()[i];
            if ( !extension ) continue;

            std::map<std::string, gd::EventMetadata > & allEvents = extension->GetAllEvents();
            if ( allEvents.find(type) != allEvents.end() && allEvents[type].codeGeneration )
                return allEvents[type].codeGeneration->Preprocess(*this, codeGenerator, eventList, indexOfTheEventInThisList);
        }
    }
    catch(...)
    {
        std::cout << "ERROR: Exception caught during preprocessing of event \"" << type <<"\"." << std::endl;
    }
}

std::vector < gd::BaseEventSPtr > GD_CORE_API CloneVectorOfEvents(const std::vector < gd::BaseEventSPtr > & events)
{
    std::vector < gd::BaseEventSPtr > newVector;

    std::vector<BaseEventSPtr>::const_iterator e = events.begin();
    std::vector<BaseEventSPtr>::const_iterator end = events.end();

    for(;e != end;++e)
    {
        //Profiling can be enabled
        newVector.push_back(CloneRememberingOriginalEvent(*e));
    }

    return newVector;
}

BaseEventSPtr GD_CORE_API CloneRememberingOriginalEvent(gd::BaseEventSPtr event)
{
    gd::BaseEventSPtr copy = event->Clone();
    //Original event is either the original event of the copied event, or the event copied.
    copy->originalEvent = event->originalEvent.expired() ? event : event->originalEvent;

    return copy;
}

}
