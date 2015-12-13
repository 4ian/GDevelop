#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "TileMapImporter.h"

#include <stdexcept>

#include <wx/filename.h>
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/IDE/NewNameGenerator.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
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

TileMapImporter::TileMapImporter(const wxString &filePath)
 : m_filePath(filePath),
   m_map(new Tmx::Map())
{
    m_map->ParseFile(filePath.ToStdString());

    if(m_map->HasError())
    {
        throw std::runtime_error("Error when loading the .tmx file");
    }
}

bool TileMapImporter::ImportTileMap(TileSet &tileSet, TileMap &tileMap,
    bool importTileMap, bool importTileSetConf, bool importTileSetImage,
    bool importHitboxes, gd::Project &project)
{
    //Checks the map type
    if(m_map->GetOrientation() != Tmx::TMX_MO_ORTHOGONAL)
    {
        gd::LogError(_("Only orthogonal maps are supported !"));
        return false;
    }

    //Get the tileset list
    if(m_map->GetNumTilesets() < 1)
    {
        gd::LogError(_("There are no tilesets in this file !"));
        return false;
    }
    else if(m_map->GetNumTilesets() > 1)
    {
        gd::LogWarning(_("Only the first tileset will be taken into account. Tiles from supplementary tilesets may be lost."));
    }

    //Import the tileset image if needed
    if(importTileSetImage)
    {
        const Tmx::Image *importedImage = m_map->GetTileset(0)->GetImage();
        wxFileName imageFileName(importedImage->GetSource());
        imageFileName.MakeAbsolute(wxFileName(m_filePath).GetPath());

        if(!imageFileName.FileExists())
        {
            gd::LogError(_("The image can't be found !"));
            return false;
        }

        gd::String newResourceName = gd::NewNameGenerator::Generate(
            u8"imported_" + imageFileName.GetFullName(),
            [&project](const gd::String &name) -> bool { return project.GetResourcesManager().HasResource(name); }
            );

        gd::LogMessage(_("The image is imported as ") + "\"" + newResourceName + "\".");

        imageFileName.MakeRelativeTo(wxFileName(project.GetProjectFile()).GetPath());
        project.GetResourcesManager().AddResource(newResourceName, imageFileName.GetFullPath(), "image");

        tileSet.textureName = newResourceName;

        //Reload the texture
        tileSet.LoadResources(project);

        gd::LogStatus(_("Tileset image importation completed."));
    }

    //Import the tileset configuration if wanted
    if(importTileSetConf)
    {
        const Tmx::Tileset *importedTileset = m_map->GetTileset(0);

        if(importedTileset->GetImage()->GetWidth() != tileSet.GetWxBitmap().GetWidth() ||
           importedTileset->GetImage()->GetHeight() != tileSet.GetWxBitmap().GetHeight())
        {
            gd::LogWarning(_("Tileset image size is not the same. Some tiles may not be rendered correctly."));
        }

        tileSet.tileSize.x = importedTileset->GetTileWidth();
        tileSet.tileSize.y = importedTileset->GetTileHeight();
        tileSet.tileSpacing.x = tileSet.tileSpacing.y = importedTileset->GetSpacing();

        if(importedTileset->GetMargin() > 0)
        {
            gd::LogWarning(_("Tilemap objects don't handle tilesets with margins around the images. Consider cutting the picture."));
        }

        gd::LogStatus(_("Tileset configuration importation completed."));
    }

    //Import the tilemap tiles if wanted
    if(importTileMap)
    {
        //Tilemap size
        if(tileMap.GetColumnsCount() != m_map->GetWidth() || tileMap.GetRowsCount() != m_map->GetHeight())
            gd::LogMessage(_("Tilemap size is different."));
        tileMap.SetSize(0, 0);
        tileMap.SetSize(m_map->GetWidth(), m_map->GetHeight());

        if(!importTileSetConf && !importTileSetImage)
            CheckTilesCount(tileSet);

        //Import layers and tiles
        if(m_map->GetNumTileLayers() > 3)
        {
            gd::LogWarning(_("There are more than 3 tiles layers. Only the 3 firsts will be imported."));
        }
        else if(m_map->GetNumTileLayers() < 3)
        {
            gd::LogMessage(_("There are less than 3 tiles layers. Upper layer(s) will be empty."));
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

        gd::LogStatus(_("Tilemap content importation completed."));
    }

    //Import the hitboxes
    if(importHitboxes)
    {
        const Tmx::Tileset *importedTileset = m_map->GetTileset(0);

        //Set all tiles not collidable in the tileset
        tileSet.ResetHitboxes();
        for(std::size_t i = 0; i < tileSet.GetTilesCount(); i++)
            tileSet.SetTileCollidable(i, false);

        if(!importTileSetConf && !importTileSetImage)
            CheckTilesCount(tileSet);

        bool hasMoreThanOneObjectPerTile = false;
        bool hasNotPolygoneObject = false;
        bool hasNotConvexPolygon = false;
        for(auto it = importedTileset->GetTiles().cbegin();
            it != importedTileset->GetTiles().cend();
            ++it)
        {
            const Tmx::Tile *importedTile = *it;

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
                    if(!importedObj->GetPolyline() && !importedObj->GetEllipse())
                    {
                        Polygon2d polygonHitbox;

                        if(!importedObj->GetPolygon())
                        {
                            //This is a rectangle
                            polygonHitbox = Polygon2d::CreateRectangle(importedObj->GetWidth(), importedObj->GetHeight());
                            polygonHitbox.Move(
                                importedObj->GetWidth() / 2.f,
                                importedObj->GetHeight() / 2.f
                            );
                        }
                        else
                        {
                            //This is a polygon
                            const Tmx::Polygon *importedPolygon = importedObj->GetPolygon();

                            for(int i = 0; i < importedPolygon->GetNumPoints(); i++)
                            {
                                polygonHitbox.vertices.emplace_back(
                                    importedPolygon->GetPoint(i).x,
                                    importedPolygon->GetPoint(i).y
                                );
                            }
                        }

                        polygonHitbox.Move(importedObj->GetX(), importedObj->GetY());
                        polygonHitbox.Rotate(importedObj->GetRot());

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
            gd::LogWarning(_("Some tiles have more than 1 hitbox. Only the first one is imported."));
        if(hasNotPolygoneObject)
            gd::LogWarning(_("Some tiles have a polyline or a ellipsis hitbox. Only rectangle and polygon hitboxes are supported."));
        if(hasNotConvexPolygon)
            gd::LogWarning(_("Some tiles have a concave polygon. It has been ignored and set to a rectangular hitbox as this object only supports convex hitboxes for tiles."));

        gd::LogStatus(_("Tiles hitboxes importation completed."));
    }

    return true;
}

void TileMapImporter::CheckTilesCount(const TileSet &tileSet)
{
    //Warn the user if there are not same amount of tiles in the current tileset and the imported file
    //note: if the tileset has been imported too, the number of tiles should already be equal.
    const Tmx::Tileset *importedTileset = m_map->GetTileset(0);
    const Tmx::Image *importedImage = importedTileset->GetImage();
    const int importedTilesCount =
        (importedImage->GetWidth() - importedTileset->GetMargin() * 2 + importedTileset->GetSpacing()) / (importedTileset->GetTileWidth() + importedTileset->GetSpacing()) *
        (importedImage->GetHeight() - importedTileset->GetMargin() * 2 + importedTileset->GetSpacing()) / (importedTileset->GetTileHeight() + importedTileset->GetSpacing());

    if(importedTilesCount != tileSet.GetTilesCount())
    {
        gd::LogWarning(_("There are not as many tiles in the object's tileset as in the file. The result may not be correct."));
    }
}

#endif
