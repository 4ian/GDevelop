/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#include "GDCore/Project/SourceFile.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

SourceFile::SourceFile() : gdManaged(false) {
  // ctor
}

SourceFile::~SourceFile() {
  // dtor
}

void SourceFile::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("filename", filename);
  element.SetAttribute("language", language);
  element.SetAttribute("gdManaged", gdManaged);
}

void SourceFile::UnserializeFrom(const SerializerElement& element) {
  filename = element.GetStringAttribute("filename");
  language = element.GetStringAttribute("language", "C++");
  gdManaged = element.GetBoolAttribute("gdManaged");
}

}  // namespace gd

#endif
