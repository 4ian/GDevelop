/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "TiledSpriteObject.h"

#include <iostream>

void DeclareTiledSpriteObjectExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TiledSpriteObjectJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  TiledSpriteObjectJsExtension() {
    DeclareTiledSpriteObjectExtension(*this);

    GetObjectMetadata("TiledSpriteObject::TiledSprite")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js")
        .AddIncludeFile(
            "Extensions/TiledSpriteObject/"
            "tiledspriteruntimeobject-pixi-renderer.js");

    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::SetOpacity"]
        .SetFunctionName("setOpacity")
        .SetGetter("getOpacity")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllConditionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Opacity"]
        .SetFunctionName("getOpacity")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllExpressionsForObject(
        "TiledSpriteObject::TiledSprite")["Opacity"]
        .SetFunctionName("getOpacity")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::SetColor"]
        .SetFunctionName("setColor")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Width"]
        .SetFunctionName("setWidth")
        .SetGetter("getWidth")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllConditionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Width"]
        .SetFunctionName("getWidth")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Height"]
        .SetFunctionName("setHeight")
        .SetGetter("getHeight")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllConditionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Height"]
        .SetFunctionName("getHeight")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::SetSize"]
        .SetFunctionName("setSize")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");

    // Deprecated: now available for all objects.
    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Angle"]
        .SetFunctionName("setAngle")
        .SetGetter("getAngle")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");

    // Deprecated: now available for all objects.
    GetAllConditionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::Angle"]
        .SetFunctionName("getAngle")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");

    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::XOffset"]
        .SetFunctionName("setXOffset")
        .SetGetter("getXOffset")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllConditionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::XOffset"]
        .SetFunctionName("getXOffset")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllExpressionsForObject(
        "TiledSpriteObject::TiledSprite")["XOffset"]
        .SetFunctionName("getXOffset")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllActionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::YOffset"]
        .SetFunctionName("setYOffset")
        .SetGetter("getYOffset")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllConditionsForObject(
        "TiledSpriteObject::TiledSprite")["TiledSpriteObject::YOffset"]
        .SetFunctionName("getYOffset")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");
    GetAllExpressionsForObject(
        "TiledSpriteObject::TiledSprite")["YOffset"]
        .SetFunctionName("getYOffset")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/tiledspriteruntimeobject.js");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSTiledSpriteObjectExtension() {
  return new TiledSpriteObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new TiledSpriteObjectJsExtension;
}
#endif
#endif
