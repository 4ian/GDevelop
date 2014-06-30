/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

/*
 * When cross-compiling using emscripten, this file exposes the extension API
 * to javascript.
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "../TiledSpriteObject.h"

using namespace emscripten;

TiledSpriteObject * AsTiledSpriteObject(gd::Object * object) { return static_cast<TiledSpriteObject *>(object); }

EMSCRIPTEN_BINDINGS(gd_TiledSpriteObject) {
    class_<TiledSpriteObject, base<gd::Object> >("TiledSpriteObject")
        .constructor<const std::string &>()
        .function("setTexture", &TiledSpriteObject::SetTexture)
        .function("getTexture", &TiledSpriteObject::GetTexture)
        .function("setWidth", &TiledSpriteObject::SetWidth)
        .function("setHeight", &TiledSpriteObject::SetHeight)
        .function("getWidth", &TiledSpriteObject::GetWidth)
        .function("getHeight", &TiledSpriteObject::GetHeight)
        ;

    function("asTiledSpriteObject", &AsTiledSpriteObject, allow_raw_pointers());
}
#endif