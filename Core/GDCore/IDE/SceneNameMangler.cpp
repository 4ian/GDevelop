/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "SceneNameMangler.h"
#include "GDCore/CommonTools.h"
#include <GDCore/Utf8String.h>

namespace gd
{

gd::String SceneNameMangler::GetMangledSceneName(const gd::String & originalSceneName)
{
    gd::String partiallyMangledName = originalSceneName;
    static const gd::String allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static const gd::String allowedExceptFirst = "0123456789";

    for (size_t i = 0;i<partiallyMangledName.size();++i) //Replace all unallowed letters by an underscore and the Unicode code point of the letter
    {
        if ( allowedCharacters.find_first_of(std::u32string(1, partiallyMangledName[i])) == gd::String::npos &&
             (allowedExceptFirst.find_first_of(std::u32string(1, partiallyMangledName[i])) == gd::String::npos ||
              i == 0) ) //Also disallow some characters to be in first position
        {
            char32_t unallowedChar = partiallyMangledName[i];
            partiallyMangledName.replace(i, 1, "_"+gd::String::FromInt(unallowedChar));
        }
    }

    return partiallyMangledName;
}

}
