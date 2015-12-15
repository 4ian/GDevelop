#ifndef TILEMAPIMPORTER_H
#define TILEMAPIMPORTER_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <memory>
#include <wx/string.h>

#include "tmx-parser/TmxMap.h"

class TileMap;
class TileSet;
namespace gd
{
    class Project;
}

class TileMapImporter
{
public:
    TileMapImporter(const wxString &filePath);

    bool ImportTileMap(TileSet &tileSet, TileMap &tileMap,
        bool importTileMap, bool importTileSetConf, bool importTileSetImage,
        bool importHitboxes, gd::Project &project);

private:
    wxString m_filePath;
    std::unique_ptr<Tmx::Map> m_map;

    void CheckTilesCount(const TileSet &tileSet);
};

#endif
#endif
