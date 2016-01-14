/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "GDCore/CommonTools.h"
#include "EventsCodeNameMangler.h"
#include "GDCore/String.h"

EventsCodeNameMangler *EventsCodeNameMangler::_singleton = NULL;

gd::String EventsCodeNameMangler::GetMangledObjectsListName(const gd::String & originalObjectName)
{
    gd::String partiallyMangledName = originalObjectName;
    static const gd::String allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letter by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(std::u32string(1, partiallyMangledName[i])) == gd::String::npos)
        {
            char32_t unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+gd::String::From(unallowedChar));
        }
    }

    return "GD"+partiallyMangledName+"Objects";
}

gd::String EventsCodeNameMangler::GetExternalEventsFunctionMangledName(const gd::String & externalEventsName)
{
    gd::String partiallyMangledName = externalEventsName;
    static const gd::String allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letter by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(std::u32string(1, partiallyMangledName[i])) == gd::String::npos)
        {
            char32_t unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+gd::String::From(unallowedChar));
        }
    }

    return "GDExternalEvents"+partiallyMangledName;
}

gd::String ManObjListName(const gd::String & objectName)
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
