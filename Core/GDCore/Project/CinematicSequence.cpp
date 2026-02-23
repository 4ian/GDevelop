/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "CinematicSequence.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

void CinematicSequence::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("sequenceData", sequenceData);
  element.SetAttribute("associatedLayout", associatedLayout);
}

void CinematicSequence::UnserializeFrom(gd::Project& project,
                                        const SerializerElement& element) {
  name = element.GetStringAttribute("name", "", "Name");
  sequenceData = element.GetStringAttribute("sequenceData", "");
  associatedLayout = element.GetStringAttribute("associatedLayout", "", "AssociatedLayout");
}

}  // namespace gd
