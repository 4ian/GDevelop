/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "Watermark.h"

#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

Watermark::Watermark() : showWatermark(true), placement("bottom-left"){};

void Watermark::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("showWatermark", showWatermark);
  element.SetAttribute("placement", placement);
}

void Watermark::UnserializeFrom(const SerializerElement& element) {
  showWatermark = element.GetBoolAttribute("showWatermark", true);
  placement = element.GetStringAttribute("placement", "bottom-left");
}
}  // namespace gd
