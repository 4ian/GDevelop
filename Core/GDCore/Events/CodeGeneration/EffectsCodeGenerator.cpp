/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <iostream>
#include "EffectsCodeGenerator.h"
#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Effect.h"
#include "GDCore/Project/Layer.h"
#include "GDCore/Project/EffectsContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Object.h"

namespace gd {

void ExposeProjectEffects(
    const gd::Project& project,
    const std::function<void(const gd::Effect& effect)>& worker) {
  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources) and
  // WholeProjectRefactorer::ExposeProjectEvents.

  // Add layouts effects
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto& layout = project.GetLayout(s);

    for (std::size_t l = 0; l < layout.GetLayersCount(); ++l) {
      auto& effects = layout.GetLayer(l).GetEffects();
      for (std::size_t e = 0; e < effects.GetEffectsCount(); ++e) {
        auto& effect = effects.GetEffect(e);
        worker(effect);
      }
    }
  }

  // Add object effects
  for (std::size_t s = 0; s < project.GetObjectsCount(); s++) {
    auto& effects = project.GetObject(s).GetEffects();
    for (std::size_t e = 0; e < effects.GetEffectsCount(); e++) {
      auto& effect = effects.GetEffect(e);
      worker(effect);
    }
  }
}

void EffectsCodeGenerator::GenerateEffectsIncludeFiles(
    const gd::Platform& platform,
    const gd::Project& project,
    std::set<gd::String>& includeFiles) {
  ExposeProjectEffects(
      project, [&platform, &includeFiles](const gd::Effect& effect) {
        // TODO: this browse all the extensions every time we're trying to find
        // a new effect. Might be a good idea to rework MetadataProvider to be
        // faster (not sure if it is a bottleneck at all though - but could be
        // for events code generation).
        const gd::EffectMetadata& effectMetadata =
            MetadataProvider::GetEffectMetadata(platform,
                                                effect.GetEffectType());

        for (auto& includeFile : effectMetadata.GetIncludeFiles())
          includeFiles.insert(includeFile);
      });
}

}  // namespace gd
