/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/BehaviorsSharedData.h"
#if defined(GD_IDE_ONLY)
#include <map>
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif

namespace gd {

BehaviorsSharedData::~BehaviorsSharedData(){};

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> BehaviorsSharedData::GetProperties(
    const gd::SerializerElement& behaviorSharedDataContent, gd::Project& project) const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}
#endif

}  // namespace gd
