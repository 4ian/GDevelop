/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "SceneNameMangler.h"
#include "GDCore/CommonTools.h"
#include <string>

namespace gd
{

std::string SceneNameMangler::GetMangledSceneName(const std::string & originalSceneName)
{
    std::string partiallyMangledName = originalSceneName;
    static const std::string allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

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

}
