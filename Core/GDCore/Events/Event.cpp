/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"

namespace gd
{

EventsList BaseEvent::badSubEvents;

BaseEvent::BaseEvent() :
folded(false),
eventHeightNeedUpdate(true),
totalTimeDuringLastSession(0),
percentDuringLastSession(0),
disabled(false)
{
}

bool BaseEvent::HasSubEvents() const
{
    return !GetSubEvents().IsEmpty();
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

void BaseEvent::Preprocess(gd::EventsCodeGenerator & codeGenerator, gd::EventsList & eventList, unsigned int indexOfTheEventInThisList)
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

BaseEventSPtr GD_CORE_API CloneRememberingOriginalEvent(BaseEventSPtr event)
{
    gd::BaseEventSPtr copy = event->Clone();
    //Original event is either the original event of the copied event, or the event copied.
    copy->originalEvent = event->originalEvent.expired() ? event : event->originalEvent;

    return copy;
}

}
