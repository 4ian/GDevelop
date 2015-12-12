//-----------------------------------------------------------------------------
// TmxMap.cpp
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
#include "tinyxml2.h"
#include <stdio.h>

#include "TmxMap.h"
#include "TmxTileset.h"
#include "TmxLayer.h"
#include "TmxTileLayer.h"
#include "TmxObjectGroup.h"
#include "TmxImageLayer.h"

using std::vector;
using std::string;

namespace Tmx 
{
    Map::Map() 
        : file_name()
        , file_path()
        , background_color()
        , version(0.0)
        , orientation(TMX_MO_ORTHOGONAL)
        , render_order(TMX_RIGHT_DOWN)
        , stagger_axis(TMX_SA_NONE)
        , stagger_index(TMX_SI_NONE)
        , width(0)
        , height(0)
        , tile_width(0)
        , tile_height(0)
        , next_object_id(0)
        , hexside_length(0)
        , layers()
        , tile_layers()
        , object_groups()
        , tilesets() 
        , has_error(false)
        , error_code(0)
        , error_text()
    {}

    Map::~Map() 
    {
        // Iterate through all of the object groups and delete each of them.
        vector< ObjectGroup* >::iterator ogIter;
        for (ogIter = object_groups.begin(); ogIter != object_groups.end(); ++ogIter) 
        {
            ObjectGroup *objectGroup = (*ogIter);
            
            if (objectGroup)
            {
                delete objectGroup;
                objectGroup = NULL;
            }
        }

        // Iterate through all of the tile layers and delete each of them.
        vector< TileLayer* >::iterator tlIter;
        for (tlIter = tile_layers.begin(); tlIter != tile_layers.end(); ++tlIter) 
        {
            TileLayer *layer = (*tlIter);

            if (layer) 
            {
                delete layer;
                layer = NULL;
            }
        }

        // Iterate through all of the image layers and delete each of them.
        vector< ImageLayer* >::iterator ilIter;
        for (ilIter = image_layers.begin(); ilIter != image_layers.end(); ++ilIter) 
        {
            ImageLayer *layer = (*ilIter);

            if (layer) 
            {
                delete layer;
                layer = NULL;
            }
        }

        // Iterate through all of the tilesets and delete each of them.
        vector< Tileset* >::iterator tsIter;
        for (tsIter = tilesets.begin(); tsIter != tilesets.end(); ++tsIter) 
        {
            Tileset *tileset = (*tsIter);
            
            if (tileset) 
            {
                delete tileset;
                tileset = NULL;
            }
        }
    }

    void Map::ParseFile(const string &fileName) 
    {
        file_name = fileName;

        int lastSlash = fileName.find_last_of("/");

        // Get the directory of the file using substring.
        if (lastSlash > 0) 
        {
            file_path = fileName.substr(0, lastSlash + 1);
        } 
        else 
        {
            file_path = "";
        }

        // Create a tiny xml document and use it to parse the text.
        tinyxml2::XMLDocument doc;
        doc.LoadFile( fileName.c_str() );

        // Check for parsing errors.
        if (doc.Error())
        {
            has_error = true;
            error_code = TMX_PARSING_ERROR;
            error_text = doc.GetErrorStr1();
            return;
        }

        tinyxml2::XMLNode *mapNode = doc.FirstChildElement("map");
        Parse( mapNode );
    }

    void Map::ParseText(const string &text) 
    {
        // Create a tiny xml document and use it to parse the text.
        tinyxml2::XMLDocument doc;
        doc.Parse(text.c_str());
    
        // Check for parsing errors.
        if (doc.Error()) 
        {
            has_error = true;
            error_code = TMX_PARSING_ERROR;
            error_text = doc.GetErrorStr1();
            return;
        }

        tinyxml2::XMLNode *mapNode = doc.FirstChildElement("map");
        Parse( mapNode );
    }

    int Map::FindTilesetIndex(int gid) const
    {
        // Clean up the flags from the gid (thanks marwes91).
        gid &= ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedDiagonallyFlag);

        for (int i = tilesets.size() - 1; i > -1; --i) 
        {
            // If the gid beyond the tileset gid return its index.
            if (gid >= tilesets[i]->GetFirstGid()) 
            {
                return i;
            }
        }
        
