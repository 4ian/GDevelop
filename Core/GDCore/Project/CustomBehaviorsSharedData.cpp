/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "CustomBehaviorsSharedData.h"

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/CustomConfigurationHelper.h"

#include <map>

using namespace gd;

CustomBehaviorsSharedData *CustomBehaviorsSharedData::Clone() const {
  CustomBehaviorsSharedData *clone = new CustomBehaviorsSharedData(*this);
  return clone;
}

void CustomBehaviorsSharedData::InitializeContent(gd::SerializerElement &behaviorContent) {
  if (!project.HasEventsBasedBehavior(GetTypeName())) {
    return;
  }
  const auto &eventsBasedBehavior = project.GetEventsBasedBehavior(GetTypeName());
  const auto &properties = eventsBasedBehavior.GetSharedPropertyDescriptors();

  gd::CustomConfigurationHelper::InitializeContent(properties, behaviorContent);
}

std::map<gd::String, gd::PropertyDescriptor> CustomBehaviorsSharedData::GetProperties(
    const gd::SerializerElement &behaviorContent) const {
  if (!project.HasEventsBasedBehavior(GetTypeName())) {
    auto behaviorProperties = std::map<gd::String, gd::PropertyDescriptor>();
    return behaviorProperties;
  }
  const auto &eventsBasedBehavior = project.GetEventsBasedBehavior(GetTypeName());
  const auto &properties = eventsBasedBehavior.GetSharedPropertyDescriptors();

  return gd::CustomConfigurationHelper::GetProperties(properties, behaviorContent);
}

bool CustomBehaviorsSharedData::UpdateProperty(gd::SerializerElement &behaviorContent,
                                    const gd::String &propertyName,
                                    const gd::String &newValue) {
  if (!project.HasEventsBasedBehavior(GetTypeName())) {
    return false;
  }
  const auto &eventsBasedBehavior = project.GetEventsBasedBehavior(GetTypeName());
  const auto &properties = eventsBasedBehavior.GetSharedPropertyDescriptors();

  return gd::CustomConfigurationHelper::UpdateProperty(
      properties,
      behaviorContent,
      propertyName,
      newValue);
}
