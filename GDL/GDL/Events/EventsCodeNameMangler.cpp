/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include "GDL/CommonTools.h"
#include "EventsCodeNameMangler.h"
#include <string>

EventsCodeNameMangler *EventsCodeNameMangler::_singleton = NULL;

std::string EventsCodeNameMangler::GetMangledObjectsListName(const std::string & originalObjectName)
{
    std::string partiallyMangledName = originalObjectName;
    static const std::string allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letter by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(partiallyMangledName[i]) == std::string::npos)
        {
            char unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+ToString(int(unallowedChar)));
        }
    }

    return "GD"+partiallyMangledName+"Objects";
}

std::string ManObjListName(const std::string & objectName)
{
    return EventsCodeNameMangler::GetInstance()->GetMangledObjectsListName(objectName);
}
#endif

