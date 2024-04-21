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
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/Project/Effect.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/IDE/ResourceExposer.h"

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

void ArbitraryResourceWorker::ExposeModel3D(gd::String& resourceName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeAtlas(gd::String& resourceName){
    // Nothing to do by default - each child class can define here the action to
    // do.
};

void ArbitraryResourceWorker::ExposeSpine(gd::String& resourceName){
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
  if (resourcesManager->HasResource(audioName) &&
      resourcesManager->GetResource(audioName).GetKind() == "audio") {
    // Nothing to do, the audio is a reference to a proper resource.
    return;
  }

  // For compatibility with older projects (where events were referring to files
  // directly), we consider that this resource name is a filename, and so expose
  // it as a file.
  ExposeFile(audioName);
};

void ArbitraryResourceWorker::ExposeFont(gd::String& fontName) {
  if (resourcesManager->HasResource(fontName) &&
      resourcesManager->GetResource(fontName).GetKind() == "font") {
    // Nothing to do, the font is a reference to a proper resource.
    return;
  }

  // For compatibility with older projects (where events were referring to files
  // directly), we consider that this resource name is a filename, and so expose
  // it as a file.
  ExposeFile(fontName);
};

void ArbitraryResourceWorker::ExposeResources() {
  std::vector<gd::String> resources = resourcesManager->GetAllResourceNames();
  for (std::size_t i = 0; i < resources.size(); i++) {
    if (resourcesManager->GetResource(resources[i]).UseFile())
      ExposeResource(resourcesManager->GetResource(resources[i]));
  }
}

void ArbitraryResourceWorker::ExposeEmbeddeds(gd::String& resourceName) {
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

          gd::String potentiallyUpdatedTargetResourceName = targetResourceName;
          ExposeResourceWithType(targetResource.GetKind(), potentiallyUpdatedTargetResourceName);
          ExposeEmbeddeds(potentiallyUpdatedTargetResourceName);

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

void ArbitraryResourceWorker::ExposeResourceWithType(
    const gd::String &resourceType, gd::String &resourceName) {
  if (resourceType == "image") {
    ExposeImage(resourceName);
    return;
  }
  if (resourceType == "model3D") {
    ExposeModel3D(resourceName);
    return;
  }
  if (resourceType == "audio") {
    ExposeAudio(resourceName);
    return;
  }
  if (resourceType == "font") {
    ExposeFont(resourceName);
    return;
  }
  if (resourceType == "bitmapFont") {
    ExposeBitmapFont(resourceName);
    return;
  }
  if (resourceType == "tilemap") {
    ExposeTilemap(resourceName);
    ExposeEmbeddeds(resourceName);
    return;
  }
  if (resourceType == "tileset") {
    ExposeTileset(resourceName);
    return;
  }
  if (resourceType == "json") {
    ExposeJson(resourceName);
    ExposeEmbeddeds(resourceName);
    return;
  }
  if (resourceType == "video") {
    ExposeVideo(resourceName);
    return;
  }
  if (resourceType == "atlas") {
    ExposeAtlas(resourceName);
    return;
  }
  if (resourceType == "spine") {
    ExposeSpine(resourceName);
    return;
  }
  gd::LogError("Unexpected resource type: " + resourceType + " for: " + resourceName);
  return;
}

void ArbitraryResourceWorker::ExposeResource(gd::Resource& resource) {
  if (!resource.UseFile()) return;

  gd::String file = resource.GetFile();
  ExposeFile(file);
  if (file != resource.GetFile()) resource.SetFile(file);
}

ArbitraryResourceWorker::~ArbitraryResourceWorker() {}

bool ResourceWorkerInEventsWorker::DoVisitInstruction(gd::Instruction& instruction, bool isCondition) {
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
          worker.ExposeEmbeddeds(updatedParameterValue);
          instruction.SetParameter(parameterIndex, updatedParameterValue);
        } else if (parameterMetadata.GetType() == "tilemapResource") {
          gd::String updatedParameterValue = parameterValue;
          worker.ExposeTilemap(updatedParameterValue);
          worker.ExposeEmbeddeds(updatedParameterValue);
          instruction.SetParameter(parameterIndex, updatedParameterValue);
        } else if (parameterMetadata.GetType() == "tilesetResource") {
          gd::String updatedParameterValue = parameterValue;
          worker.ExposeTileset(updatedParameterValue);
          instruction.SetParameter(parameterIndex, updatedParameterValue);
        } else if (parameterMetadata.GetType() == "model3DResource") {
          gd::String updatedParameterValue = parameterValue;
          worker.ExposeModel3D(updatedParameterValue);
          instruction.SetParameter(parameterIndex, updatedParameterValue);
        } else if (parameterMetadata.GetType() == "atlasResource") {
          gd::String updatedParameterValue = parameterValue;
          worker.ExposeAtlas(updatedParameterValue);
          instruction.SetParameter(parameterIndex, updatedParameterValue);
        } else if (parameterMetadata.GetType() == "spineResource") {
          gd::String updatedParameterValue = parameterValue;
          worker.ExposeSpine(updatedParameterValue);
          instruction.SetParameter(parameterIndex, updatedParameterValue);
        }
      });

  return false;
};

gd::ResourceWorkerInEventsWorker
GetResourceWorkerOnEvents(const gd::Project &project,
                          gd::ArbitraryResourceWorker &worker) {
  gd::ResourceWorkerInEventsWorker eventsWorker(project, worker);
  return eventsWorker;
}

void ResourceWorkerInObjectsWorker::DoVisitObject(gd::Object &object) {
  object.GetConfiguration().ExposeResources(worker);
  auto& effects = object.GetEffects();
  for (size_t effectIndex = 0; effectIndex < effects.GetEffectsCount(); effectIndex++)
  {
    auto& effect = effects.GetEffect(effectIndex);
    gd::ResourceExposer::ExposeEffectResources(project.GetCurrentPlatform(), effect, worker);
  }
};

void ResourceWorkerInObjectsWorker::DoVisitBehavior(gd::Behavior &behavior){
    // TODO Allow behaviors to expose resources
};

gd::ResourceWorkerInObjectsWorker
GetResourceWorkerOnObjects(const gd::Project &project,
                           gd::ArbitraryResourceWorker &worker) {
  gd::ResourceWorkerInObjectsWorker resourcesWorker(project, worker);
  return resourcesWorker;
}

}  // namespace gd
#endif
