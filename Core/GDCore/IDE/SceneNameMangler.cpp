/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "SceneNameMangler.h"
#include "GDCore/CommonTools.h"
#include <string>

namespace gd
{

std::string SceneNameMangler::GetMangledSceneName(const std::string & originalSceneName)
{
    std::string partiallyMangledName = originalSceneName;
    static const std::string allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static const std::string allowedExceptFirst = "0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letters by an underscore and the ascii number of the letter
    {
        if ( allowedCharacters.find_first_of(partiallyMangledName[i]) == std::string::npos &&
             (allowedExceptFirst.find_first_of(partiallyMangledName[i]) == std::string::npos ||
              i == 0) ) //Also disallow some characters to be in first position
        {
            char unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+ToString(int(unallowedChar)));
        }
    }

    return partiallyMangledName;
}

}
