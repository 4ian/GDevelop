/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/EditorSettings.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"

namespace gd {

void ExternalLayout::UnserializeFrom(const SerializerElement& element) {
  name = element.GetStringAttribute("name", "", "Name");
  instances.UnserializeFrom(element.GetChild("instances", 0, "Instances"));
#if defined(GD_IDE_ONLY)
  editorSettings.UnserializeFrom(element.GetChild("editionSettings"));
#endif
  associatedLayout = element.GetStringAttribute("associatedLayout");
}

#if defined(GD_IDE_ONLY)
void ExternalLayout::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  instances.SerializeTo(element.AddChild("instances"));
  editorSettings.SerializeTo(element.AddChild("editionSettings"));
  element.SetAttribute("associatedLayout", associatedLayout);
}
#endif

}  // namespace gd
