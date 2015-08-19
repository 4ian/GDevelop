/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ScenePathDatas.h"
#include "PathBehavior.h"
#include "GDCore/Serialization/SerializerElement.h"

#if defined(GD_IDE_ONLY)
void ScenePathDatas::SerializeTo(gd::SerializerElement & element) const
{
    gd::SerializerElement & pathsElement = element.AddChild("paths");
    pathsElement.ConsiderAsArrayOf("path");
    for(std::map<gd::String, std::vector<sf::Vector2f> >::const_iterator it = globalPaths.begin(); it != globalPaths.end(); it++)
    {
        gd::SerializerElement & pathElement = pathsElement.AddChild("path");

        pathElement.SetAttribute("name", it->first);
        pathElement.SetAttribute("coords", PathBehavior::GetStringFromCoordsVector(it->second, '/', ';'));
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

        globalPaths[pathElement.GetStringAttribute("name")] = PathBehavior::GetCoordsVectorFromString(pathElement.GetStringAttribute("coords"), '/', ';');
    }

}
