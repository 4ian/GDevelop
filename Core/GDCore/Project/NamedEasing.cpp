/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/NamedEasing.h"

#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

NamedEasing::NamedEasing() {}

void NamedEasing::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  SerializerElement& cubicBezierElement = element.AddChild("cubicBezier");
  cubicBezierElement.ConsiderAsArray();
  cubicBezierElement.AddChild("").SetDoubleValue(x1);
  cubicBezierElement.AddChild("").SetDoubleValue(y1);
  cubicBezierElement.AddChild("").SetDoubleValue(x2);
  cubicBezierElement.AddChild("").SetDoubleValue(y2);
}

void NamedEasing::UnserializeFrom(const SerializerElement& element) {
  name = element.GetStringAttribute("name");
  if (!element.HasChild("cubicBezier")) return;

  const SerializerElement& cubicBezierElement = element.GetChild("cubicBezier");
  cubicBezierElement.ConsiderAsArray();
  if (cubicBezierElement.GetChildrenCount() != 4) return;

  x1 = cubicBezierElement.GetChild(0).GetDoubleValue();
  y1 = cubicBezierElement.GetChild(1).GetDoubleValue();
  x2 = cubicBezierElement.GetChild(2).GetDoubleValue();
  y2 = cubicBezierElement.GetChild(3).GetDoubleValue();
}

}  // namespace gd
