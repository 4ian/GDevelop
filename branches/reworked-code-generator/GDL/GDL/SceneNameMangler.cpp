/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "SceneNameMangler.h"
#include "GDL/CommonTools.h"
#include <string>

std::string SceneNameMangler::GetMangledSceneName(const std::string & originalSceneName)
{
    std::string partiallyMangledName = originalSceneName;
    static const std::string allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letter by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(partiallyMangledName[i]) == std::string::npos)
        {
            char unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+ToString(int(unallowedChar)));
        }
    }

    return partiallyMangledName;
}
