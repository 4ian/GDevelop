/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_CUSTOMCONFIGURATIONHELPER_H
#define GDCORE_CUSTOMCONFIGURATIONHELPER_H

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace gd;

namespace gd {
/**
 * \brief Helper functions that gd::CustomBehavior and gd::CustomBehaviorsSharedData use to
 * store their content in JSON.
 */
class CustomConfigurationHelper {
public:
  CustomConfigurationHelper() {}

  static void InitializeContent(
      const gd::PropertiesContainer &properties,
      gd::SerializerElement &behaviorContent);

  static std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::PropertiesContainer &properties,
      const gd::SerializerElement &behaviorContent);

  static bool UpdateProperty(
      const gd::PropertiesContainer &properties,
      gd::SerializerElement &behaviorContent,
      const gd::String &name,
      const gd::String &value);
};
}  // namespace gd

#endif  // GDCORE_CUSTOMCONFIGURATIONHELPER_H