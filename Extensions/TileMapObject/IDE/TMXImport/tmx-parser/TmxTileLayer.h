//-----------------------------------------------------------------------------
// TmxTileLayer.h
//
// Copyright (c) 2010-2014, Tamir Atias
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL TAMIR ATIAS BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Author: Tamir Atias
//-----------------------------------------------------------------------------
#pragma once

#include <string>

#include "TmxPropertySet.h"
#include "TmxMapTile.h"

namespace tinyxml2 {
    class XMLNode;
}

namespace Tmx 
{
    class Map;

    //-------------------------------------------------------------------------
    // Type used for the encoding of the tile layer data.
    //-------------------------------------------------------------------------
    enum TileLayerEncodingType 
    {
        TMX_ENCODING_XML,
        TMX_ENCODING_BASE64,
        TMX_ENCODING_CSV
    };

    //-------------------------------------------------------------------------
    // Type used for the compression of the tile layer data.
    //-------------------------------------------------------------------------
    enum TileLayerCompressionType 
    {
        TMX_COMPRESSION_NONE,
        TMX_COMPRESSION_ZLIB,
        TMX_COMPRESSION_GZIP
    };

    //-------------------------------------------------------------------------
    // Used for storing information about the tile ids for every tile layer.
    // This class also have a property set.
    //-------------------------------------------------------------------------
    class TileLayer : public Tmx::Layer
    {
    private:
        // Prevent copy constructor.
        TileLayer(const TileLayer &_layer);

    public:
        TileLayer(const Tmx::Map *_map);
        ~TileLayer();

        // Parse a tile layer node.
        void Parse(const tinyxml2::XMLNode *tileLayerNode);

        // Pick a specific tile id from the list.
        unsigned GetTileId(int x, int y) const { return tile_map[y * width + x].id; }

        // Pick a specific tile gid from the list.
        unsigned GetTileGid(int x, int y) const { return tile_map[y * width + x].gid; }

        // Get the tileset index for a tileset from the list.
        int GetTileTilesetIndex(int x, int y) const { return tile_map[y * width + x].tilesetId; }

        // Get whether a tile is flipped horizontally.
        bool IsTileFlippedHorizontally(int x, int y) const 
        { return tile_map[y * width + x].flippedHorizontally; }

        // Get whether a tile is flipped vertically.
        bool IsTileFlippedVertically(int x, int y) const 
        { return tile_map[y * width + x].flippedVertically; }

        // Get whether a tile is flipped diagonally.
        bool IsTileFlippedDiagonally(int x, int y) const
        { return tile_map[y * width + x].flippedDiagonally; }

        // Get a tile specific to the map.
        const Tmx::MapTile& GetTile(int x, int y) const { return tile_map[y * width + x]; }

        // Get the type of encoding that was used for parsing the tile layer data.
        // See: TileLayerEncodingType
        Tmx::TileLayerEncodingType GetEncoding() const { return encoding; }

        // Get the type of compression that was used for parsing the tile layer data.
        // See: TileLayerCompressionType
        Tmx::TileLayerCompressionType GetCompression() const { return compression; }

    private:
        void ParseXML(const tinyxml2::XMLNode *dataNode);
        void ParseBase64(const std::string &innerText);
        void ParseCSV(const std::string &innerText);

        Tmx::MapTile *tile_map;

        Tmx::TileLayerEncodingType encoding;
        Tmx::TileLayerCompressionType compression;
    };
}
