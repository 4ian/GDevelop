/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"
#include <unordered_set>

namespace gd {
class Platform;
class Object;
} // namespace gd

namespace gd {

class GD_CORE_API ObjectTools {
public:
  static bool IsBehaviorCompatibleWithObject(const gd::Platform &platform,
                                             const gd::String &objectType,
                                             const gd::String &behaviorType) {
    std::unordered_set<gd::String> coveredBehaviorType;
    return IsBehaviorCompatibleWithObject(platform, objectType, behaviorType,
                                   coveredBehaviorType);
  }

private:
  static bool IsBehaviorCompatibleWithObject(
      const gd::Platform &platform, const gd::String &objectType,
      const gd::String &behaviorType,
      std::unordered_set<gd::String> coveredBehaviorType);
};

} // namespace gd
