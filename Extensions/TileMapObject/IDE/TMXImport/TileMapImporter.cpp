#include "TileMapImporter.h"

#include <stdexcept>

#include "GDCore/Tools/Localization.h"
#include "TileSet.h"
#include "TileMap.h"
#include "tmx-parser/TmxImage.h"
#include "tmx-parser/TmxLayer.h"
#include "tmx-parser/TmxMapTile.h"
#include "tmx-parser/TmxObject.h"
#include "tmx-parser/TmxPolygon.h"
#include "tmx-parser/TmxTileLayer.h"
#include "tmx-parser/TmxTileset.h"
#include "tmx-parser/TmxTile.h"

TileMapImporter::TileMapImporter(const wxString &filePath, wxString &errorOutput)
 : m_map(new Tmx::Map()),
   m_errorOutput(errorOutput)
{
    errorOutput = "";
    m_map->ParseFile(filePath.ToStdString());

    if(m_map->HasError())
    {
        throw std::runtime_error("Error when loading the .tmx file");
    }
}

bool TileMapImporter::ImportTileMap(TileSet &tileSet, TileMap &tileMap,
    bool importTileMap, bool importTileSetConf, bool importTileSetImage,
    bool importHitboxes)
{

    //Checks the map type
    if(m_map->GetOrientation() != Tmx::TMX_MO_ORTHOGONAL)
    {
        WriteToErrOutput(_("ERROR: Only orthogonal maps are supported !"));
        return false;
    }

    //Get the tileset list
    if(m_map->GetNumTilesets() < 1)
    {
        WriteToErrOutput(_("ERROR: There are no tilesets in this file !"));
        return false;
    }
    else if(m_map->GetNumTilesets() > 1)
    {
        WriteToErrOutput(_("WARNING: Only the first tileset will be taken into account. Tiles from supplementary tilesets may be lost."));
    }

    //Import the tileset image if needed
    if(importTileSetImage)
    {
        WriteToErrOutput(_("\nTileset image importation report : \n=================================="));
        //TODO: Write it!
    }

    //Import the tileset configuration if wanted
    if(importTileSetConf)
    {
        WriteToErrOutput(_("\nTileset config importation report : \n==================================="));

        const Tmx::Tileset *importedTileset = m_map->GetTileset(0);

        if(!importTileSetImage && ( //If the tileset image was imported, it should be ok.
            importedTileset->GetImage()->GetWidth() != tileSet.GetWxBitmap().GetWidth() ||
            importedTileset->GetImage()->GetHeight() != tileSet.GetWxBitmap().GetHeight()))
        {
            WriteToErrOutput(_("WARNING: Tileset image size is not the same. Some tiles may not be rendered correctly."));
        }

        tileSet.tileSize.x = importedTileset->GetTileWidth();
        tileSet.tileSize.y = importedTileset->GetTileHeight();
        tileSet.tileSpacing.x = tileSet.tileSpacing.y = importedTileset->GetSpacing();

        if(importedTileset->GetMargin() > 0)
        {
            WriteToErrOutput(_("WARNING: Tilemap objects don't handle tileset with margins around the images. Consider cutting the picture."));
        }
    }

    //Import the tilemap tiles if wanted
    if(importTileMap)
    {
        WriteToErrOutput(_("\nTilemap importation report : \n============================"));

        //Tilemap size
        if(tileMap.GetColumnsCount() != m_map->GetWidth() || tileMap.GetRowsCount() != m_map->GetHeight())
            WriteToErrOutput(_("NOTE: Tilemap size is different."));
        tileMap.SetSize(0, 0);
        tileMap.SetSize(m_map->GetWidth(), m_map->GetHeight());

        //Warn the user if there are not same amount of tiles in the current tileset and the imported file
        //note: if the tileset has been imported too, the number of tiles should already be equal.
        if(!importTileSetConf)
        {
            const Tmx::Tileset *importedTileset = m_map->GetTileset(0);
            const Tmx::Image *importedImage = importedTileset->GetImage();
            const int importedTilesCount =
                (importedImage->GetWidth() - importedTileset->GetMargin() * 2 + importedTileset->GetSpacing()) / (importedTileset->GetTileWidth() + importedTileset->GetSpacing()) *
                (importedImage->GetHeight() - importedTileset->GetMargin() * 2 + importedTileset->GetSpacing()) / (importedTileset->GetTileHeight() + importedTileset->GetSpacing());

            if(importedTilesCount != tileSet.GetTilesCount())
            {
                WriteToErrOutput(_("WARNING: There are not the same amount of tiles in the object's tileset than in the file. The result may not be correct."));
            }
        }

        //Import layers and tiles
        if(m_map->GetNumTileLayers() > 3)
        {
            WriteToErrOutput(_("WARNING: There are more than 3 tiles layers. Only the 3 firsts will be imported."));
        }
        else if(m_map->GetNumTileLayers() < 3)
        {
            WriteToErrOutput(_("NOTE: There are less than 3 tiles layers. Upper layer(s) will be empty."));
        }

        for(std::size_t i = 0; i < std::min(3, m_map->GetNumTileLayers()); i++)
        {
            const Tmx::TileLayer *layer = m_map->GetTileLayer(i);

            for(std::size_t x = 0; x < tileMap.GetColumnsCount(); x++)
            {
                for(std::size_t y = 0; y < tileMap.GetRowsCount(); y++)
                {
                    //Only tiles provided by the first tileset are imported (and also tests for empty tiles)
                    if(m_map->FindTilesetIndex(layer->GetTileGid(x, y)) == 0)
                    {
                        tileMap.SetTile(i, x, y, layer->GetTileId(x, y));
                    }
                }
            }
        }
    }

    //Import the hitboxes
    if(importHitboxes)
    {
        WriteToErrOutput(_("\nTiles hitboxes importation report : \n================================="));

        const Tmx::Tileset *importedTileset = m_map->GetTileset(0);

        //Set all tiles not collidable in the tileset
        for(std::size_t i = 0; i < tileSet.GetTilesCount(); i++)
            tileSet.SetTileCollidable(i, false);
        tileSet.ResetHitboxes();

        //Warn the user if there are not same amount of tiles in the current tileset and the imported file
        //note: if the tileset has been imported too, the number of tiles should already be equal.
        {
            if(!importTileSetConf)
            {
                const Tmx::Tileset *importedTileset = m_map->GetTileset(0);
                const Tmx::Image *importedImage = importedTileset->GetImage();
                const int importedTilesCount =
                    (importedImage->GetWidth() - importedTileset->GetMargin() * 2 + importedTileset->GetSpacing()) / (importedTileset->GetTileWidth() + importedTileset->GetSpacing()) *
                    (importedImage->GetHeight() - importedTileset->GetMargin() * 2 + importedTileset->GetSpacing()) / (importedTileset->GetTileHeight() + importedTileset->GetSpacing());

                if(importedTilesCount != tileSet.GetTilesCount())
                {
                    WriteToErrOutput(_("WARNING: There are not the same amount of tiles in the object's tileset than in the file. The result may not be correct."));
                }
            }
        }

        bool hasMoreThanOneObjectPerTile = false;
        bool hasNotPolygoneObject = false;
        bool hasNotConvexPolygon = false;
        for(std::size_t i = 0; i < importedTileset->GetTiles().size(); i++)
        {
            const Tmx::Tile *importedTile = importedTileset->GetTiles().at(i);

            if(importedTile->GetId() < tileSet.GetTilesCount()) //Check if the tileset has enough tiles to receive the imported hitboxes
            {
                if(importedTile->HasObjects())
                {
                    //Set the tile collidable and gets its hitbox
                    tileSet.SetTileCollidable(importedTile->GetId(), true);
                    TileHitbox &tileHitbox = tileSet.GetTileHitboxRef(importedTile->GetId());

                    //Warn the user if more than one hitbox per tile is found
                    if(importedTile->GetNumObjects() > 1)
                        hasMoreThanOneObjectPerTile = true;

                    const Tmx::Object *importedObj = importedTile->GetObject(0);
                    if(importedObj->GetPolygon() == nullptr &&
                        importedObj->GetPolyline() == nullptr &&
                        importedObj->GetEllipse() == nullptr)
                    {
                        //This is a rectangle
                        tileHitbox.hitbox = Polygon2d::CreateRectangle(importedObj->GetWidth(), importedObj->GetHeight());
                        tileHitbox.hitbox.Move(
                            importedObj->GetX() + importedObj->GetWidth()/2.f,
                            importedObj->GetY() + importedObj->GetHeight()/2.f
                        );
                    }
                    else if(importedObj->GetPolygon())
                    {
                        //This is a polygon
                        const Tmx::Polygon *importedPolygon = importedObj->GetPolygon();
                        Polygon2d polygonHitbox;

                        for(int i = 0; i < importedPolygon->GetNumPoints(); i++)
                        {
                            polygonHitbox.vertices.push_back(sf::Vector2f(
                                importedPolygon->GetPoint(i).x,
                                importedPolygon->GetPoint(i).y
                            ));
                        }
                        polygonHitbox.Move(importedObj->GetX(), importedObj->GetY());

                        if(polygonHitbox.IsConvex())
                            tileHitbox.hitbox = polygonHitbox;
                        else
                            hasNotConvexPolygon = true;
                    }
                    else
                    {
                        //This is not a supported shape
                        hasNotPolygoneObject = true;
                    }
                }
            }
        }

        if(hasMoreThanOneObjectPerTile)
            WriteToErrOutput(_("WARNING: Some tiles have more than 1 hitbox. Only the first one is imported."));
        if(hasNotPolygoneObject)
            WriteToErrOutput(_("WARNING: Some tiles have a polyline or a ellipsis hitbox. Only rectangle and polygon hitboxes are supported."));
        if(hasNotConvexPolygon)
            WriteToErrOutput(_("WARNING: Some tiles have a concave polygon. It has been ignored and set to a rectangular hitbox."));
    }

    WriteToErrOutput(_("> No fatal errors in importation"));
    return true;
}

void TileMapImporter::WriteToErrOutput(const wxString &msg)
{
    m_errorOutput += msg + "\n";
}
