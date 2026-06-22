/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Metadata/PlatformMetadataIndex.h"

#include <map>

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"

namespace gd {

namespace {

// Index expressions (number or string) of an object/behavior type. `emplace`
// keeps the first inserted entry, so the first extension declaring a type wins,
// matching the previous linear-scan implementation.
void IndexExpressions(
    std::unordered_map<
        gd::String,
        std::unordered_map<gd::String, MetadataEntry<ExpressionMetadata>>>&
        expressionsByType,
    const gd::String& type,
    const gd::PlatformExtension* extension,
    std::map<gd::String, gd::ExpressionMetadata>& expressions) {
  auto& byExprType = expressionsByType[type];
  for (auto& it : expressions)
    byExprType.emplace(it.first,
                       MetadataEntry<ExpressionMetadata>{extension, &it.second});
}

}  // namespace

PlatformMetadataIndex::PlatformMetadataIndex(const gd::Platform& platform) {
  for (const auto& extensionPtr : platform.GetAllPlatformExtensions()) {
    gd::PlatformExtension& extension = *extensionPtr;
    const gd::PlatformExtension* ext = extensionPtr.get();

    const std::vector<gd::String> objectTypes =
        extension.GetExtensionObjectsTypes();
    const std::vector<gd::String> behaviorTypes = extension.GetBehaviorsTypes();

    // Objects, behaviors and effects.
    for (const auto& type : objectTypes)
      objectMetadata.emplace(
          type,
          MetadataEntry<ObjectMetadata>{ext, &extension.GetObjectMetadata(type)});
    for (const auto& type : behaviorTypes)
      behaviorMetadata.emplace(
          type, MetadataEntry<BehaviorMetadata>{
                    ext, &extension.GetBehaviorMetadata(type)});
    for (const auto& type : extension.GetExtensionEffectTypes())
      effectMetadata.emplace(
          type,
          MetadataEntry<EffectMetadata>{ext, &extension.GetEffectMetadata(type)});

    // Actions and conditions: free, then per-object, then per-behavior. The
    // instruction type is globally unique, so they share a single index.
    for (auto& it : extension.GetAllActions())
      actions.emplace(it.first,
                      MetadataEntry<InstructionMetadata>{ext, &it.second});
    for (auto& it : extension.GetAllConditions())
      conditions.emplace(it.first,
                         MetadataEntry<InstructionMetadata>{ext, &it.second});
    for (const auto& objectType : objectTypes) {
      for (auto& it : extension.GetAllActionsForObject(objectType))
        actions.emplace(it.first,
                        MetadataEntry<InstructionMetadata>{ext, &it.second});
      for (auto& it : extension.GetAllConditionsForObject(objectType))
        conditions.emplace(it.first,
                           MetadataEntry<InstructionMetadata>{ext, &it.second});
    }
    for (const auto& behaviorType : behaviorTypes) {
      for (auto& it : extension.GetAllActionsForBehavior(behaviorType))
        actions.emplace(it.first,
                        MetadataEntry<InstructionMetadata>{ext, &it.second});
      for (auto& it : extension.GetAllConditionsForBehavior(behaviorType))
        conditions.emplace(it.first,
                           MetadataEntry<InstructionMetadata>{ext, &it.second});
    }

    // Free expressions.
    for (auto& it : extension.GetAllExpressions())
      expressions.emplace(it.first,
                          MetadataEntry<ExpressionMetadata>{ext, &it.second});
    for (auto& it : extension.GetAllStrExpressions())
      strExpressions.emplace(
          it.first, MetadataEntry<ExpressionMetadata>{ext, &it.second});

    // Object/behavior expressions, including the base ("") type.
    IndexExpressions(objectExpressions, "", ext,
                     extension.GetAllExpressionsForObject(""));
    IndexExpressions(objectStrExpressions, "", ext,
                     extension.GetAllStrExpressionsForObject(""));
    for (const auto& objectType : objectTypes) {
      IndexExpressions(objectExpressions, objectType, ext,
                       extension.GetAllExpressionsForObject(objectType));
      IndexExpressions(objectStrExpressions, objectType, ext,
                       extension.GetAllStrExpressionsForObject(objectType));
    }

    IndexExpressions(behaviorExpressions, "", ext,
                     extension.GetAllExpressionsForBehavior(""));
    IndexExpressions(behaviorStrExpressions, "", ext,
                     extension.GetAllStrExpressionsForBehavior(""));
    for (const auto& behaviorType : behaviorTypes) {
      IndexExpressions(behaviorExpressions, behaviorType, ext,
                       extension.GetAllExpressionsForBehavior(behaviorType));
      IndexExpressions(behaviorStrExpressions, behaviorType, ext,
                       extension.GetAllStrExpressionsForBehavior(behaviorType));
    }
  }
}

namespace {
template <class T>
const MetadataEntry<T>* FindInMap(
    const std::unordered_map<gd::String, MetadataEntry<T>>& map,
    const gd::String& type) {
  auto it = map.find(type);
  return it != map.end() ? &it->second : nullptr;
}
}  // namespace

const MetadataEntry<ObjectMetadata>* PlatformMetadataIndex::GetObjectMetadata(
    const gd::String& type) const {
  return FindInMap(objectMetadata, type);
}

const MetadataEntry<BehaviorMetadata>*
PlatformMetadataIndex::GetBehaviorMetadata(const gd::String& type) const {
  return FindInMap(behaviorMetadata, type);
}

const MetadataEntry<EffectMetadata>* PlatformMetadataIndex::GetEffectMetadata(
    const gd::String& type) const {
  return FindInMap(effectMetadata, type);
}

const MetadataEntry<InstructionMetadata>*
PlatformMetadataIndex::GetActionMetadata(const gd::String& type) const {
  return FindInMap(actions, type);
}

const MetadataEntry<InstructionMetadata>*
PlatformMetadataIndex::GetConditionMetadata(const gd::String& type) const {
  return FindInMap(conditions, type);
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::GetExpressionMetadata(const gd::String& type) const {
  return FindInMap(expressions, type);
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::GetStrExpressionMetadata(const gd::String& type) const {
  return FindInMap(strExpressions, type);
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::FindInExpressionsByType(
    const ExpressionsByType& expressionsByType,
    const gd::String& type,
    const gd::String& exprType) {
  auto outer = expressionsByType.find(type);
  if (outer != expressionsByType.end()) {
    auto inner = outer->second.find(exprType);
    if (inner != outer->second.end()) return &inner->second;
  }

  // Fall back to the base ("") object/behavior type.
  auto base = expressionsByType.find("");
  if (base != expressionsByType.end()) {
    auto inner = base->second.find(exprType);
    if (inner != base->second.end()) return &inner->second;
  }

  return nullptr;
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::GetObjectExpressionMetadata(
    const gd::String& objectType, const gd::String& exprType) const {
  return FindInExpressionsByType(objectExpressions, objectType, exprType);
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::GetObjectStrExpressionMetadata(
    const gd::String& objectType, const gd::String& exprType) const {
  return FindInExpressionsByType(objectStrExpressions, objectType, exprType);
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::GetBehaviorExpressionMetadata(
    const gd::String& behaviorType, const gd::String& exprType) const {
  return FindInExpressionsByType(behaviorExpressions, behaviorType, exprType);
}

const MetadataEntry<ExpressionMetadata>*
PlatformMetadataIndex::GetBehaviorStrExpressionMetadata(
    const gd::String& behaviorType, const gd::String& exprType) const {
  return FindInExpressionsByType(behaviorStrExpressions, behaviorType, exprType);
}

}  // namespace gd
