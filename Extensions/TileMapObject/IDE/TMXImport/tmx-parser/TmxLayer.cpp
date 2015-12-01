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
#include "TmxUtil.h"
#include "TmxMap.h"
#include "TmxTileset.h"

int Tmx::Layer::nextParseOrder = 0;

namespace Tmx 
{
    Layer::Layer(const Tmx::Map *_map, const std::string _name, const int _x, const int _y, const int _width, const int _height, const float _opacity, const bool _visible, const LayerType _layerType) 
        : map(_map)
        , name(_name)
        , x(_x)
        , y(_y)
        , width(_width)
        , height(_height)
        , opacity(_opacity)
        , visible(_visible)
        , zOrder(nextParseOrder)
        , parseOrder(nextParseOrder)
        , layerType(_layerType)
        , properties()
    {
        ++nextParseOrder;
    }

    Layer::~Layer() 
    {
    }
}
