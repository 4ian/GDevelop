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
#include <cstdlib>

#include "TmxLayer.h"
#include "TmxImageLayer.h"
#include "TmxImage.h"

using std::vector;
using std::string;

namespace Tmx 
{
    ImageLayer::ImageLayer(const Tmx::Map *_map) 
        : Layer(_map, std::string(), 0, 0, 0, 0, 1.0f, true, TMX_LAYERTYPE_IMAGE_LAYER)
        , image(NULL)
    {
    }

    ImageLayer::~ImageLayer() 
    {
        delete image;
    }

    void ImageLayer::Parse(const tinyxml2::XMLNode *imageLayerNode) 
    {
        const tinyxml2::XMLElement *imageLayerElem = imageLayerNode->ToElement();

        // Read all the attributes into local variables.
        name = imageLayerElem->Attribute("name");

        imageLayerElem->QueryIntAttribute("x", &x);
        imageLayerElem->QueryIntAttribute("y", &y);

        imageLayerElem->QueryFloatAttribute("opacity", &opacity);
        imageLayerElem->QueryBoolAttribute("visible", &visible);

        // Parse the image.
        const tinyxml2::XMLNode *imageNode = imageLayerElem->FirstChildElement("image");
        
        if (imageNode) 
        {
            image = new Image();
            image->Parse(imageNode);
        }

        // Parse the properties if any.
        const tinyxml2::XMLNode *propertiesNode = imageLayerElem->FirstChildElement("properties");
        
        if (propertiesNode) 
        {
            properties.Parse(propertiesNode);
        }
    }

}
