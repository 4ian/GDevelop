/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectConfiguration.h"

#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

namespace gd {
gd::String ObjectConfiguration::badAnimationName;

ObjectConfiguration::~ObjectConfiguration() {}

ObjectConfiguration::ObjectConfiguration() {}

std::map<gd::String, gd::PropertyDescriptor> ObjectConfiguration::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

std::map<gd::String, gd::PropertyDescriptor>
ObjectConfiguration::GetInitialInstanceProperties(const gd::InitialInstance& instance) {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

gd::PropertyDescriptor ObjectConfiguration::GetStartingAnimationProperty(
    const gd::InitialInstance& instance) const {
  // The runtime truncates the index.
  const int animationIndex = instance.GetRawDoubleProperty("animation");
  gd::PropertyDescriptor property(gd::String::From(animationIndex));
  property.SetLabel(_("Animation")).SetType("NumberWithChoices");
  const std::size_t animationsCount = GetAnimationsCount();
  for (std::size_t i = 0; i < animationsCount; ++i) {
    property.AddChoice(gd::String::From(i), GetAnimationName(i));
  }
  if (animationIndex < 0 ||
      static_cast<std::size_t>(animationIndex) >= animationsCount) {
    property.AddChoice(gd::String::From(animationIndex), "");
  }
  return property;
}

void ObjectConfiguration::UnserializeFrom(gd::Project& project,
                             const SerializerElement& element) {
  DoUnserializeFrom(project, element);
}

void ObjectConfiguration::SerializeTo(SerializerElement& element) const {
  DoSerializeTo(element);
}

}  // namespace gd
