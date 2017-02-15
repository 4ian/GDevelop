/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasOptions.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

void ExternalLayout::UnserializeFrom(const SerializerElement & element)
{
	name = element.GetStringAttribute("name", "", "Name");
	instances.UnserializeFrom(element.GetChild("instances", 0, "Instances"));
	#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
	editionSettings.UnserializeFrom(element.GetChild("editionSettings"));
	#endif
	associatedLayout = element.GetStringAttribute("associatedLayout");
}

#if defined(GD_IDE_ONLY)
void ExternalLayout::SerializeTo(SerializerElement & element) const
{
	element.SetAttribute("name", name);
	instances.SerializeTo(element.AddChild("instances"));
	#if !defined(GD_NO_WX_GUI)
	editionSettings.SerializeTo(element.AddChild("editionSettings"));
	#endif
	element.SetAttribute("associatedLayout", associatedLayout);
}
#endif

}
