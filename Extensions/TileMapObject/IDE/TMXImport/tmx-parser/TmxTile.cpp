//-----------------------------------------------------------------------------
// TmxTile.cpp
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

#include "TmxTile.h"
#include "TmxObject.h"

namespace Tmx
{
    Tile::Tile() :
            id(0), properties(), isAnimated(false),hasObjects(false), totalDuration(0)
    {
    }
    Tile::Tile(int id) :
            id(id), properties(), isAnimated(false),hasObjects(false), totalDuration(0)
    {
    }

    Tile::~Tile()
    {
    }

    void Tile::Parse(const tinyxml2::XMLNode *tileNode)
    {
        const tinyxml2::XMLElement *tileElem = tileNode->ToElement();

        // Parse the attributes.
        id = tileElem->IntAttribute("id");

        // Parse the properties if any.
        const tinyxml2::XMLNode *propertiesNode = tileNode->FirstChildElement(
                "properties");

        if (propertiesNode)
        {
            properties.Parse(propertiesNode);
        }

        // Parse the animation if there is one.
        const tinyxml2::XMLNode *animationNode = tileNode->FirstChildElement(
                "animation");

        if (animationNode)
        {
            isAnimated = true;

            const tinyxml2::XMLNode *frameNode =
                    animationNode->FirstChildElement("frame");
            unsigned int durationSum = 0;

            while (frameNode != NULL)
            {
                const tinyxml2::XMLElement *frameElement =
                        frameNode->ToElement();

                const int tileID = frameElement->IntAttribute("tileid");
                const unsigned int duration = frameElement->IntAttribute(
                        "duration");

                frames.push_back(AnimationFrame(tileID, duration));
                durationSum += duration;

                frameNode = frameNode->NextSiblingElement("frame");
            }

            totalDuration = durationSum;
        }

        const tinyxml2::XMLNode *collisionNode = tileNode->FirstChildElement(
                "objectgroup");
        if (collisionNode)
        {
            const tinyxml2::XMLNode *objectNode =
                    collisionNode->FirstChildElement("object");
            hasObjects = true;

            while (objectNode != NULL)
            {
                const tinyxml2::XMLElement *objectElement =
                        objectNode->ToElement();

                Object *object = new Object();
                object->Parse(objectElement);

                objects.push_back(object);

                objectNode = objectNode->NextSiblingElement("object");
            }
        }

    }
}
