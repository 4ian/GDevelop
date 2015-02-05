/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2015 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

void DeclarePanelSpriteObjectExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PanelSpriteObjectJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    PanelSpriteObjectJsExtension()
    {
        DeclarePanelSpriteObjectExtension(*this);

        GetObjectMetadata("PanelSpriteObject::PanelSprite").SetIncludeFile("PanelSpriteObject/panelspriteruntimeobject.js");

        GetAllActionsForObject("PanelSpriteObject::PanelSprite")["PanelSpriteObject::Width"].codeExtraInformation
            .SetFunctionName("setWidth").SetAssociatedGetter("getWidth");
        GetAllConditionsForObject("PanelSpriteObject::PanelSprite")["PanelSpriteObject::Width"].codeExtraInformation
            .SetFunctionName("getWidth");
        GetAllActionsForObject("PanelSpriteObject::PanelSprite")["PanelSpriteObject::Height"].codeExtraInformation
            .SetFunctionName("setHeight").SetAssociatedGetter("getHeight");
        GetAllConditionsForObject("PanelSpriteObject::PanelSprite")["PanelSpriteObject::Height"].codeExtraInformation
            .SetFunctionName("getHeight");
        GetAllActionsForObject("PanelSpriteObject::PanelSprite")["PanelSpriteObject::Image"].codeExtraInformation
            .SetFunctionName("setTexture");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSPanelSpriteObjectExtension() {
    return new PanelSpriteObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new PanelSpriteObjectJsExtension;
}
#endif
#endif
