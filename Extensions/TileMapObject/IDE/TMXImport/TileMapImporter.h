#ifndef TILEMAPIMPORTER_H
#define TILEMAPIMPORTER_H

#include <memory>
#include <wx/string.h>

#include "tmx-parser/TmxMap.h"

class TileMap;
class TileSet;

class TileMapImporter
{
public:
    TileMapImporter(const wxString &filePath, wxString &errorOutput);

    bool ImportTileMap(TileSet &tileSet, TileMap &tileMap,
        bool importTileMap, bool importTileSetConf, bool importTileSetImage,
        bool importHitboxes);

private:
    std::unique_ptr<Tmx::Map> m_map;
    wxString &m_errorOutput;

    void CheckTilesCount(const TileSet &tileSet);

    void WriteToErrOutput(const wxString &msg);
};

#endif
