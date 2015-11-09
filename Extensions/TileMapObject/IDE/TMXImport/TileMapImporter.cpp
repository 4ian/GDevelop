#include "TileMapImporter.h"

#include <stdexcept>

#include "GDCore/Tools/Localization.h"
#include "TileSet.h"
#include "TileMap.h"
#include "tmx-parser/TmxLayer.h"
#include "tmx-parser/TmxTileLayer.h"
#include "tmx-parser/TmxMapTile.h"

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

bool TileMapImporter::ImportTileMap(TileMap &tileMap)
{
    WriteToErrOutput(_("Tilemap importation report : \n========================"));

    //Checks the map type
    if(m_map->GetOrientation() != Tmx::TMX_MO_ORTHOGONAL)
    {
        WriteToErrOutput(_("ERROR: Only orthogonal maps are supported !"));
        return false;
    }

    //Tilemap size
    if(tileMap.GetColumnsCount() != m_map->GetWidth() || tileMap.GetRowsCount() != m_map->GetHeight())
        WriteToErrOutput(_("NOTE: Tilemap size is different."));
    tileMap.SetSize(0, 0);
    tileMap.SetSize(m_map->GetWidth(), m_map->GetHeight());

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
                tileMap.SetTile(i, x, y, layer->GetTileId(x, y));
            }
        }
    }

    WriteToErrOutput(_("> No fatal errors in tilemap importation"));
    return true;
}

void TileMapImporter::WriteToErrOutput(const wxString &msg)
{
    m_errorOutput += msg + "\n";
}
