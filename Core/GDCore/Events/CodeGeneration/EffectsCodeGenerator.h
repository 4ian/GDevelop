/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <set>
#include <utility>
#include <vector>
#include "GDCore/String.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"

namespace gd {
class Project;
class Platform;
class Effect;
}  // namespace gd

namespace gd {

/**
 * \brief Internal class used to generate code from events
 */
class GD_CORE_API EffectsCodeGenerator : public ArbitraryObjectsWorker {
public:
  /**
   * \brief Add all the include files required by the project effects.
   */
  static void GenerateEffectsIncludeFiles(const gd::Platform& platform,
                                          gd::Project& project,
                                          std::set<gd::String>& includeFiles);

private:
  EffectsCodeGenerator(const gd::Platform &platform_,
                       std::set<gd::String> &includeFiles_)
      : platform(platform_), includeFiles(includeFiles_){};

  void AddEffectIncludeFiles(const gd::Effect& effect);

  void DoVisitObject(gd::Object &object) override;

  const gd::Platform &platform;
  std::set<gd::String> &includeFiles;
};

}  // namespace gd
