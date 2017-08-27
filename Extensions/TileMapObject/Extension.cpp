/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Florian Rival (Minor changes)
 */

#include "GDCpp/Extensions/ExtensionBase.h"

#include "TileMapObject.h"
#include "RuntimeTileMapObject.h"
#include <iostream>


void DeclareTileMapObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TileMapObject",
                              _("Tile Map Object"),
                              _("This Extension enables the use of Tile Map Objects."),
                              "Victor Levasseur and Florian Rival",
                              "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<TileMapObject>(
               "TileMap",
               _("Tile Map"),
               _("Displays a tile map"),
               "CppPlatform/Extensions/TileMapIcon.png");

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddCondition("Width",
                   _("Width"),
                   _("Test the width of a Tile Map Object."),
                   _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TileMap")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddCondition("Height",
                   _("Height"),
                   _("Test the height of a Tile Map Object."),
                   _("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
        .AddParameter("object", _("Object"), "TileMap")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetHeight").SetManipulatedType("number").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddAction("SetMapSize",
                   _("Resize the tilemap"),
                   _("Change the size of the tilemap (number of tiles)."),
                   _("Resize the tilemap to _PARAM1_x_PARAM2_ tiles"),
                   _("Size"),
                   "CppPlatform/Extensions/TileMapIcon24.png",
                   "res/TileMapIcon16.png")
        .AddParameter("objectList", _("Tile Map Object"), "TileMap")
        .AddParameter("expression", _("Width (tiles count)"))
        .AddParameter("expression", _("Height (tiles count)"))
        .MarkAsSimple()
        .SetFunctionName("SetMapSize").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    extension.AddCondition("SingleTileCollision",
                   _("Collision with one tile"),
                   _("Test if an object collides with a specific tile."),
                   _("_PARAM4_ is in collision with the tile named _PARAM0_, which is located at _PARAM2_;_PARAM3_ (in layer _PARAM1_)"),
                   _("Collisions"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png")
        .AddParameter("objectList", _("Tile Map Object"), "TileMap")
        .AddParameter("expression", _("Tile layer (0: Back, 1: Middle, 2: Top)"))
        .AddParameter("expression", _("Tile column"))
        .AddParameter("expression", _("Tile row"))
        .AddParameter("objectList", _("Object"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple()
        .SetFunctionName("SingleTileCollision").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");


    obj.AddExpression("TileWidth", _("Tile width"), _("Tile width"), _("Tiles"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .SetFunctionName("GetTileWidth").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddExpression("TileHeight", _("Tile height"), _("Tile height"), _("Tiles"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .SetFunctionName("GetTileHeight").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddExpression("MapWidth", _("Map width (tiles)"), _("Map width"), _("Map"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .SetFunctionName("GetMapWidth").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddExpression("MapHeight", _("Map height (tiles)"), _("Map height"), _("Map"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .SetFunctionName("GetMapHeight").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");



    obj.AddExpression("GetTile", _("Get the Tile (id)"), _("Get the Tile (id)"), _("Map"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .AddParameter("expression", _("Layer"))
        .AddParameter("expression", _("Column"))
        .AddParameter("expression", _("Row"))
        .SetFunctionName("GetTile").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");


    obj.AddAction("SetTile",
                   _("Change a tile"),
                   _("Change a tile at a specific cell."),
                   _("Set tile #_PARAM4_ at the cell _PARAM2_;_PARAM3_ (layer: _PARAM1_) in _PARAM0_"),
                   _("Tiles"),
                   "CppPlatform/Extensions/TileMapIcon24.png",
                   "res/TileMapIcon16.png")
        .AddParameter("objectList", _("Tile Map Object"), "TileMap")
        .AddParameter("expression", _("Tile layer (0: Back, 1: Middle, 2: Top)"))
        .AddParameter("expression", _("Tile column"))
        .AddParameter("expression", _("Tile row"))
        .AddParameter("expression", _("New tile Id (-1 to delete the tile)"))
        .MarkAsSimple()
        .SetFunctionName("SetTile").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");



    obj.AddExpression("GetColumnAt", _("Get tile column from X coordinates"), _("Get tile column from X coordinates"), _("Map"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .AddParameter("expression", _("X"))
        .SetFunctionName("GetColumnAt").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddExpression("GetRowAt", _("Get tile row from Y coordinates"), _("Get tile row from Y coordinates"), _("Map"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .AddParameter("expression", _("Y"))
        .SetFunctionName("GetRowAt").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");



    obj.AddStrExpression("SaveTiles", _("Save the tile map"), _("Save the tile map content in a string"), _("Saving"), "res/TileMapIcon16.png")
        .AddParameter("object", _("Object"), "TileMap")
        .SetFunctionName("SaveAsString").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    obj.AddAction("LoadTiles",
                   _("Load the tiles from a string"),
                   _("Load the tiles from a string."),
                   _("Load the tiles of _PARAM0_ from _PARAM1_"),
                   _("Loading"),
                   "CppPlatform/Extensions/TileMapIcon24.png",
                   "res/TileMapIcon16.png")
        .AddParameter("objectList", _("Tile Map Object"), "TileMap")
        .AddParameter("string", _("The string representing the tiles"))
        .MarkAsSimple()
        .SetFunctionName("LoadFromString").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");



    obj.AddAction("ChangeTexture",
                   _("Change the tileset texture"),
                   _("Change the tileset texture.\nNote: if the texture has a different size, it may produce strange results, such as texture offset..."),
                   _("Change the tileset texture of _PARAM0_ to _PARAM1_"),
                   _("Tileset"),
                   "CppPlatform/Extensions/TileMapIcon24.png",
                   "res/TileMapIcon16.png")
        .AddParameter("objectList", _("Tile Map Object"), "TileMap")
        .AddParameter("string", _("The new texture name"))
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsSimple()
        .SetFunctionName("ChangeTexture").SetIncludeFile("TileMapObject/RuntimeTileMapObject.h");

    #endif
}

/**
 * \brief This class declares information about the extension.
 */
class TileMapObjectCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TileMapObjectCppExtension()
    {
        DeclareTileMapObjectExtension(*this);
        AddRuntimeObject<TileMapObject, RuntimeTileMapObject>(
            GetObjectMetadata("TileMapObject::TileMap"),
            "RuntimeTileMapObject");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppTileMapObjectExtension() {
    return new TileMapObjectCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new TileMapObjectCppExtension;
}
#endif
