/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectAssetSerializer.h"

#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Project/AssetResourcePathCleaner.h"
#include "GDCore/IDE/Project/ResourcesInUseHelper.h"
#include "GDCore/IDE/Project/ResourcesRenamer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/CustomBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

namespace gd {

void ObjectAssetSerializer::SerializeTo(
    gd::Project &project, const gd::Object &object,
    const gd::String &objectFullName, SerializerElement &element,
    std::map<gd::String, gd::String> &resourcesFileNameMap) {
  auto cleanObject = object.Clone();
  cleanObject->GetVariables().Clear();
  cleanObject->GetEffects().Clear();
  for (auto &&behaviorName : cleanObject->GetAllBehaviorNames()) {
    cleanObject->RemoveBehavior(behaviorName);
  }

  const gd::String &type = cleanObject->GetType();
  const auto separatorIndex =
      type.find(PlatformExtension::GetNamespaceSeparator());
  gd::String extensionName =
      separatorIndex != std::string::npos ? type.substr(0, separatorIndex) : "";

  std::map<gd::String, gd::String> resourcesNameReverseMap;
  gd::ObjectAssetSerializer::RenameObjectResourceFiles(
      project, *cleanObject, "", objectFullName, resourcesFileNameMap,
      resourcesNameReverseMap);

  element.SetAttribute("id", "");
  element.SetAttribute("name", "");
  element.SetAttribute("license", "");
  if (project.HasEventsFunctionsExtensionNamed(extensionName)) {
    auto &extension = project.GetEventsFunctionsExtension(extensionName);
    element.SetAttribute("description", extension.GetShortDescription());
  }
  element.SetAttribute("gdevelopVersion", "");
  element.SetAttribute("version", "");
  element.SetIntAttribute("animationsCount", 1);
  element.SetIntAttribute("maxFramesCount", 1);
  // TODO Find the right object dimensions.
  element.SetIntAttribute("width", 0);
  element.SetIntAttribute("height", 0);
  SerializerElement &authorsElement = element.AddChild("authors");
  authorsElement.ConsiderAsArrayOf("author");
  SerializerElement &tagsElement = element.AddChild("tags");
  tagsElement.ConsiderAsArrayOf("tag");

  SerializerElement &objectAssetsElement = element.AddChild("objectAssets");
  objectAssetsElement.ConsiderAsArrayOf("objectAsset");
  SerializerElement &objectAssetElement =
      objectAssetsElement.AddChild("objectAsset");

  cleanObject->SerializeTo(objectAssetElement.AddChild("object"));

  SerializerElement &resourcesElement =
      objectAssetElement.AddChild("resources");
  resourcesElement.ConsiderAsArrayOf("resource");
  auto &resourcesManager = project.GetResourcesManager();
  gd::ResourcesInUseHelper resourcesInUse(resourcesManager);
  cleanObject->GetConfiguration().ExposeResources(resourcesInUse);
  for (auto &&newResourceName : resourcesInUse.GetAllResources()) {
    if (newResourceName.length() == 0) {
      continue;
    }
    auto &resource = resourcesManager.GetResource(
        resourcesNameReverseMap.find(newResourceName) !=
                resourcesNameReverseMap.end()
            ? resourcesNameReverseMap[newResourceName]
            : newResourceName);
    SerializerElement &resourceElement = resourcesElement.AddChild("resource");
    resource.SerializeTo(resourceElement);
    // Override name and file because the project and the asset don't use the
    // same one.
    resourceElement.SetAttribute("kind", resource.GetKind());
    resourceElement.SetAttribute("name", newResourceName);
    auto &oldFilePath = resource.GetFile();
    resourceElement.SetAttribute("file",
                                 resourcesFileNameMap.find(oldFilePath) !=
                                         resourcesFileNameMap.end()
                                     ? resourcesFileNameMap[oldFilePath]
                                     : oldFilePath);
  }

  SerializerElement &requiredExtensionsElement =
      objectAssetElement.AddChild("requiredExtensions");
  requiredExtensionsElement.ConsiderAsArrayOf("requiredExtension");
  if (project.HasEventsFunctionsExtensionNamed(extensionName)) {
    SerializerElement &requiredExtensionElement =
        requiredExtensionsElement.AddChild("requiredExtension");
    requiredExtensionElement.SetAttribute("extensionName", extensionName);
    requiredExtensionElement.SetAttribute("extensionVersion", "1.0.0");
  }

  // TODO This can be removed when the asset script no longer require it.
  SerializerElement &customizationElement =
      objectAssetElement.AddChild("customization");
  customizationElement.ConsiderAsArrayOf("empty");
}

void ObjectAssetSerializer::RenameObjectResourceFiles(
    gd::Project &project, gd::Object &object,
    const gd::String &destinationDirectory, const gd::String &objectFullName,
    std::map<gd::String, gd::String> &resourcesFileNameMap,
    std::map<gd::String, gd::String> &resourcesNameReverseMap) {
  gd::AssetResourcePathCleaner assetResourcePathCleaner(
      project.GetResourcesManager(), resourcesFileNameMap,
      resourcesNameReverseMap);
  object.GetConfiguration().ExposeResources(assetResourcePathCleaner);

  if (object.GetConfiguration().GetType() == "Sprite") {
    gd::SpriteObject &spriteConfiguration =
        dynamic_cast<gd::SpriteObject &>(object.GetConfiguration());
    std::map<gd::String, gd::String> normalizedFileNames;

    for (std::size_t animationIndex = 0;
         animationIndex < spriteConfiguration.GetAnimationsCount();
         animationIndex++) {
      auto &animation = spriteConfiguration.GetAnimation(animationIndex);
      auto &direction = animation.GetDirection(0);

      const gd::String &animationName =
          animation.GetName().empty()
              ? gd::String::From(animationIndex)
              : animation.GetName().FindAndReplace("_", " ", true);

      // Search frames that share the same resource.
      std::map<gd::String, std::vector<int>> frameIndexes;
      for (std::size_t frameIndex = 0; frameIndex < direction.GetSpritesCount();
           frameIndex++) {
        auto &frame = direction.GetSprite(frameIndex);

        if (frameIndexes.find(frame.GetImageName()) == frameIndexes.end()) {
          std::vector<int> emptyVector;
          frameIndexes[frame.GetImageName()] = emptyVector;
        }
        auto &indexes = frameIndexes[frame.GetImageName()];
        indexes.push_back(frameIndex);
      }

      for (std::size_t frameIndex = 0; frameIndex < direction.GetSpritesCount();
           frameIndex++) {
        auto &frame = direction.GetSprite(frameIndex);
        auto oldName = frame.GetImageName();

        if (normalizedFileNames.find(oldName) != normalizedFileNames.end()) {
          gd::LogWarning("The resource \"" + oldName +
                         "\" is shared by several animations.");
          continue;
        }

        gd::String newName = objectFullName;
        if (spriteConfiguration.GetAnimationsCount() > 1) {
          newName += "_" + animationName;
        }
        if (direction.GetSpritesCount() > 1) {
          newName += "_";
          auto &indexes = frameIndexes[frame.GetImageName()];
          for (size_t i = 0; i < indexes.size(); i++) {
            newName += gd::String::From(indexes.at(i) + 1);
            if (i < indexes.size() - 1) {
              newName += ";";
            }
          }
        }
        gd::String extension = oldName.substr(oldName.find_last_of("."));
        newName += extension;

        frame.SetImageName(newName);
        normalizedFileNames[oldName] = newName;
      }
    }
    for (std::map<gd::String, gd::String>::const_iterator it =
             resourcesFileNameMap.begin();
         it != resourcesFileNameMap.end(); ++it) {
      if (!it->first.empty()) {
        gd::String originFile = it->first;
        gd::String destinationFile = it->second;
        resourcesFileNameMap[originFile] = normalizedFileNames[destinationFile];
      }
    }
    auto clonedResourcesNameReverseMap = resourcesNameReverseMap;
    resourcesNameReverseMap.clear();
    for (std::map<gd::String, gd::String>::const_iterator it =
             clonedResourcesNameReverseMap.begin();
         it != clonedResourcesNameReverseMap.end(); ++it) {
      if (!it->first.empty()) {
        gd::String newResourceName = it->first;
        gd::String oldResourceName = it->second;
        resourcesNameReverseMap[normalizedFileNames[newResourceName]] =
            oldResourceName;
      }
    }
  }
}
} // namespace gd
