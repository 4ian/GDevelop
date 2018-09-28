/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsFunction.h"
#include <vector>
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

EventsFunction::EventsFunction() {}

void EventsFunction::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);
  element.SetAttribute("description", description);
  events.SerializeTo(element.AddChild("events"));

  gd::SerializerElement& parametersElement = element.AddChild("parameters");
  parametersElement.ConsiderAsArrayOf("parameter");
  for (const auto& parameter : parameters) {
    parameter.SerializeTo(parametersElement.AddChild("parameter"));
  }
}

void EventsFunction::UnserializeFrom(gd::Project& project,
                                     const SerializerElement& element) {
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");
  description = element.GetStringAttribute("description");
  events.UnserializeFrom(project, element.GetChild("events"));

  const gd::SerializerElement& parametersElement =
      element.GetChild("parameters");
  parameters.clear();
  parametersElement.ConsiderAsArrayOf("parameter");
  for (std::size_t i = 0; i < parametersElement.GetChildrenCount(); ++i) {
    ParameterMetadata parameter;
    parameter.UnserializeFrom(parametersElement.GetChild(i));
    parameters.push_back(parameter);
  }
}

}  // namespace gd

#endif
