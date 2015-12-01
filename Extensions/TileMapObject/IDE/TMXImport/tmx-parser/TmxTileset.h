//-----------------------------------------------------------------------------
// TmxTileset.h
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
#include <vector>

#include "TmxPropertySet.h"

namespace tinyxml2 {
    class XMLNode;
}

namespace Tmx 
{
    class Image;
    class TileOffset;
    class Terrain;
    class Tile;

    //-------------------------------------------------------------------------
    // A class used for storing information about each of the tilesets.
    // A tileset is a collection of tiles, of whom each may contain properties.
    // This class has a property set.
    //-------------------------------------------------------------------------
    class Tileset 
    {
    public:
        Tileset();
        ~Tileset();

        // Parse a tileset element.
        void Parse(const tinyxml2::XMLNode *tilesetNode, const std::string& file_path);

        // Returns the global id of the first tile.
        int GetFirstGid() const { return first_gid; }

        // Returns the name of the tileset.
        const std::string &GetName() const { return name; }

        // Get the width of a single tile.
        int GetTileWidth() const { return tile_width; } 

        // Get the height of a single tile.
        int GetTileHeight() const { return tile_height; }

        // Get the margin of the tileset.
        int GetMargin() const { return margin; }

        // Get the spacing of the tileset.
        int GetSpacing() const { return spacing; }

        // Returns a variable containing information 
        // about the image of the tileset.
        const Tmx::Image* GetImage() const { return image; }

        // Returns a a single tile of the set.
        const Tmx::Tile *GetTile(int index) const;

        // Returns the whole tile collection.
        const std::vector< Tmx::Tile *> &GetTiles() const { return tiles; } 
        
        // Get a set of properties regarding the tile.
        const Tmx::PropertySet &GetProperties() const { return properties; }

    private:
        int first_gid;
        
        std::string name;
        
        int tile_width;
        int tile_height;
        int margin;
        int spacing;
        
        Tmx::TileOffset* tileOffset;
        Tmx::Image* image;

        std::vector< Tmx::Terrain* > terrainTypes;
        std::vector< Tmx::Tile* > tiles;
        
        Tmx::PropertySet properties;
    };
}
