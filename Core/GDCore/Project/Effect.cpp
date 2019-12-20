/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/Effect.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

#if defined(GD_IDE_ONLY)
void Effect::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetName());
  element.SetAttribute("effectType", GetEffectType());
  SerializerElement& doubleParametersElement =
      element.AddChild("doubleParameters");
  for (auto& parameter : doubleParameters)
    doubleParametersElement.AddChild(parameter.first)
        .SetValue(parameter.second);
  SerializerElement& stringParametersElement =
      element.AddChild("stringParameters");
  for (auto& parameter : stringParameters)
    stringParametersElement.AddChild(parameter.first)
        .SetValue(parameter.second);
}
#endif

void Effect::UnserializeFrom(const SerializerElement& element) {
  SetName(element.GetStringAttribute("name"));
  SetEffectType(element.GetStringAttribute(
      "effectType",
      "",
      // Compatibility with GD <= 5.0.0-beta83
      "effectName"
      // end of compatibility code
      ));

  doubleParameters.clear();
  const SerializerElement& doubleParametersElement =
      element.GetChild("doubleParameters",
                       0,
                       // Compatibility with GD <= 5.0.0-beta83
                       "parameters"
                       // end of compatibility code
      );
  for (auto& child : doubleParametersElement.GetAllChildren())
    SetDoubleParameter(child.first, child.second->GetValue().GetDouble());

  stringParameters.clear();
  const SerializerElement& stringParametersElement =
      element.GetChild("stringParameters");
  for (auto& child : stringParametersElement.GetAllChildren())
    SetStringParameter(child.first, child.second->GetValue().GetString());
}

}  // namespace gd
