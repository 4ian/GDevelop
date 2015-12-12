//-----------------------------------------------------------------------------
// TmxMap.h
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

#include <vector>
#include <string>

#include "TmxPropertySet.h"

namespace Tmx 
{
    class Layer;
    class TileLayer;
    class ImageLayer;
    class ObjectGroup;
    class Tileset;

    //-------------------------------------------------------------------------
    // Error in handling of the Map class.
    //-------------------------------------------------------------------------
    enum MapError 
    {
        // A file could not be opened. (usually due to permission problems)
        TMX_COULDNT_OPEN = 0x01,

        // There was an error in parsing the TMX file.
        // This is being caused by TinyXML parsing problems.
        TMX_PARSING_ERROR = 0x02,
        
        // The size of the file is invalid.
        TMX_INVALID_FILE_SIZE = 0x04
    };

    //-------------------------------------------------------------------------
    // The way the map is viewed.
    //-------------------------------------------------------------------------
    enum MapOrientation 
    {
        // This map is an orthogonal map.
        TMX_MO_ORTHOGONAL = 0x01,

        // This map is an isometric map.
        TMX_MO_ISOMETRIC = 0x02,

        // This map is an isometric staggered map.
        TMX_MO_STAGGERED = 0x03,

        // This map is an hexagonal staggered map.
        TMX_MO_HEXAGONAL = 0x04
    };

    //-------------------------------------------------------------------------
    // The order in which tiles on tile layers are rendered.
    //-------------------------------------------------------------------------
    enum MapRenderOrder
    {
        // The default is TMX_RIGHT_DOWN.
        TMX_RIGHT_DOWN = 0x01,
        TMX_RIGHT_UP = 0x02,
        TMX_LEFT_DOWN = 0x03,
        TMX_LEFT_UP= 0x03
    };

    //-------------------------------------------------------------------------
    // The stagger axis for the map. (only applies to hexagonal maps)
    //-------------------------------------------------------------------------
    enum MapStaggerAxis
    {
        TMX_SA_NONE = 0x00,  // if the map is not hexagonal
        TMX_SA_X = 0x01,
        TMX_SA_Y = 0x02
    };

    //-------------------------------------------------------------------------
    // The stagger index for the map. (applies to hexagonal AND isometric staggered maps)
    //-------------------------------------------------------------------------
    enum MapStaggerIndex
    {
        TMX_SI_NONE = 0x00,  // if the map is not hexagonal
        TMX_SI_EVEN = 0x01,
        TMX_SI_ODD = 0x02
    };

    //-------------------------------------------------------------------------
    // This class is the root class of the parser.
    // It has all of the information in regard to the TMX file.
    // This class has a property set.
    //-------------------------------------------------------------------------
    class Map 
    {
    private:
        // Prevent copy constructor.
        Map(const Map &_map);

    public:
        Map();
        ~Map();

        // Read a file and parse it.
        // Note: use '/' instead of '\\' as it is using '/' to find the path.
        void ParseFile(const std::string &fileName);
        
        // Parse text containing TMX formatted XML.
        void ParseText(const std::string &text);

        // Get the filename used to read the map.
        const std::string &GetFilename() { return file_name; }

        // Get a path to the directory of the map file if any.
        const std::string &GetFilepath() const { return file_path; }

        // Get the background color of the map file if any.
        const std::string &GetBackgroundColor() const { return background_color; }

        // Get the version of the map.
        double GetVersion() const { return version; }

        // Get the orientation of the map.
        Tmx::MapOrientation GetOrientation() const { return orientation; }

        // Get the render order of the map.
        Tmx::MapRenderOrder GetRenderOrder() const { return render_order; }

        // Get the stagger axis of the map.
        Tmx::MapStaggerAxis GetStaggerAxis() const { return stagger_axis; }

        // Get the stagger index of the map.
        Tmx::MapStaggerIndex GetStaggerIndex() const { return stagger_index; }

        // Get the width of the map, in tiles.
        int GetWidth() const { return width; }

        // Get the height of the map, in tiles.
        int GetHeight() const { return height; }

        // Get the width of a tile, in pixels.
        int GetTileWidth() const { return tile_width; }

        // Get the height of a tile, in pixels.
        int GetTileHeight() const { return tile_height; }

        // Get the next object id.
        int GetNextObjectId() const { return next_object_id; }

        // Get the hexside length.
        int GetHexsideLength() const { return hexside_length; }

        // Get the layer at a certain index.
        const Tmx::Layer *GetLayer(int index) const { return layers.at(index); }

        // Get the amount of layers.
        int GetNumLayers() const { return layers.size(); }

        // Get the whole layers collection.
        const std::vector< Tmx::Layer* > &GetLayers() const { return layers; }

        // Get the tile layer at a certain index.
        const Tmx::TileLayer *GetTileLayer(int index) const { return tile_layers.at(index); }

        // Get the amount of tile layers.
        int GetNumTileLayers() const { return tile_layers.size(); }

        // Get the whole collection of tile layers.
        const std::vector< Tmx::TileLayer* > &GetTileLayers() const { return tile_layers; }

        // Get the object group at a certain index.
        const Tmx::ObjectGroup *GetObjectGroup(int index) const { return object_groups.at(index); }

        // Get the amount of object groups.
        int GetNumObjectGroups() const { return object_groups.size(); }

        // Get the whole collection of object groups.
        const std::vector< Tmx::ObjectGroup* > &GetObjectGroups() const { return object_groups; }

        // Get the image layer at a certain index.
        const Tmx::ImageLayer *GetImageLayer(int index) const { return image_layers.at(index); }

        // Get the amount of image layers.
        int GetNumImageLayers() const { return image_layers.size(); }

        // Get the whole collection of image layers.
        const std::vector< Tmx::ImageLayer* > &GetImageLayers() const { return image_layers; }

        // Find the tileset index for a tileset using a tile gid.
        int FindTilesetIndex(int gid) const;

        // Find a tileset for a specific gid.
        const Tmx::Tileset *FindTileset(int gid) const;

        // Get a tileset by an index.
        const Tmx::Tileset *GetTileset(int index) const { return tilesets.at(index); }

        // Get the amount of tilesets.
        int GetNumTilesets() const { return tilesets.size(); }

        // Get the collection of tilesets.
        const std::vector< Tmx::Tileset* > &GetTilesets() const { return tilesets; }

        // Get whether there was an error or not.
        bool HasError() const { return has_error; }

        // Get an error string containing the error in text format.
        const std::string &GetErrorText() const { return error_text; }

        // Get a number that identifies the error. (TMX_ preceded constants)
        unsigned char GetErrorCode() const { return error_code; }

        // Get the property set.
        const Tmx::PropertySet &GetProperties() const { return properties; }

    private:
        std::string file_name;
        std::string file_path;

        std::string background_color;

        double version;
        Tmx::MapOrientation orientation;
        Tmx::MapRenderOrder render_order;
        Tmx::MapStaggerAxis stagger_axis;
        Tmx::MapStaggerIndex stagger_index;

        int width;
        int height;
        int tile_width;
        int tile_height;
        int next_object_id;
        int hexside_length;

        std::vector< Tmx::Layer* > layers;
        std::vector< Tmx::TileLayer* > tile_layers;
        std::vector< Tmx::ImageLayer* > image_layers;
        std::vector< Tmx::ObjectGroup* > object_groups;
        std::vector< Tmx::Tileset* > tilesets;

        bool has_error;
        unsigned char error_code;
        std::string error_text;

        Tmx::PropertySet properties;

        // Parse a 'map' node.
        void Parse(tinyxml2::XMLNode *mapNode);
    };
}