        return -1;
    }

    const Tileset *Map::FindTileset(int gid) const 
    {
        for (int i = tilesets.size() - 1; i > -1; --i) 
        {
            // If the gid beyond the tileset gid return it.
            if (gid >= tilesets[i]->GetFirstGid()) 
            {
                return tilesets[i];
            }
        }
        
        return NULL;
    }

    void Map::Parse(tinyxml2::XMLNode *mapNode)
    {
        tinyxml2::XMLElement* mapElem = mapNode->ToElement();

        // Read the map attributes.
        version = mapElem->IntAttribute("version");
        width = mapElem->IntAttribute("width");
        height = mapElem->IntAttribute("height");
        tile_width = mapElem->IntAttribute("tilewidth");
        tile_height = mapElem->IntAttribute("tileheight");
        next_object_id = mapElem->IntAttribute("nextobjectid");

        if (mapElem->Attribute("backgroundcolor"))
        {
            background_color = mapElem->Attribute("backgroundcolor");
        }

        // Read the orientation
        std::string orientationStr = mapElem->Attribute("orientation");

        if (!orientationStr.compare("orthogonal"))
        {
            orientation = TMX_MO_ORTHOGONAL;
        } 
        else if (!orientationStr.compare("isometric"))
        {
            orientation = TMX_MO_ISOMETRIC;
        }
        else if (!orientationStr.compare("staggered"))
        {
            orientation = TMX_MO_STAGGERED;
        }
        else if (!orientationStr.compare("hexagonal"))
        {
            orientation = TMX_MO_HEXAGONAL;
        }

        // Read the render order
        if (mapElem->Attribute("renderorder"))
        {
            std::string renderorderStr = mapElem->Attribute("renderorder");
            if (!renderorderStr.compare("right-down")) 
            {
                render_order = TMX_RIGHT_DOWN;
            } 
            else if (!renderorderStr.compare("right-up")) 
            {
                render_order = TMX_RIGHT_UP;
            }
            else if (!renderorderStr.compare("left-down")) 
            {
                render_order = TMX_LEFT_DOWN;
            }
            else if (!renderorderStr.compare("left-down")) 
            {
                render_order = TMX_LEFT_UP;
            }        
        }

        // Read the stagger axis
        if (mapElem->Attribute("staggeraxis"))
        {
            std::string staggerAxisStr = mapElem->Attribute("staggeraxis");
            if (!staggerAxisStr.compare("x"))
            {
                stagger_axis = TMX_SA_X;
            }
            else if (!staggerAxisStr.compare("y"))
            {
                stagger_axis = TMX_SA_Y;
            }
        }

        // Read the stagger index
        if (mapElem->Attribute("staggerindex"))
        {
            std::string staggerIndexStr = mapElem->Attribute("staggerindex");
            if (!staggerIndexStr.compare("even"))
            {
                stagger_index = TMX_SI_EVEN;
            }
            else if (!staggerIndexStr.compare("odd"))
            {
                stagger_index = TMX_SI_ODD;
            }
        }

        // read the hexside length
        if (mapElem->IntAttribute("hexsidelength"))
        {
            hexside_length = mapElem->IntAttribute("hexsidelength");
        }

        // read all other attributes
        const tinyxml2::XMLNode *node = mapElem->FirstChild();
        while( node )
        {
            // Read the map properties.
            if( strcmp( node->Value(), "properties" ) == 0 )
            {
                properties.Parse(node);         
            }

            // Iterate through all of the tileset elements.
            if( strcmp( node->Value(), "tileset" ) == 0 )
            {
                // Allocate a new tileset and parse it.
                Tileset *tileset = new Tileset();
                tileset->Parse(node->ToElement(), file_path);

                // Add the tileset to the list.
                tilesets.push_back(tileset);
            }

            // Iterate through all of the "layer" (tile layer) elements.           
            if( strcmp( node->Value(), "layer" ) == 0 )
            {
                // Allocate a new tile layer and parse it.
                TileLayer *tileLayer = new TileLayer(this);
                tileLayer->Parse(node);

                // Add the tile layer to the lists.
                tile_layers.push_back(tileLayer);
                layers.push_back(tileLayer);
            }

            // Iterate through all of the "imagelayer" (image layer) elements.            
            if( strcmp( node->Value(), "imagelayer" ) == 0 )
            {
                // Allocate a new image layer and parse it.
                ImageLayer *imageLayer = new ImageLayer(this);
                imageLayer->Parse(node);

                // Add the image layer to the lists.
                image_layers.push_back(imageLayer);
                layers.push_back(imageLayer);
            }

            // Iterate through all of the "objectgroup" (object layer) elements.
            if( strcmp( node->Value(), "objectgroup" ) == 0 )
            {
                // Allocate a new object group and parse it.
                ObjectGroup *objectGroup = new ObjectGroup(this);
                objectGroup->Parse(node);
        
                // Add the object group to the lists.
                object_groups.push_back(objectGroup);
                layers.push_back(objectGroup);
            }

            node = node->NextSibling();
        }
    }
}
