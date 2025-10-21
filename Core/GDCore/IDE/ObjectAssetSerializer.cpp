/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectAssetSerializer.h"

#include <algorithm>

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
#include "GDCore/Project/CustomObjectConfiguration.h"
#include "GDCore/Project/EventsBasedObjectVariant.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

namespace gd {

gd::String
ObjectAssetSerializer::GetObjectExtensionName(const gd::Object &object) {
  const gd::String &type = object.GetType();
  const auto separatorIndex =
      type.find(PlatformExtension::GetNamespaceSeparator());
  return separatorIndex != std::string::npos ? type.substr(0, separatorIndex)
                                             : "";
}

void ObjectAssetSerializer::SerializeTo(
    gd::Project &project, const gd::Object &object,
    const gd::String &objectFullName, SerializerElement &element,
    std::vector<gd::String> &usedResourceNames) {
  auto cleanObject = object.Clone();
  cleanObject->GetVariables().Clear();
  cleanObject->GetEffects().Clear();
  for (auto &&behaviorName : cleanObject->GetAllBehaviorNames()) {
    cleanObject->RemoveBehavior(behaviorName);
  }

  gd::String extensionName = GetObjectExtensionName(*cleanObject);

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
  SerializerElement &authorsElement = element.AddChild("authors");
  authorsElement.ConsiderAsArrayOf("author");
  SerializerElement &tagsElement = element.AddChild("tags");
  tagsElement.ConsiderAsArrayOf("tag");

  SerializerElement &objectAssetsElement = element.AddChild("objectAssets");
  objectAssetsElement.ConsiderAsArrayOf("objectAsset");
  SerializerElement &objectAssetElement =
      objectAssetsElement.AddChild("objectAsset");

  cleanObject->SerializeTo(objectAssetElement.AddChild("object"));

  double width = 0;
  double height = 0;
  std::unordered_set<gd::String> alreadyUsedVariantIdentifiers;
  if (project.HasEventsBasedObject(object.GetType())) {
    SerializerElement &variantsElement =
        objectAssetElement.AddChild("variants");
    variantsElement.ConsiderAsArrayOf("variant");

    const auto *variant = ObjectAssetSerializer::GetVariant(project, object);
    if (variant) {
      width = variant->GetAreaMaxX() - variant->GetAreaMinX();
      height = variant->GetAreaMaxY() - variant->GetAreaMinY();
    }

    gd::ObjectAssetSerializer::SerializeUsedVariantsTo(
        project, object, variantsElement, alreadyUsedVariantIdentifiers);
  }

  // TODO Find the right object dimensions when their is no variant.
  element.SetIntAttribute("width", width);
  element.SetIntAttribute("height", height);

  SerializerElement &resourcesElement =
      objectAssetElement.AddChild("resources");
  resourcesElement.ConsiderAsArrayOf("resource");
  auto &resourcesManager = project.GetResourcesManager();
  gd::ResourcesInUseHelper resourcesInUse(resourcesManager);
  cleanObject->GetConfiguration().ExposeResources(resourcesInUse);
  for (auto &&resourceName : resourcesInUse.GetAllResources()) {
    if (resourceName.length() == 0) {
      continue;
    }
    usedResourceNames.push_back(resourceName);
    auto &resource = resourcesManager.GetResource(resourceName);
    SerializerElement &resourceElement = resourcesElement.AddChild("resource");
    resource.SerializeTo(resourceElement);
    resourceElement.SetAttribute("kind", resource.GetKind());
    resourceElement.SetAttribute("name", resource.GetName());
  }

  std::unordered_set<gd::String> usedExtensionNames;
  usedExtensionNames.insert(extensionName);
  for (auto &usedVariantIdentifier : alreadyUsedVariantIdentifiers) {
    usedExtensionNames.insert(PlatformExtension::GetExtensionFromFullObjectType(
        usedVariantIdentifier));
  }
  SerializerElement &requiredExtensionsElement =
      objectAssetElement.AddChild("requiredExtensions");
  requiredExtensionsElement.ConsiderAsArrayOf("requiredExtension");
  for (auto &usedExtensionName : usedExtensionNames) {
    if (project.HasEventsFunctionsExtensionNamed(usedExtensionName)) {
      auto &extension = project.GetEventsFunctionsExtension(usedExtensionName);
      SerializerElement &requiredExtensionElement =
          requiredExtensionsElement.AddChild("requiredExtension");
      requiredExtensionElement.SetAttribute("extensionName", usedExtensionName);
      requiredExtensionElement.SetAttribute("extensionVersion",
                                            extension.GetVersion());
    }
  }

  // TODO This can be removed when the asset script no longer require it.
  SerializerElement &customizationElement =
      objectAssetElement.AddChild("customization");
  customizationElement.ConsiderAsArrayOf("empty");
}

void ObjectAssetSerializer::SerializeUsedVariantsTo(
    gd::Project &project, const gd::Object &object,
    SerializerElement &variantsElement,
    std::unordered_set<gd::String> &alreadyUsedVariantIdentifiers) {
  const auto *variant = ObjectAssetSerializer::GetVariant(project, object);
  if (!variant) {
    return;
  }
  const auto &variantIdentifier =
      object.GetType() + gd::PlatformExtension::GetNamespaceSeparator() +
      variant->GetName();
  auto insertResult = alreadyUsedVariantIdentifiers.insert(variantIdentifier);
  if (!insertResult.second) {
    return;
  }
  SerializerElement &pairElement = variantsElement.AddChild("variant");
  pairElement.SetAttribute("objectType", object.GetType());
  SerializerElement &variantElement = pairElement.AddChild("variant");
  variant->SerializeTo(variantElement);

  for (auto &object : variant->GetObjects().GetObjects()) {
    gd::ObjectAssetSerializer::SerializeUsedVariantsTo(
        project, *object, variantsElement, alreadyUsedVariantIdentifiers);
  }
}

const gd::EventsBasedObjectVariant *
ObjectAssetSerializer::GetVariant(gd::Project &project,
                                  const gd::Object &object) {
  if (!project.HasEventsBasedObject(object.GetType())) {
    return nullptr;
  }
  const auto &eventsBasedObject =
      project.GetEventsBasedObject(object.GetType());
  const auto &variants = eventsBasedObject.GetVariants();
  const auto *customObjectConfiguration =
      dynamic_cast<const gd::CustomObjectConfiguration *>(
          &object.GetConfiguration());
  const auto &variantName = customObjectConfiguration->GetVariantName();
  if (!variants.HasVariantNamed(variantName) &&
      (customObjectConfiguration
           ->IsMarkedAsOverridingEventsBasedObjectChildrenConfiguration() ||
       customObjectConfiguration
           ->IsForcedToOverrideEventsBasedObjectChildrenConfiguration())) {
    return nullptr;
  }
  const auto &variantIdentifier =
      object.GetType() + gd::PlatformExtension::GetNamespaceSeparator() +
      variantName;
  const auto &variant = variants.HasVariantNamed(variantName)
                            ? variants.GetVariant(variantName)
                            : eventsBasedObject.GetDefaultVariant();
  return &variant;
}
} // namespace gd
