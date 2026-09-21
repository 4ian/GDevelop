/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/Test.h"

#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

Test::Test() : type("gameplay") {}

void Test::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("type", type);
  element.SetAttribute("description", description);
  element.AddChild("source").SetMultilineStringValue(source);
  if (!lastRunStatus.empty()) {
    element.SetAttribute("lastRunStatus", lastRunStatus);
    element.SetAttribute("lastRunAt", lastRunAt);
    element.SetAttribute("lastRunDurationMs", lastRunDurationMs);
    element.SetAttribute("lastRunFramesExecuted", lastRunFramesExecuted);
  }
}

void Test::UnserializeFrom(const SerializerElement& element) {
  name = element.GetStringAttribute("name");
  type = element.GetStringAttribute("type", "gameplay");
  description = element.GetStringAttribute("description");
  source = element.GetChild("source").GetMultilineStringValue();
  lastRunStatus = element.GetStringAttribute("lastRunStatus", "");
  lastRunAt = element.GetDoubleAttribute("lastRunAt", 0);
  lastRunDurationMs = element.GetDoubleAttribute("lastRunDurationMs", 0);
  lastRunFramesExecuted =
      element.GetIntAttribute("lastRunFramesExecuted", 0);
}

}  // namespace gd
