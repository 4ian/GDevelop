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
/**
 * Contributors to the extension:
 * Florian Rival ( Minor changes, added offsets, HTML5 port )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "TileMapObject.h"
#include <iostream>
#include <boost/version.hpp>

void DeclareTileMapObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TileMapObject",
                              _("Tile Map Object"),
                              _("Extension allowing to use tile map objects."),
                              "Victor Levasseur and Florian Rival",
                              "zlib/libpng License (Open Source)");

    gd::ObjectMetadata & obj = extension.AddObject("TileMap",
               _("Tile Map"),
               _("Displays a tile map"),
               "CppPlatform/Extensions/TileMapIcon.png",
               &CreateTileMapObject,
               &DestroyTileMapObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("TileMapObject/TileMapObject.h");

    obj.AddCondition("Width",
                   _("Width"),
                   _("Test the width of a Tile Map Object."),
                   _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TileMap", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("TileMapObject/TileMapObject.h");

    obj.AddCondition("Height",
                   _("Height"),
                   _("Test the width of a Tile Map Object."),
                   _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
        .AddParameter("object", _("Object"), "TileMap", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetHeight").SetManipulatedType("number").SetIncludeFile("TileMapObject/TileMapObject.h");

    extension.AddCondition("SingleTileCollision",
                   _("Collision with one tile"),
                   _("Test if an object collides a specific tile."),
                   _("_PARAM4_ is in collision with the tile at _PARAM2_;_PARAM3_ (layer _PARAM1_) of _PARAM0_"),
                   _("Collisions"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png")
        .AddParameter("objectList", _("Tile Map Object"), "TileMap", false)
        .AddParameter("expression", _("Tile layer (0: Back, 1: Middle, 2: Top)"))
        .AddParameter("expression", _("Tile column"))
        .AddParameter("expression", _("Tile row"))
        .AddParameter("objectList", _("Object"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple()
        .codeExtraInformation.SetFunctionName("SingleTileCollision").SetIncludeFile("TileMapObject/TileMapObject.h");

    /*obj.AddAction("YOffset",
                   _("Image Y Offset"),
                   _("Modify the offset used on the Y axis when displaying the image."),
                   _("Do _PARAM1__PARAM2_ to the Y offset of _PARAM0_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("SetYOffset").SetManipulatedType("number").SetAssociatedGetter("GetYOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("YOffset",
                   _("Image Y Offset"),
                   _("Test the offset used on the Y axis when displaying the image."),
                   _("The Y offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetYOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");*/
    #endif
}

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareTileMapObjectExtension(*this);
        AddRuntimeObject(GetObjectMetadata("TileMapObject::TileMap"),
            "RuntimeTileMapObject", CreateRuntimeTileMapObject, DestroyRuntimeTileMapObject);

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

#if !defined(EMSCRIPTEN)
/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
#endif