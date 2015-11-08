//-----------------------------------------------------------------------------
// TmxImage.h
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

namespace tinyxml2 {
    class XMLNode;
}

namespace Tmx 
{
    //-------------------------------------------------------------------------
    // A class used for storing information about an image within a tileset.
    //-------------------------------------------------------------------------
    class Image 
    {
    public:
        Image();
        ~Image();

        // Parses an image element.
        void Parse(const tinyxml2::XMLNode *imageNode);

        // Get the path to the file of the image (relative to the map)
        const std::string &GetSource() const { return source; }

        // Get the width of the image.
        int GetWidth() const { return width; }

        // Get the height of the image.
        int GetHeight() const { return height; }

        // Get the transparent color used in the image.
        const std::string &GetTransparentColor() const 
        { return transparent_color; }

    private:
        std::string source;
        int width;
        int height;
        std::string transparent_color;
    };
}
