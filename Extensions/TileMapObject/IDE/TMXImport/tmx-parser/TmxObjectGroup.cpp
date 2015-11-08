//-----------------------------------------------------------------------------
// TmxObjectGroup.cpp
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

#include "TmxLayer.h"
#include "TmxObjectGroup.h"
#include "TmxObject.h"

namespace Tmx 
{
    ObjectGroup::ObjectGroup(const Tmx::Map *_map)
        : Layer(_map, std::string(), 0, 0, 0, 0, 1.0f, true, TMX_LAYERTYPE_OBJECTGROUP)
        , color()
        , objects()
    {}

    ObjectGroup::~ObjectGroup() 
    {
        for(std::size_t i = 0; i < objects.size(); i++)
        {
            Object *obj = objects.at(i);
            delete obj;
        }
    }

    void ObjectGroup::Parse(const tinyxml2::XMLNode *objectGroupNode) 
    {
        const tinyxml2::XMLElement *objectGroupElem = objectGroupNode->ToElement();

        // Read the object group attributes.
        name = objectGroupElem->Attribute("name");

        if (objectGroupElem->Attribute("color"))
        {
            color = objectGroupElem->Attribute("color");
        }
        
        objectGroupElem->QueryFloatAttribute("opacity", &opacity);
        objectGroupElem->QueryBoolAttribute("visible", &visible);

        // Read the properties.
        const tinyxml2::XMLNode *propertiesNode = objectGroupNode->FirstChildElement("properties");
        if (propertiesNode) 
        {
            properties.Parse(propertiesNode);
        }

        // Iterate through all of the object elements.
        const tinyxml2::XMLNode *objectNode = objectGroupNode->FirstChildElement("object");
        while (objectNode) 
        {
            // Allocate a new object and parse it.
            Object *object = new Object();
            object->Parse(objectNode);
            
            // Add the object to the list.
            objects.push_back(object);

            //objectNode = objectGroupNode->IterateChildren("object", objectNode); -- FIXME MAYBE
            objectNode = objectNode->NextSiblingElement("object");
        }
    }

}
