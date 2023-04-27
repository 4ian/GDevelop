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
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"

using namespace std;

namespace gd {

void ArbitraryResourceWorker::ExposeImage(gd::String& imageName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeJson(gd::String& jsonName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeTilemap(gd::String& tilemapName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeTileset(gd::String& tilesetName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeVideo(gd::String& videoName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeBitmapFont(gd::String& bitmapFontName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeAudio(gd::String& audioName) {
  for (auto resources : GetResources()) {
    if (!resources) continue;

    if (resources->HasResource(audioName) &&
        resources->GetResource(audioName).GetKind() == "audio") {
      // Nothing to do, the audio is a reference to a proper resource.
      return;
    }
  }

  // For compatibility with older projects (where events were referring to files
  // directly), we consider that this resource name is a filename, and so expose
  // it as a file.
  ExposeFile(audioName);
};

void ArbitraryResourceWorker::ExposeFont(gd::String& fontName) {
  for (auto resources : GetResources()) {
    if (!resources) continue;

    if (resources->HasResource(fontName) &&
        resources->GetResource(fontName).GetKind() == "font") {
      // Nothing to do, the font is a reference to a proper resource.
      return;
    }
  }

  // For compatibility with older projects (where events were referring to files
  // directly), we consider that this resource name is a filename, and so expose
  // it as a file.
  ExposeFile(fontName);
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

void ArbitraryResourceWorker::ExposeEmbeddeds(gd::String& resourceName) {
  if (resourcesManagers.empty()) return;
  gd::ResourcesManager* resourcesManager = resourcesManagers[0];

  gd::Resource& resource = resourcesManager->GetResource(resourceName);

  if (!resource.GetMetadata().empty()) {
    gd::SerializerElement serializerElement =
        gd::Serializer::FromJSON(resource.GetMetadata());

    if (serializerElement.HasChild("embeddedResourcesMapping")) {
      bool anyEmbeddedResourceNameWasRenamed = false;
      gd::SerializerElement& embeddedResourcesMappingElement =
          serializerElement.GetChild("embeddedResourcesMapping");

      for (const auto& child :
           embeddedResourcesMappingElement.GetAllChildren()) {
        const gd::String& targetResourceName =
            child.second->GetValue().GetString();

        if (resourcesManager->HasResource(targetResourceName)) {
          std::cout << targetResourceName << std::endl;
          gd::Resource& targetResource =
              resourcesManager->GetResource(targetResourceName);
          const gd::String& targetResourceKind = targetResource.GetKind();

          gd::String potentiallyUpdatedTargetResourceName = targetResourceName;

          if (targetResourceKind == "audio") {
            ExposeAudio(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "bitmapFont") {
            ExposeBitmapFont(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "font") {
            ExposeFont(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "image") {
            ExposeImage(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "json") {
            ExposeJson(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "tilemap") {
            ExposeTilemap(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "tileset") {
            ExposeTileset(potentiallyUpdatedTargetResourceName);
          } else if (targetResourceKind == "video") {
            ExposeVideo(potentiallyUpdatedTargetResourceName);
          }

          if (potentiallyUpdatedTargetResourceName != targetResourceName) {
            // The resource name was renamed. Also update the mapping.
            child.second->SetStringValue(potentiallyUpdatedTargetResourceName);
            anyEmbeddedResourceNameWasRenamed = true;
          }
        }
      }

      if (anyEmbeddedResourceNameWasRenamed) {
        resource.SetMetadata(gd::Serializer::ToJSON(serializerElement));
      }
    }
  }
}

void ArbitraryResourceWorker::ExposeResource(gd::Resource& resource) {
  if (!resource.UseFile()) return;

  gd::String file = resource.GetFile();
  ExposeFile(file);
  if (file != resource.GetFile()) resource.SetFile(file);
}

ArbitraryResourceWorker::~ArbitraryResourceWorker() {}

/**
 * Launch the specified resource worker on every resource referenced in the
 * events.
 */
class ResourceWorkerInEventsWorker : public ArbitraryEventsWorker {
 public:
  ResourceWorkerInEventsWorker(const gd::Project& project_,
                               gd::ArbitraryResourceWorker& worker_)
      : project(project_), worker(worker_){};
  virtual ~ResourceWorkerInEventsWorker(){};

 private:
  bool DoVisitInstruction(gd::Instruction& instruction, bool isCondition) {
    const auto& platform = project.GetCurrentPlatform();
    const auto& metadata = isCondition
                               ? gd::MetadataProvider::GetConditionMetadata(
                                     platform, instruction.GetType())
                               : gd::MetadataProvider::GetActionMetadata(
                                     platform, instruction.GetType());

    gd::ParameterMetadataTools::IterateOverParametersWithIndex(
        instruction.GetParameters(),
        metadata.GetParameters(),
        [this, &instruction](const gd::ParameterMetadata& parameterMetadata,
                             const gd::Expression& parameterExpression,
                             size_t parameterIndex,
                             const gd::String& lastObjectName) {
          const String& parameterValue = parameterExpression.GetPlainString();
          if (parameterMetadata.GetType() ==
                  "police" ||  // Should be renamed fontResource
              parameterMetadata.GetType() == "fontResource") {
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeFont(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          } else if (parameterMetadata.GetType() == "soundfile" ||
                     parameterMetadata.GetType() ==
                         "musicfile") {  // Should be renamed audioResource
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeAudio(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          } else if (parameterMetadata.GetType() == "bitmapFontResource") {
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeBitmapFont(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          } else if (parameterMetadata.GetType() == "imageResource") {
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeImage(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          } else if (parameterMetadata.GetType() == "jsonResource") {
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeJson(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          } else if (parameterMetadata.GetType() == "tilemapResource") {
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeTilemap(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          } else if (parameterMetadata.GetType() == "tilesetResource") {
            gd::String updatedParameterValue = parameterValue;
            worker.ExposeTileset(updatedParameterValue);
            instruction.SetParameter(parameterIndex, updatedParameterValue);
          }
        });

    return false;
  };

  const gd::Project& project;
  gd::ArbitraryResourceWorker& worker;
};

void LaunchResourceWorkerOnEvents(const gd::Project& project,
                                  gd::EventsList& events,
                                  gd::ArbitraryResourceWorker& worker) {
  ResourceWorkerInEventsWorker eventsWorker(project, worker);
  eventsWorker.Launch(events);
}

}  // namespace gd
#endif
