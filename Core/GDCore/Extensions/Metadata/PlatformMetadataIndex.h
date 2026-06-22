/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <unordered_map>

#include "GDCore/String.h"

namespace gd {
class Platform;
class PlatformExtension;
class ObjectMetadata;
class BehaviorMetadata;
class EffectMetadata;
class InstructionMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief A resolved metadata entry: the metadata and the extension declaring it.
 *
 * Both pointers are owned by the gd::PlatformExtension they come from. They stay
 * valid as long as the index does: the index is rebuilt from scratch whenever
 * the platform extensions change (see gd::Platform::AddExtension /
 * RemoveExtension), so it never holds pointers to freed metadata.
 */
template <class T>
struct MetadataEntry {
  const gd::PlatformExtension* extension;
  const T* metadata;

  MetadataEntry() : extension(nullptr), metadata(nullptr) {}
  MetadataEntry(const gd::PlatformExtension* extension_, const T* metadata_)
      : extension(extension_), metadata(metadata_) {}
};

/**
 * \brief Hash-map index of all the metadata declared by a platform's
 * extensions, so that gd::MetadataProvider lookups are O(1) instead of a linear
 * scan over every extension (and, for instructions/expressions, over every
 * object and behavior type of every extension).
 *
 * It is built lazily and owned by gd::Platform, which discards it whenever its
 * extensions change. The semantics of every lookup match the previous
 * linear-scan implementation exactly: the first extension (in load order)
 * declaring a type wins, and object/behavior expressions resolve the specific
 * object/behavior type before falling back to the base ("") type.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API PlatformMetadataIndex {
 public:
  /**
   * \brief Build the index from all the extensions of the given platform.
   */
  explicit PlatformMetadataIndex(const gd::Platform& platform);

  const MetadataEntry<ObjectMetadata>* GetObjectMetadata(
      const gd::String& type) const;
  const MetadataEntry<BehaviorMetadata>* GetBehaviorMetadata(
      const gd::String& type) const;
  const MetadataEntry<EffectMetadata>* GetEffectMetadata(
      const gd::String& type) const;
  const MetadataEntry<InstructionMetadata>* GetActionMetadata(
      const gd::String& type) const;
  const MetadataEntry<InstructionMetadata>* GetConditionMetadata(
      const gd::String& type) const;
  const MetadataEntry<ExpressionMetadata>* GetExpressionMetadata(
      const gd::String& type) const;
  const MetadataEntry<ExpressionMetadata>* GetStrExpressionMetadata(
      const gd::String& type) const;

  /**
   * Object/behavior expressions resolve the specific type first, then fall back
   * to the base ("") type, matching the previous implementation.
   */
  const MetadataEntry<ExpressionMetadata>* GetObjectExpressionMetadata(
      const gd::String& objectType, const gd::String& exprType) const;
  const MetadataEntry<ExpressionMetadata>* GetObjectStrExpressionMetadata(
      const gd::String& objectType, const gd::String& exprType) const;
  const MetadataEntry<ExpressionMetadata>* GetBehaviorExpressionMetadata(
      const gd::String& behaviorType, const gd::String& exprType) const;
  const MetadataEntry<ExpressionMetadata>* GetBehaviorStrExpressionMetadata(
      const gd::String& behaviorType, const gd::String& exprType) const;

 private:
  // Single-key indexes (the type is globally unique).
  std::unordered_map<gd::String, MetadataEntry<ObjectMetadata>> objectMetadata;
  std::unordered_map<gd::String, MetadataEntry<BehaviorMetadata>>
      behaviorMetadata;
  std::unordered_map<gd::String, MetadataEntry<EffectMetadata>> effectMetadata;
  std::unordered_map<gd::String, MetadataEntry<InstructionMetadata>> actions;
  std::unordered_map<gd::String, MetadataEntry<InstructionMetadata>> conditions;
  std::unordered_map<gd::String, MetadataEntry<ExpressionMetadata>> expressions;
  std::unordered_map<gd::String, MetadataEntry<ExpressionMetadata>>
      strExpressions;

  // Composite-key indexes: object/behavior type -> (expression type -> entry).
  // The base ("") type is stored under the "" outer key.
  using ExpressionsByType = std::unordered_map<
      gd::String,
      std::unordered_map<gd::String, MetadataEntry<ExpressionMetadata>>>;
  ExpressionsByType objectExpressions;
  ExpressionsByType objectStrExpressions;
  ExpressionsByType behaviorExpressions;
  ExpressionsByType behaviorStrExpressions;

  static const MetadataEntry<ExpressionMetadata>* FindInExpressionsByType(
      const ExpressionsByType& expressionsByType,
      const gd::String& type,
      const gd::String& exprType);
};

}  // namespace gd
