/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/BehaviorConfigurationContainer.h"
#include <iostream>
#include "GDCore/Project/PropertyDescriptor.h"

namespace gd {

BehaviorConfigurationContainer::~BehaviorConfigurationContainer(){};


std::map<gd::String, gd::PropertyDescriptor> BehaviorConfigurationContainer::GetProperties() const {
    return GetProperties(content);
  };

std::map<gd::String, gd::PropertyDescriptor> BehaviorConfigurationContainer::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

}  // namespace gd
