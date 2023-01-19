/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectAssetSerializer.h"

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Project/ResourcesInUseHelper.h"
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

const std::vector<gd::String> ObjectAssetSerializer::resourceTypes = {
    "image",   "audio",   "font",  "json",
    "tilemap", "tileset", "video", "bitmapFont"};

void ObjectAssetSerializer::SerializeTo(gd::Project &project,
                                        const gd::Object &object,
                                        SerializerElement &element) {
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
  for (auto &&resourceType : resourceTypes) {
    for (auto &&resourceName : resourcesInUse.GetAll(resourceType)) {
      if (resourceName.length() == 0) {
        continue;
      }
      auto &resource = resourcesManager.GetResource(resourceName);
      SerializerElement &resourceElement =
          resourcesElement.AddChild("resource");
      resourceElement.SetAttribute("name", resourceName);
      resourceElement.SetAttribute("file", resource.GetFile());
      resourceElement.SetAttribute("kind", resource.GetKind());
      resourceElement.SetBoolAttribute("alwaysLoaded", false);
      resourceElement.SetAttribute("metadata", resource.GetMetadata());
    }
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

} // namespace gd
