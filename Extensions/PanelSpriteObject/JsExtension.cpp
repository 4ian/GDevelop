/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include <iostream>
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclarePanelSpriteObjectExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PanelSpriteObjectJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  PanelSpriteObjectJsExtension() {
    DeclarePanelSpriteObjectExtension(*this);

    GetObjectMetadata("PanelSpriteObject::PanelSprite")
        .SetIncludeFile(
            "Extensions/PanelSpriteObject/panelspriteruntimeobject.js")
        .AddIncludeFile(
            "Extensions/PanelSpriteObject/"
            "panelspriteruntimeobject-pixi-renderer.js")
        .AddIncludeFile(
            "Extensions/PanelSpriteObject/"
            "panelspriteruntimeobject-cocos-renderer.js");

    GetAllActionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::SetOpacity"]
        .SetFunctionName("setOpacity")
        .SetGetter("getOpacity")
        .SetIncludeFile(
            "Extensions/PanelSpriteObject/panelspriteruntimeobject.js");
    GetAllConditionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::Opacity"]
        .SetFunctionName("getOpacity")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/panelspriteruntimeobject.js");
    GetAllExpressionsForObject(
        "PanelSpriteObject::PanelSprite")["Opacity"]
        .SetFunctionName("getOpacity")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/panelspriteruntimeobject.js");
    GetAllActionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::SetColor"]
        .SetFunctionName("setColor")
        .SetIncludeFile(
            "Extensions/TiledSpriteObject/panelspriteruntimeobject.js");

    GetAllActionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::Width"]
        .SetFunctionName("setWidth")
        .SetGetter("getWidth");
    GetAllConditionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::Width"]
        .SetFunctionName("getWidth");
    GetAllActionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::Height"]
        .SetFunctionName("setHeight")
        .SetGetter("getHeight");
    GetAllConditionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::Height"]
        .SetFunctionName("getHeight");
    GetAllActionsForObject(
        "PanelSpriteObject::PanelSprite")["PanelSpriteObject::Image"]
        .SetFunctionName("setTexture");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSPanelSpriteObjectExtension() {
  return new PanelSpriteObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new PanelSpriteObjectJsExtension;
}
#endif
#endif
