//-----------------------------------------------------------------------------
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
//-----------------------------------------------------------------------------
#include "tinyxml2.h"
#include <algorithm>

#ifdef USE_MINIZ
#define MINIZ_HEADER_FILE_ONLY
#include "miniz.c"
#else
#include <zlib.h>
#endif

#include <stdlib.h>
#include <stdio.h>

#include "TmxLayer.h"
#include "TmxTileLayer.h"
#include "TmxUtil.h"
#include "TmxMap.h"
#include "TmxTileset.h"

namespace Tmx 
{
    TileLayer::TileLayer(const Map *_map) 
        : Layer(_map, std::string(), 0, 0, _map->GetWidth(), _map->GetHeight(), 1.0f, true, TMX_LAYERTYPE_TILE)
        , tile_map(NULL)  // Set the map to null to specify that it is not yet allocated.
        , encoding(TMX_ENCODING_XML)
        , compression(TMX_COMPRESSION_NONE)
    {
    }

    TileLayer::~TileLayer() 
    {
        // If the tile map is allocated, delete it from the memory.
        if (tile_map)
        {
            delete [] tile_map;
            tile_map = NULL;
        }
    }

    void TileLayer::Parse(const tinyxml2::XMLNode *tileLayerNode) 
    {
        const tinyxml2::XMLElement *tileLayerElem = tileLayerNode->ToElement();
    
        // Read the attributes.
        name = tileLayerElem->Attribute("name");

        tileLayerElem->QueryIntAttribute("x", &x);
        tileLayerElem->QueryIntAttribute("y", &y);

        tileLayerElem->QueryFloatAttribute("opacity", &opacity);
        tileLayerElem->QueryBoolAttribute("visible", &visible);

        // Read the properties.
        const tinyxml2::XMLNode *propertiesNode = tileLayerNode->FirstChildElement("properties");
        if (propertiesNode) 
        {
            properties.Parse(propertiesNode);
        }

        // Allocate memory for reading the tiles.
        tile_map = new MapTile[width * height];

        //const tinyxml2::XMLNode *dataNode = tileLayerNode->FirstChildElement("data");
        const tinyxml2::XMLElement *dataElem = tileLayerNode->FirstChildElement("data");

        const char *encodingStr = dataElem->Attribute("encoding");
        const char *compressionStr = dataElem->Attribute("compression");

        // Check for encoding.
        if (encodingStr) 
        {
            if (!strcmp(encodingStr, "base64")) 
            {
                encoding = TMX_ENCODING_BASE64;
            } 
            else if (!strcmp(encodingStr, "csv")) 
            {
                encoding = TMX_ENCODING_CSV;
            }
        }

        // Check for compression.
        if (compressionStr) 
        {
            if (!strcmp(compressionStr, "gzip")) 
            {
                compression = TMX_COMPRESSION_GZIP;
            } 
            else if (!strcmp(compressionStr, "zlib")) 
            {
                compression = TMX_COMPRESSION_ZLIB;
            }
        }
        
        // Decode.
        switch (encoding) 
        {
        case TMX_ENCODING_XML:
            ParseXML(dataElem);
            break;

        case TMX_ENCODING_BASE64:
            ParseBase64(dataElem->GetText());
            break;

        case TMX_ENCODING_CSV:
            ParseCSV(dataElem->GetText());
            break;
        }
    }

    void TileLayer::ParseXML(const tinyxml2::XMLNode *dataNode) 
    {
        const tinyxml2::XMLNode *tileNode = dataNode->FirstChildElement("tile");
        int tileCount = 0;

        while (tileNode) 
        {
            const tinyxml2::XMLElement *tileElem = tileNode->ToElement();
            
            unsigned gid = 0;

            // Read the Global-ID of the tile.
            const char* gidText = tileElem->Attribute("gid");

            // Convert to an unsigned.
            sscanf(gidText, "%u", &gid);

            // Find the tileset index.
            const int tilesetIndex = map->FindTilesetIndex(gid);
            if (tilesetIndex != -1)
            {
                // If valid, set up the map tile with the tileset.
                const Tmx::Tileset* tileset = map->GetTileset(tilesetIndex);
                tile_map[tileCount] = MapTile(gid, tileset->GetFirstGid(), tilesetIndex);
            }
            else
            {
                // Otherwise, make it null.
                tile_map[tileCount] = MapTile(gid, 0, -1);
            }

            //tileNode = dataNode->IterateChildren("tile", tileNode); FIXME MAYBE
            tileNode = tileNode->NextSiblingElement("tile");
            tileCount++;
        }
    }

    void TileLayer::ParseBase64(const std::string &innerText) 
    {
    	std::string testText = innerText;
    	Util::Trim( testText );

        const std::string &text = Util::DecodeBase64(testText);

        // Temporary array of gids to be converted to map tiles.
        unsigned *out = 0;

        if (compression == TMX_COMPRESSION_ZLIB) 
        {
            // Use zlib to uncompress the tile layer into the temporary array of tiles.
            uLongf outlen = width * height * 4;
            out = (unsigned *)malloc(outlen);
            uncompress(
                (Bytef*)out, &outlen, 
                (const Bytef*)text.c_str(), text.size());
    
        } 
        else if (compression == TMX_COMPRESSION_GZIP) 
        {
            // Use the utility class for decompressing (which uses zlib)
            out = (unsigned *)Util::DecompressGZIP(
                text.c_str(), 
                text.size(), 
                width * height * 4);
        } 
        else 
        {
            out = (unsigned *)malloc(text.size());
        
            // Copy every gid into the temporary array since
            // the decoded string is an array of 32-bit integers.
            memcpy(out, text.c_str(), text.size());
        }

        // Convert the gids to map tiles.
        for (int x = 0; x < width; x++)
        {
            for (int y = 0; y < height; y++)
            {
                unsigned gid = out[y * width + x];

                // Find the tileset index.
                const int tilesetIndex = map->FindTilesetIndex(gid);
                if (tilesetIndex != -1)
                {
                    // If valid, set up the map tile with the tileset.
                    const Tmx::Tileset* tileset = map->GetTileset(tilesetIndex);
                    tile_map[y * width + x] = MapTile(gid, tileset->GetFirstGid(), tilesetIndex);
                }
                else
                {
                    // Otherwise, make it null.
                    tile_map[y * width + x] = MapTile(gid, 0, -1);
                }
            }
        }

        // Free the temporary array from memory.
        free(out);
    }

    void TileLayer::ParseCSV(const std::string &innerText) 
    {
        // Duplicate the string for use with C stdio.
        char *csv = strdup(innerText.c_str());
        
        // Iterate through every token of ';' in the CSV string.
        char *pch = strtok(csv, ",");
        int tileCount = 0;
        
        while (pch) 
        {
            unsigned gid;
            sscanf(pch, "%u", &gid);

            // Find the tileset index.
            const int tilesetIndex = map->FindTilesetIndex(gid);
            if (tilesetIndex != -1)
            {
                // If valid, set up the map tile with the tileset.
                const Tmx::Tileset* tileset = map->GetTileset(tilesetIndex);
                tile_map[tileCount] = MapTile(gid, tileset->GetFirstGid(), tilesetIndex);
            }
            else
            {
                // Otherwise, make it null.
                tile_map[tileCount] = MapTile(gid, 0, -1);
            }

            pch = strtok(NULL, ",");
            tileCount++;
        }

        free(csv);
    }
}
