//-----------------------------------------------------------------------------
// TmxObject.cpp
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

#include "TmxObject.h"
#include "TmxPolygon.h"
#include "TmxPolyline.h"
#include "TmxEllipse.h"

namespace Tmx 
{
    Object::Object() 
        : name()
        , type()
        , x(0)
        , y(0)
        , width(0)
        , height(0)
        , gid(0)
        , id(0)
        , rotation(0.0)
        , visible(true)
        , ellipse(0)
        , polygon(0)
        , polyline(0)
        , properties() 
    {}

    Object::~Object() 
    {
        if (ellipse != 0)
        {
            delete ellipse;
            ellipse = 0;
        }
        if (polygon != 0)
        {
            delete polygon;
            polygon = 0;
        }
        if (polyline != 0)
        {
            delete polyline;
            polyline = 0;
        }
    }

    void Object::Parse(const tinyxml2::XMLNode *objectNode) 
    {
        const tinyxml2::XMLElement *objectElem = objectNode->ToElement();

        // Read the attributes of the object.
        const char *tempName = objectElem->Attribute("name");
        const char *tempType = objectElem->Attribute("type");
        
        if (tempName) name = tempName;
        if (tempType) type = tempType;

        id = objectElem->IntAttribute("id");
        x = objectElem->IntAttribute("x");
        y = objectElem->IntAttribute("y");
        width = objectElem->IntAttribute("width");
        height = objectElem->IntAttribute("height");
        gid = objectElem->IntAttribute("gid");
        rotation = objectElem->IntAttribute("rotation");
        objectElem->QueryBoolAttribute("visible", &visible);

        // Read the ellipse of the object if there are any.
        const tinyxml2::XMLNode *ellipseNode = objectNode->FirstChildElement("ellipse");
        if (ellipseNode)
        {
            if (ellipse != 0)
                delete ellipse;

            ellipse = new Ellipse(x,y,width,height);            
        }

        // Read the Polygon and Polyline of the object if there are any.
        const tinyxml2::XMLNode *polygonNode = objectNode->FirstChildElement("polygon");
        if (polygonNode)
        {
            if (polygon != 0)
                delete polygon;

            polygon = new Polygon();
            polygon->Parse(polygonNode);
        }
        const tinyxml2::XMLNode *polylineNode = objectNode->FirstChildElement("polyline");
        if (polylineNode)
        {
            if (polyline != 0)
                delete polyline;

            polyline = new Polyline();
            polyline->Parse(polylineNode);
        }

        // Read the properties of the object.
        const tinyxml2::XMLNode *propertiesNode = objectNode->FirstChildElement("properties");
        if (propertiesNode) 
        {
            properties.Parse(propertiesNode);
        }
    }
}
