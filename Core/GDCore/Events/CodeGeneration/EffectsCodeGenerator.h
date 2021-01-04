/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EffectsCodeGenerator_H
#define GDCORE_EffectsCodeGenerator_H

#include <set>
#include <utility>
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
class Platform;
}  // namespace gd

namespace gd {

/**
 * \brief Internal class used to generate code from events
 */
class GD_CORE_API EffectsCodeGenerator {
 public:
  /**
   * \brief Add all the include files required by the project effects.
   */
  static void GenerateEffectsIncludeFiles(const gd::Platform& platform,
                                          const gd::Project& project,
                                          std::set<gd::String>& includeFiles);
};

}  // namespace gd

#endif  // GDCORE_EffectsCodeGenerator_H
