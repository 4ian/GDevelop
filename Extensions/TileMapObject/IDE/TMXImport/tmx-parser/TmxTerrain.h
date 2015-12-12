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
#pragma once

#include <vector>

#include "TmxPropertySet.h"

namespace tinyxml2
{
    class XMLNode;
}

namespace Tmx
{
    //-------------------------------------------------------------------------
    // Class to contain information about every terrain in the
    // tileset/terraintypes element.
    // This class also contains a property set.
    //-------------------------------------------------------------------------
    class Terrain
    {
    public:
        Terrain();
        ~Terrain();

        // Parse a terrain type node.
        void Parse(const tinyxml2::XMLNode *terrainNode);

        // Get the name of the terrain type.
        const std::string &GetName() const { return name; }

        // Get the local tile-id of the tile that represents the terrain type visually.
        int GetTileId() const
        {
            return tileID;
        }

        // Get a set of properties regarding the terrain type.
        const Tmx::PropertySet &GetProperties() const
        {
            return properties;
        }

    private:
        std::string name;
        int tileID;

        Tmx::PropertySet properties;
    };
}
