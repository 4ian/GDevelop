/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/QuickCustomizationVisibilitiesContainer.h"

#include <algorithm>
#include <iostream>

#include "GDCore/Project/QuickCustomization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/UUID/UUID.h"

using namespace std;

namespace gd {

QuickCustomizationVisibilitiesContainer::
    QuickCustomizationVisibilitiesContainer() {}

bool QuickCustomizationVisibilitiesContainer::IsEmpty() const {
  return visibilities.empty();
}

void QuickCustomizationVisibilitiesContainer::Set(
    const gd::String& name, QuickCustomization::Visibility visibility) {
  visibilities[name] = visibility;
}

QuickCustomization::Visibility QuickCustomizationVisibilitiesContainer::Get(
    const gd::String& name) const {
  auto it = visibilities.find(name);
  if (it != visibilities.end()) return it->second;

  return QuickCustomization::Visibility::Default;
}

void QuickCustomizationVisibilitiesContainer::SerializeTo(
    SerializerElement& element) const {
  for (auto& visibility : visibilities) {
    element.SetStringAttribute(
        visibility.first,
        QuickCustomization::VisibilityAsString(visibility.second));
  }
}

void QuickCustomizationVisibilitiesContainer::UnserializeFrom(
    const SerializerElement& element) {
  visibilities.clear();
  for (auto& child : element.GetAllChildren()) {
    visibilities[child.first] =
        QuickCustomization::StringAsVisibility(child.second->GetStringValue());
  }
}

}  // namespace gd
