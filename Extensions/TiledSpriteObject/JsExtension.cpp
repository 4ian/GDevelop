/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include "TiledSpriteObject.h"

#include <iostream>

void DeclareTiledSpriteObjectExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TiledSpriteObjectJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TiledSpriteObjectJsExtension()
    {
        DeclareTiledSpriteObjectExtension(*this);

        GetObjectMetadata("TiledSpriteObject::TiledSprite")
            .SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js")
            .AddIncludeFile("TiledSpriteObject/tiledspriteruntimeobject-pixi-renderer.js")
            .AddIncludeFile("TiledSpriteObject/tiledspriteruntimeobject-cocos-renderer.js");

        GetAllActionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::Width"].SetFunctionName("setWidth").SetGetter("getWidth").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllConditionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::Width"].SetFunctionName("getWidth").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllActionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::Height"].SetFunctionName("setHeight").SetGetter("getHeight").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllConditionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::Height"].SetFunctionName("getHeight").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllActionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::Angle"].SetFunctionName("setAngle").SetGetter("getAngle").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllConditionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::Angle"].SetFunctionName("getAngle").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllActionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::XOffset"].SetFunctionName("setXOffset").SetGetter("getXOffset").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllConditionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::XOffset"].SetFunctionName("getXOffset").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllActionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::YOffset"].SetFunctionName("setYOffset").SetGetter("getYOffset").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");
        GetAllConditionsForObject("TiledSpriteObject::TiledSprite")["TiledSpriteObject::YOffset"].SetFunctionName("getYOffset").SetIncludeFile("TiledSpriteObject/tiledspriteruntimeobject.js");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSTiledSpriteObjectExtension() {
    return new TiledSpriteObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new TiledSpriteObjectJsExtension;
}
#endif
#endif
