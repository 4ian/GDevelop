/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ScenePhysicsDatas.h"
#include "GDCore/Serialization/SerializerElement.h"

#if defined(GD_IDE_ONLY)
void ScenePhysicsDatas::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("gravityX", gravityX);
    element.SetAttribute("gravityY", gravityY);
    element.SetAttribute("scaleX", scaleX);
    element.SetAttribute("scaleY", scaleY);
}

#endif

void ScenePhysicsDatas::UnserializeFrom(const gd::SerializerElement & element)
{
    gravityX = element.GetDoubleAttribute("gravityX");
    gravityY = element.GetDoubleAttribute("gravityY");
    scaleX = element.GetDoubleAttribute("scaleX");
    scaleY = element.GetDoubleAttribute("scaleY");
}
