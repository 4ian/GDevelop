/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY)
#include "GDCore/CommonTools.h"
#include "EventsCodeNameMangler.h"
#include <string>

EventsCodeNameMangler *EventsCodeNameMangler::_singleton = NULL;

std::string EventsCodeNameMangler::GetMangledObjectsListName(const std::string & originalObjectName)
{
    std::string partiallyMangledName = originalObjectName;
    static const std::string allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letter by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(partiallyMangledName[i]) == std::string::npos)
        {
            char unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+gd::ToString(int(unallowedChar)));
        }
    }

    return "GD"+partiallyMangledName+"Objects";
}

std::string EventsCodeNameMangler::GetExternalEventsFunctionMangledName(const std::string & externalEventsName)
{
    std::string partiallyMangledName = externalEventsName;
    static const std::string allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letter by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(partiallyMangledName[i]) == std::string::npos)
        {
            char unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+gd::ToString(int(unallowedChar)));
        }
    }

    return "GDExternalEvents"+partiallyMangledName;
}

std::string ManObjListName(const std::string & objectName)
{
    return EventsCodeNameMangler::Get()->GetMangledObjectsListName(objectName);
}

EventsCodeNameMangler * EventsCodeNameMangler::Get()
{
    if ( NULL == _singleton )
        _singleton = new EventsCodeNameMangler;

    return ( static_cast<EventsCodeNameMangler*>( _singleton ) );
}

void EventsCodeNameMangler::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}

#endif
