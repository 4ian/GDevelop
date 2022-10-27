/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_CustomConfigurationHelper_H
#define GDCORE_CustomConfigurationHelper_H

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

namespace gd {
/**
 * \brief A gd::Behavior that stores its content in JSON and forward the
 * properties related functions to Javascript with Emscripten.
 */
class CustomConfigurationHelper {
public:
  CustomConfigurationHelper() {}

  static void InitializeContent(
      const gd::SerializableWithNameList<gd::NamedPropertyDescriptor> &properties,
      gd::SerializerElement &behaviorContent);

  static std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializableWithNameList<gd::NamedPropertyDescriptor> &properties,
      const gd::SerializerElement &behaviorContent);

  static bool UpdateProperty(
      const gd::SerializableWithNameList<gd::NamedPropertyDescriptor> &properties,
      gd::SerializerElement &behaviorContent,
      const gd::String &name,
      const gd::String &value);
};
}  // namespace gd

#endif  // GDCORE_CustomConfigurationHelper_H