/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/ExternalLayout.h"
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasOptions.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

void ExternalLayout::UnserializeFrom(const SerializerElement & element)
{
	name = element.GetStringAttribute("name", "", "Name");
	instances.UnserializeFrom(element.GetChild("instances", 0, "Instances"));
}

#if defined(GD_IDE_ONLY)
void ExternalLayout::SerializeTo(SerializerElement & element) const
{
	element.SetAttribute("name", name);
	instances.SerializeTo(element.AddChild("instances"));
}
#endif

}
