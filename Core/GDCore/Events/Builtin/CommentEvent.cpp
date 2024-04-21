/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "CommentEvent.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

vector<gd::String> CommentEvent::GetAllSearchableStrings() const {
  vector<gd::String> allSearchableStrings;

  allSearchableStrings.push_back(com1);
  allSearchableStrings.push_back(com2);  ///< Com2 is deprecated

  return allSearchableStrings;
}

bool CommentEvent::ReplaceAllSearchableStrings(
    std::vector<gd::String> newSearchableString) {
  if (newSearchableString[0] == com1) return false;
  SetComment(newSearchableString[0]);
  return true;
}

void CommentEvent::SerializeTo(SerializerElement &element) const {
  element.AddChild("color")
      .SetAttribute("r", r)
      .SetAttribute("g", v)
      .SetAttribute("b", b)
      .SetAttribute("textR", textR)
      .SetAttribute("textG", textG)
      .SetAttribute("textB", textB);

  element.AddChild("comment").SetValue(com1);
  if (!com2.empty()) element.AddChild("comment2").SetValue(com2);
}

void CommentEvent::UnserializeFrom(gd::Project &project,
                                   const SerializerElement &element) {
  const SerializerElement &colorElement =
      element.GetChild("color", 0, "Couleur");
  r = colorElement.GetIntAttribute("r");
  v = colorElement.GetIntAttribute("g", 0, "v");
  b = colorElement.GetIntAttribute("b");
  textR = colorElement.GetIntAttribute("textR");
  textG = colorElement.GetIntAttribute("textG");
  textB = colorElement.GetIntAttribute("textB");

  com1 = element.GetChild("comment", 0, "Com1").GetValue().GetString();
  if (element.HasChild("comment2")) {
    com2 = element.GetChild("comment2", 0, "Com2").GetValue().GetString();
  }
}

}  // namespace gd
