/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/*
 * When cross-compiling using emscripten, this file exposes the GDCpp API
 * to javascript.
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCpp/SpriteObject.h"
#include "GDCpp/Animation.h"
#include "GDCpp/CppPlatform.h"

using namespace emscripten;
using namespace gd;

CppPlatform * AsCppPlatform(gd::Platform * platform)
{
	return static_cast<CppPlatform *>(platform);
}

EMSCRIPTEN_BINDINGS(CppPlatform) {
    class_<CppPlatform, base<gd::Platform>>("CppPlatform")
        .constructor<>()
        .class_function("get", &CppPlatform::Get)
        ;

    function("asCppPlatform", &AsCppPlatform, allow_raw_pointers());
}

SpriteObject * AsSpriteObject(gd::Object * object)
{
	return static_cast<SpriteObject *>(object);
}

EMSCRIPTEN_BINDINGS(SpriteObject) {
    class_<Animation>("Animation")
        .constructor<>()
        .function("setDirectionsNumber", &Animation::SetDirectionsNumber)
        //TODO
        ;

    class_<SpriteObject, base<gd::Object> >("SpriteObject")
        .constructor<const std::string &>()
        .function("addAnimation", &SpriteObject::AddAnimation)
        //TODO
        ;

    function("asSpriteObject", &AsSpriteObject, allow_raw_pointers());
}
#endif