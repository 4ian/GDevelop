/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectConfiguration.h"

#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Log.h"

namespace gd {

ObjectConfiguration::~ObjectConfiguration() {}

ObjectConfiguration::ObjectConfiguration() {}

std::map<gd::String, gd::PropertyDescriptor> ObjectConfiguration::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

std::map<gd::String, gd::PropertyDescriptor>
ObjectConfiguration::GetInitialInstanceProperties(const gd::InitialInstance& instance,
                                     gd::Project& project,
                                     gd::Layout& layout) {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

void ObjectConfiguration::UnserializeFrom(gd::Project& project,
                             const SerializerElement& element) {
  DoUnserializeFrom(project, element);
}

void ObjectConfiguration::SerializeTo(SerializerElement& element) const {
  DoSerializeTo(element);
}

}  // namespace gd
