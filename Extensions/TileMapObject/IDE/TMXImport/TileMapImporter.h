#ifndef TILEMAPIMPORTER_H
#define TILEMAPIMPORTER_H

#include <memory>
#include <wx/string.h>

#include "tmx-parser/TmxMap.h"

class TileMap;

class TileMapImporter
{
public:
    TileMapImporter(const wxString &filePath, wxString &errorOutput);

    bool ImportTileMap(TileMap &tileMap);

private:
    std::unique_ptr<Tmx::Map> m_map;
    wxString &m_errorOutput;

    void WriteToErrOutput(const wxString &msg);
};

#endif
