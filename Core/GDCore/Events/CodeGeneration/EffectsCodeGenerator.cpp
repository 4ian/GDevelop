/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EffectsCodeGenerator.h"

#include <iostream>

#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Effect.h"
#include "GDCore/Project/EffectsContainer.h"
#include "GDCore/Project/Layer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"

namespace gd {

void EffectsCodeGenerator::DoVisitObject(gd::Object &object) {
  auto &effects = object.GetEffects();
  for (std::size_t e = 0; e < effects.GetEffectsCount(); e++) {
    auto &effect = effects.GetEffect(e);
    AddEffectIncludeFiles(effect);
  }
};

void EffectsCodeGenerator::AddEffectIncludeFiles(const gd::Effect &effect) {
  // TODO: this browse all the extensions every time we're trying to find
  // a new effect. Might be a good idea to rework MetadataProvider to be
  // faster (not sure if it is a bottleneck at all though - but could be
  // for events code generation).
  const gd::EffectMetadata &effectMetadata =
      MetadataProvider::GetEffectMetadata(platform, effect.GetEffectType());

  for (auto &includeFile : effectMetadata.GetIncludeFiles())
    includeFiles.insert(includeFile);
};

void EffectsCodeGenerator::GenerateEffectsIncludeFiles(
    const gd::Platform &platform,
    gd::Project &project,
    std::set<gd::String> &includeFiles) {
  // TODO Add unit tests on this function.
  
  // TODO Merge with UsedExtensionsFinder.

  // TODO Factorize with the iteration on all effects for resource exposure.
  // TODO Implement an ArbitraryEffectWorker and add a method in ProjectBrowserHelper

  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources) and
  // WholeProjectRefactorer::ExposeProjectEvents.

  EffectsCodeGenerator effectsCodeGenerator(platform, includeFiles);

  // Add layouts effects
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto& layout = project.GetLayout(s);

    for (std::size_t l = 0; l < layout.GetLayersCount(); ++l) {
      auto& effects = layout.GetLayer(l).GetEffects();
      for (std::size_t e = 0; e < effects.GetEffectsCount(); ++e) {
        auto& effect = effects.GetEffect(e);
        effectsCodeGenerator.AddEffectIncludeFiles(effect);
      }
    }
  }

  // Add objects effects
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, effectsCodeGenerator);

  // Add event-based objects layouts effects
  for (std::size_t s = 0; s < project.GetEventsFunctionsExtensionsCount();
       s++) {
    auto &eventsFunctionExtension = project.GetEventsFunctionsExtension(s);

    auto &eventsBasedObjects = eventsFunctionExtension.GetEventsBasedObjects();
    for (std::size_t objectIndex = 0;
         objectIndex < eventsBasedObjects.GetCount(); ++objectIndex) {
      auto &eventsBasedObject = eventsBasedObjects.Get(objectIndex);

      auto &layers = eventsBasedObject.GetLayers();
      for (std::size_t l = 0; l < layers.GetLayersCount(); ++l) {
        auto &effects = layers.GetLayer(l).GetEffects();
        for (std::size_t e = 0; e < effects.GetEffectsCount(); ++e) {
          auto &effect = effects.GetEffect(e);
          effectsCodeGenerator.AddEffectIncludeFiles(effect);
        }
      }
    }
  }
}

}  // namespace gd
