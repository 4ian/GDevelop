/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectTools.h"

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"

namespace gd {

bool ObjectTools::IsBehaviorCompatibleWithObject(
      const gd::Platform &platform, const gd::String &objectType,
      const gd::String &behaviorType,
      std::unordered_set<gd::String> coveredBehaviorType) {
  bool isBehaviorTypeAlreadyCovered =
      !coveredBehaviorType.insert(behaviorType).second;
  if (isBehaviorTypeAlreadyCovered) {
    return true;
  }
  const gd::BehaviorMetadata &behaviorMetadata =
      MetadataProvider::GetBehaviorMetadata(platform, behaviorType);
  if (MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
    // Should not happen because the behavior was added successfully (so its
    // metadata are valid) - but double check anyway and bail out if the
    // behavior metadata are invalid.
    return false;
  }
  if (!behaviorMetadata.GetObjectType().empty() &&
      behaviorMetadata.GetObjectType() != objectType) {
    return false;
  }
  for (const gd::String &requiredBehaviorType :
       behaviorMetadata.GetRequiredBehaviorTypes()) {
    const gd::BehaviorMetadata &requiredBehaviorMetadata =
        gd::MetadataProvider::GetBehaviorMetadata(platform, requiredBehaviorType);
    if (requiredBehaviorMetadata.IsHidden()) {
      const gd::ObjectMetadata &objectMetadata =
          gd::MetadataProvider::GetObjectMetadata(platform, objectType);
      if (objectMetadata.GetDefaultBehaviors().find(requiredBehaviorType) ==
          objectMetadata.GetDefaultBehaviors().end()) {
        // A capability is missing in the object.
        return false;
      }
    }
    if (!gd::ObjectTools::IsBehaviorCompatibleWithObject(
            platform, objectType, requiredBehaviorType, coveredBehaviorType)) {
      return false;
    }
  }
  return true;
}

} // namespace gd
