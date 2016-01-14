/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "SceneNetworkDatas.h"
#include "GDCore/Serialization/SerializerElement.h"

#if defined(GD_IDE_ONLY)
void SceneNetworkDatas::SerializeTo(gd::SerializerElement & element) const
{
}
#endif

void SceneNetworkDatas::UnserializeFrom(const gd::SerializerElement & element)
{
}
