/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "EditorSettings.h"

namespace gd {

EditorSettings::EditorSettings() {}

void EditorSettings::SerializeTo(SerializerElement& element) const {
  element = content;
}

void EditorSettings::UnserializeFrom(
    const SerializerElement& element) {
  content = element;
}

}  // namespace gd
#endif
