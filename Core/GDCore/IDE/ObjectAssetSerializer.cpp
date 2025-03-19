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

  if (project.HasEventsBasedObject(object.GetType())) {
    SerializerElement &variantsElement =
        objectAssetElement.AddChild("variants");
    variantsElement.ConsiderAsArrayOf("variant");

    std::unordered_set<gd::String> alreadyUsedVariantIdentifiers;
    gd::ObjectAssetSerializer::SerializeUsedVariantsTo(
        project, object, variantsElement, alreadyUsedVariantIdentifiers);
  }

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

void ObjectAssetSerializer::SerializeUsedVariantsTo(
    gd::Project &project, const gd::Object &object,
    SerializerElement &variantsElement,
    std::unordered_set<gd::String> &alreadyUsedVariantIdentifiers) {

  if (!project.HasEventsBasedObject(object.GetType())) {
    return;
  }
  const auto *customObjectConfiguration =
      dynamic_cast<const gd::CustomObjectConfiguration *>(
          &object.GetConfiguration());
  if (customObjectConfiguration
          ->IsMarkedAsOverridingEventsBasedObjectChildrenConfiguration() ||
      customObjectConfiguration
          ->IsForcedToOverrideEventsBasedObjectChildrenConfiguration()) {
    return;
  }
  const auto &variantName = customObjectConfiguration->GetVariantName();
  const auto &variantIdentifier =
      object.GetType() + gd::PlatformExtension::GetNamespaceSeparator() +
      variantName;
  auto insertResult = alreadyUsedVariantIdentifiers.insert(variantIdentifier);
  if (insertResult.second) {
    const auto &eventsBasedObject =
        project.GetEventsBasedObject(object.GetType());
    const auto &variants = eventsBasedObject.GetVariants();
    const auto &variant = variants.HasVariantNamed(variantName)
                              ? variants.GetVariant(variantName)
                              : eventsBasedObject.GetDefaultVariant();

    SerializerElement &pairElement = variantsElement.AddChild("variant");
    pairElement.SetAttribute("objectType", object.GetType());
    SerializerElement &variantElement = pairElement.AddChild("variant");
    variant.SerializeTo(variantElement);
    // TODO Recursivity
    for (auto &object : variant.GetObjects().GetObjects()) {
      gd::ObjectAssetSerializer::SerializeUsedVariantsTo(
          project, *object, variantsElement, alreadyUsedVariantIdentifiers);
    }
  }
}
} // namespace gd
