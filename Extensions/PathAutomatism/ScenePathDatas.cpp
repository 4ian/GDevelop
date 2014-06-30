/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDCore/Serialization/SerializerElement.h"

#if defined(GD_IDE_ONLY)
void ScenePathDatas::SerializeTo(gd::SerializerElement & element) const
{
    gd::SerializerElement & pathsElement = element.AddChild("paths");
    pathsElement.ConsiderAsArrayOf("path");
    for(std::map<std::string, std::vector<sf::Vector2f> >::const_iterator it = globalPaths.begin(); it != globalPaths.end(); it++)
    {
        gd::SerializerElement & pathElement = pathsElement.AddChild("path");

        pathElement.SetAttribute("name", it->first);
        pathElement.SetAttribute("coords", PathAutomatism::GetStringFromCoordsVector(it->second, '/', ';'));
    }
}
#endif

void ScenePathDatas::UnserializeFrom(const gd::SerializerElement & element)
{
    globalPaths.clear();

    if (!element.HasChild("paths", "Paths")) return;

    const gd::SerializerElement & pathsElement = element.GetChild("paths", 0, "Paths");
    pathsElement.ConsiderAsArrayOf("path", "Path");
    for (int i = 0; i < pathsElement.GetChildrenCount(); ++i)
    {
        const gd::SerializerElement & pathElement = pathsElement.GetChild(i);

        globalPaths[pathElement.GetStringAttribute("name")] = PathAutomatism::GetCoordsVectorFromString(pathElement.GetStringAttribute("coords"), '/', ';');
    }

}