/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GroupEvent.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd {

GroupEvent::GroupEvent()
    : BaseEvent(), creationTime(0), colorR(74), colorG(176), colorB(228) {}

vector<gd::String> GroupEvent::GetAllSearchableStrings() const {
  vector<gd::String> allSearchableStrings;

  allSearchableStrings.push_back(name);

  return allSearchableStrings;
}

bool GroupEvent::ReplaceAllSearchableStrings(
    std::vector<gd::String> newSearchableString) {
  if (newSearchableString[0] == name) return false;
  SetName(newSearchableString[0]);
  return true;
}

void GroupEvent::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("source", source);
  element.SetAttribute("creationTime", (int)creationTime);
  element.SetAttribute("colorR", (int)colorR);
  element.SetAttribute("colorG", (int)colorG);
  element.SetAttribute("colorB", (int)colorB);
  gd::EventsListSerialization::SerializeEventsTo(events,
                                                 element.AddChild("events"));

  gd::SerializerElement& parametersElement = element.AddChild("parameters");
  parametersElement.ConsiderAsArrayOf("parameter");
  for (std::size_t i = 0; i < parameters.size(); ++i)
    parametersElement.AddChild("parameter").SetValue(parameters[i]);
}

void GroupEvent::UnserializeFrom(gd::Project& project,
                                 const SerializerElement& element) {
  name = element.GetStringAttribute("name");
  source = element.GetStringAttribute("source");
  creationTime = element.GetIntAttribute("creationTime");
  colorR = element.GetIntAttribute("colorR");
  colorG = element.GetIntAttribute("colorG");
  colorB = element.GetIntAttribute("colorB");
  gd::EventsListSerialization::UnserializeEventsFrom(
      project, events, element.GetChild("events"));

  parameters.clear();
  gd::SerializerElement& parametersElement = element.GetChild("parameters");
  parametersElement.ConsiderAsArrayOf("parameters");
  for (std::size_t i = 0; i < parametersElement.GetChildrenCount(); ++i)
    parameters.push_back(parametersElement.GetChild(i).GetValue().GetString());
}

void GroupEvent::SetBackgroundColor(unsigned int colorR_,
                                    unsigned int colorG_,
                                    unsigned int colorB_) {
  colorR = colorR_;
  colorG = colorG_;
  colorB = colorB_;
}

}  // namespace gd
