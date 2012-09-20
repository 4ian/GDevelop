/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "ScenePathDatas.h"
#include "PathAutomatism.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/XmlMacros.h"

#if defined(GD_IDE_ONLY)
void ScenePathDatas::SaveToXml(TiXmlElement * elem) const
{
    TiXmlElement * pathElem = new TiXmlElement( "Paths" );
    elem->LinkEndChild( pathElem );

    for(std::map<std::string, std::vector<sf::Vector2f> >::const_iterator it = globalPaths.begin(); it != globalPaths.end(); it++)
    {
        TiXmlElement * str = new TiXmlElement( "Path" );
        pathElem->LinkEndChild( str );

        str->SetAttribute("name", it->first.c_str());
        str->SetAttribute("coords", PathAutomatism::GetStringFromCoordsVector(it->second, '/', ';').c_str());
    }
}
#endif

void ScenePathDatas::LoadFromXml(const TiXmlElement * elem)
{
    if(elem->FirstChildElement("Paths") == 0)
        return;

    globalPaths.clear();

    const TiXmlElement * childElem = elem->FirstChildElement("Paths")->FirstChildElement("Path");
    while(childElem )
    {
        if(childElem->ToElement()->Attribute("name") == NULL || childElem->ToElement()->Attribute("coords") == NULL)
            continue;

        globalPaths[childElem->ToElement()->Attribute("name")] = PathAutomatism::GetCoordsVectorFromString(childElem->ToElement()->Attribute("coords"), '/', ';');
        childElem = childElem->NextSiblingElement();
    }
}

