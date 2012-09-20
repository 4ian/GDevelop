/**

Game Develop - Light Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "SceneLightObstacleDatas.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/XmlMacros.h"
#include <iostream>

#if defined(GD_IDE_ONLY)
void SceneLightObstacleDatas::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("gridWidth", gridWidth);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("gridHeight", gridHeight);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("diagonalMove", diagonalMove);
}
#endif

void SceneLightObstacleDatas::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("gridWidth", gridWidth);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("gridHeight", gridHeight);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("diagonalMove", diagonalMove);
}

