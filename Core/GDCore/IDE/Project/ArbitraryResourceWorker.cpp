/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)

#include "ArbitraryResourceWorker.h"
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"

using namespace std;

namespace gd {

void ArbitraryResourceWorker::ExposeImage(gd::String& imageName){
    // Nothing to do, the image is a reference to a resource that
    // is already exposed.
};

void ArbitraryResourceWorker::ExposeAudio(gd::String& audioName) {
  for (auto resources : GetResources()) {
    if (!resources) continue;

    if (resources->HasResource(audioName) &&
        resources->GetResource(audioName).GetKind() == "audio") {
      // Nothing to do, the audio is a reference to a resource that
      // is already exposed.
      return;
    }
  }

  ExposeFile(audioName);
};

void ArbitraryResourceWorker::ExposeFont(gd::String& fontName) {
  for (auto resources : GetResources()) {
    if (!resources) continue;

    if (resources->HasResource(fontName) &&
        resources->GetResource(fontName).GetKind() == "font") {
      // Nothing to do, the font is a reference to a resource that
      // is already exposed.
      return;
    }
  }

  ExposeFile(fontName);
};

void ArbitraryResourceWorker::ExposeBitmapFont(gd::String& bitmapFontName) {
  for (auto resources : GetResources()) {
    if (!resources) continue;

    if (resources->HasResource(bitmapFontName) &&
        resources->GetResource(bitmapFontName).GetKind() == "bitmapFont") {
      // Nothing to do, the font is a reference to a resource that
      // is already exposed.
      return;
    }
  }

  ExposeFile(bitmapFontName);
};

void ArbitraryResourceWorker::ExposeResources(
    gd::ResourcesManager* resourcesManager) {
  if (!resourcesManager) return;

  resourcesManagers.push_back(resourcesManager);

  std::vector<gd::String> resources = resourcesManager->GetAllResourceNames();
  for (std::size_t i = 0; i < resources.size(); i++) {
    if (resourcesManager->GetResource(resources[i]).UseFile())
      ExposeResource(resourcesManager->GetResource(resources[i]));
  }
}

void ArbitraryResourceWorker::ExposeResource(gd::Resource& resource) {
  if (!resource.UseFile()) return;

  gd::String file = resource.GetFile();
  ExposeFile(file);
  if (file != resource.GetFile()) resource.SetFile(file);
}

ArbitraryResourceWorker::~ArbitraryResourceWorker() {}

void LaunchResourceWorkerOnEvents(const gd::Project& project,
                                  gd::EventsList& events,
                                  gd::ArbitraryResourceWorker& worker) {
  // Get all extensions used
  std::vector<std::shared_ptr<gd::PlatformExtension> > allGameExtensions;
  std::vector<gd::String> usedExtensions = project.GetUsedExtensions();
  for (std::size_t i = 0; i < usedExtensions.size(); ++i) {
    std::shared_ptr<gd::PlatformExtension> extension =
        project.GetCurrentPlatform().GetExtension(usedExtensions[i]);

    if (extension != std::shared_ptr<gd::PlatformExtension>())
      allGameExtensions.push_back(extension);
  }

  for (std::size_t j = 0; j < events.size(); j++) {
    vector<gd::InstructionsList*> allActionsVectors =
        events[j].GetAllActionsVectors();
    for (std::size_t i = 0; i < allActionsVectors.size(); ++i) {
      for (std::size_t k = 0; k < allActionsVectors[i]->size(); k++) {
        gd::String type = allActionsVectors[i]->Get(k).GetType();
        for (std::size_t e = 0; e < allGameExtensions.size(); ++e) {
          bool extensionHasAction = false;

          const std::map<gd::String, gd::InstructionMetadata>& allActions =
              allGameExtensions[e]->GetAllActions();
          if (allActions.find(type) != allActions.end())
            extensionHasAction = true;

          const vector<gd::String>& objects =
              allGameExtensions[e]->GetExtensionObjectsTypes();
          for (std::size_t o = 0; o < objects.size(); ++o) {
            const std::map<gd::String, gd::InstructionMetadata>&
                allObjectsActions =
                    allGameExtensions[e]->GetAllActionsForObject(objects[o]);
            if (allObjectsActions.find(type) != allObjectsActions.end())
              extensionHasAction = true;
          }

          const vector<gd::String>& autos =
              allGameExtensions[e]->GetBehaviorsTypes();
          for (std::size_t a = 0; a < autos.size(); ++a) {
            const std::map<gd::String, gd::InstructionMetadata>&
                allAutosActions =
                    allGameExtensions[e]->GetAllActionsForBehavior(autos[a]);
            if (allAutosActions.find(type) != allAutosActions.end())
              extensionHasAction = true;
          }

          if (extensionHasAction) {
            allGameExtensions[e]->ExposeActionsResources(
                allActionsVectors[i]->Get(k), worker);
            break;
          }
        }
      }
    }

    vector<gd::InstructionsList*> allConditionsVector =
        events[j].GetAllConditionsVectors();
    for (std::size_t i = 0; i < allConditionsVector.size(); ++i) {
      for (std::size_t k = 0; k < allConditionsVector[i]->size(); k++) {
        gd::String type = allConditionsVector[i]->Get(k).GetType();
        for (std::size_t e = 0; e < allGameExtensions.size(); ++e) {
          bool extensionHasCondition = false;

          const std::map<gd::String, gd::InstructionMetadata>& allConditions =
              allGameExtensions[e]->GetAllConditions();
          if (allConditions.find(type) != allConditions.end())
            extensionHasCondition = true;

          const vector<gd::String>& objects =
              allGameExtensions[e]->GetExtensionObjectsTypes();
          for (std::size_t j = 0; j < objects.size(); ++j) {
            const std::map<gd::String, gd::InstructionMetadata>&
                allObjectsConditions =
                    allGameExtensions[e]->GetAllConditionsForObject(objects[j]);
            if (allObjectsConditions.find(type) != allObjectsConditions.end())
              extensionHasCondition = true;
          }

          const vector<gd::String>& autos =
              allGameExtensions[e]->GetBehaviorsTypes();
          for (std::size_t j = 0; j < autos.size(); ++j) {
            const std::map<gd::String, gd::InstructionMetadata>&
                allAutosConditions =
                    allGameExtensions[e]->GetAllConditionsForBehavior(autos[j]);
            if (allAutosConditions.find(type) != allAutosConditions.end())
              extensionHasCondition = true;
          }

          if (extensionHasCondition)
            allGameExtensions[e]->ExposeConditionsResources(
                allConditionsVector[i]->Get(k), worker);
        }
      }
    }

    if (events[j].CanHaveSubEvents())
      LaunchResourceWorkerOnEvents(project, events[j].GetSubEvents(), worker);
  }

  return;
}

}  // namespace gd
#endif
