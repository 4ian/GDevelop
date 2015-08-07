/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "SceneNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"

namespace gd
{

gd::String SceneNameMangler::GetMangledSceneName(gd::String sceneName)
{
    static const gd::String allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static const gd::String allowedExceptFirst = "0123456789";

    std::size_t i = 0;
    for( auto it = sceneName.begin(); it != sceneName.end(); ++it )
    {
        char32_t character = *it;
        if ( allowedCharacters.find(character) == gd::String::npos &&
             (allowedExceptFirst.find(character) == gd::String::npos ||
              i == 0) ) //Also disallow some characters to be in first position
        {
            //Replace the character by an underscore and its unicode codepoint (in base 10)
            auto it2 = it; ++it2;
            sceneName.replace(it, it2, "_"+gd::String::From(character));

            //The iterator it may have been invalidated:
            //re-assign it with a new iterator pointing to the same position.
            it = sceneName.begin();
            std::advance(it, i);
        }

        ++i;
    }

    return sceneName;
}

}
