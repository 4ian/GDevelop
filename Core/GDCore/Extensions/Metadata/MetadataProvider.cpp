/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Metadata/MetadataProvider.h"

#include <algorithm>

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/PlatformMetadataIndex.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"  // For GetTypeOfObject and GetTypeOfBehavior
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/String.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"

using namespace std;

namespace gd {

gd::BehaviorMetadata MetadataProvider::badBehaviorMetadata;
gd::ObjectMetadata MetadataProvider::badObjectInfo;
gd::EffectMetadata MetadataProvider::badEffectMetadata;
gd::InstructionMetadata MetadataProvider::badInstructionMetadata;
gd::ExpressionMetadata MetadataProvider::badExpressionMetadata;
gd::PlatformExtension MetadataProvider::badExtension;

// The lookups below all delegate to the platform's gd::PlatformMetadataIndex,
// which resolves a type to its metadata in constant time (instead of scanning
// every extension). The index is rebuilt by the platform whenever its
// extensions change, so the returned pointers are never stale.

ExtensionAndMetadata<BehaviorMetadata>
MetadataProvider::GetExtensionAndBehaviorMetadata(const gd::Platform& platform,
                                                  gd::String behaviorType) {
  const auto* entry = platform.GetMetadataIndex().GetBehaviorMetadata(behaviorType);
  if (entry == nullptr)
    return ExtensionAndMetadata<BehaviorMetadata>(badExtension, badBehaviorMetadata);
  return ExtensionAndMetadata<BehaviorMetadata>(*entry->extension, *entry->metadata);
}

const BehaviorMetadata& MetadataProvider::GetBehaviorMetadata(
    const gd::Platform& platform, gd::String behaviorType) {
  const auto* entry = platform.GetMetadataIndex().GetBehaviorMetadata(behaviorType);
  return entry != nullptr ? *entry->metadata : badBehaviorMetadata;
}

ExtensionAndMetadata<ObjectMetadata>
MetadataProvider::GetExtensionAndObjectMetadata(const gd::Platform& platform,
                                                gd::String type) {
  const auto* entry = platform.GetMetadataIndex().GetObjectMetadata(type);
  if (entry == nullptr)
    return ExtensionAndMetadata<ObjectMetadata>(badExtension, badObjectInfo);
  return ExtensionAndMetadata<ObjectMetadata>(*entry->extension, *entry->metadata);
}

const ObjectMetadata& MetadataProvider::GetObjectMetadata(
    const gd::Platform& platform, gd::String type) {
  const auto* entry = platform.GetMetadataIndex().GetObjectMetadata(type);
  return entry != nullptr ? *entry->metadata : badObjectInfo;
}

ExtensionAndMetadata<EffectMetadata>
MetadataProvider::GetExtensionAndEffectMetadata(const gd::Platform& platform,
                                                gd::String type) {
  const auto* entry = platform.GetMetadataIndex().GetEffectMetadata(type);
  if (entry == nullptr)
    return ExtensionAndMetadata<EffectMetadata>(badExtension, badEffectMetadata);
  return ExtensionAndMetadata<EffectMetadata>(*entry->extension, *entry->metadata);
}

const EffectMetadata& MetadataProvider::GetEffectMetadata(
    const gd::Platform& platform, gd::String type) {
  const auto* entry = platform.GetMetadataIndex().GetEffectMetadata(type);
  return entry != nullptr ? *entry->metadata : badEffectMetadata;
}

ExtensionAndMetadata<InstructionMetadata>
MetadataProvider::GetExtensionAndActionMetadata(const gd::Platform& platform,
                                                gd::String actionType) {
  const auto* entry = platform.GetMetadataIndex().GetActionMetadata(actionType);
  if (entry == nullptr)
    return ExtensionAndMetadata<InstructionMetadata>(badExtension,
                                                     badInstructionMetadata);
  return ExtensionAndMetadata<InstructionMetadata>(*entry->extension,
                                                   *entry->metadata);
}

const gd::InstructionMetadata& MetadataProvider::GetActionMetadata(
    const gd::Platform& platform, gd::String actionType) {
  const auto* entry = platform.GetMetadataIndex().GetActionMetadata(actionType);
  return entry != nullptr ? *entry->metadata : badInstructionMetadata;
}

ExtensionAndMetadata<InstructionMetadata>
MetadataProvider::GetExtensionAndConditionMetadata(const gd::Platform& platform,
                                                   gd::String conditionType) {
  const auto* entry =
      platform.GetMetadataIndex().GetConditionMetadata(conditionType);
  if (entry == nullptr)
    return ExtensionAndMetadata<InstructionMetadata>(badExtension,
                                                     badInstructionMetadata);
  return ExtensionAndMetadata<InstructionMetadata>(*entry->extension,
                                                   *entry->metadata);
}

const gd::InstructionMetadata& MetadataProvider::GetConditionMetadata(
    const gd::Platform& platform, gd::String conditionType) {
  const auto* entry =
      platform.GetMetadataIndex().GetConditionMetadata(conditionType);
  return entry != nullptr ? *entry->metadata : badInstructionMetadata;
}

ExtensionAndMetadata<ExpressionMetadata>
MetadataProvider::GetExtensionAndObjectExpressionMetadata(
    const gd::Platform& platform, gd::String objectType, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetObjectExpressionMetadata(
      objectType, exprType);
  if (entry == nullptr)
    return ExtensionAndMetadata<ExpressionMetadata>(badExtension,
                                                    badExpressionMetadata);
  return ExtensionAndMetadata<ExpressionMetadata>(*entry->extension,
                                                  *entry->metadata);
}

const gd::ExpressionMetadata& MetadataProvider::GetObjectExpressionMetadata(
    const gd::Platform& platform, gd::String objectType, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetObjectExpressionMetadata(
      objectType, exprType);
  return entry != nullptr ? *entry->metadata : badExpressionMetadata;
}

ExtensionAndMetadata<ExpressionMetadata>
MetadataProvider::GetExtensionAndBehaviorExpressionMetadata(
    const gd::Platform& platform, gd::String autoType, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetBehaviorExpressionMetadata(
      autoType, exprType);
  if (entry == nullptr)
    return ExtensionAndMetadata<ExpressionMetadata>(badExtension,
                                                    badExpressionMetadata);
  return ExtensionAndMetadata<ExpressionMetadata>(*entry->extension,
                                                  *entry->metadata);
}

const gd::ExpressionMetadata& MetadataProvider::GetBehaviorExpressionMetadata(
    const gd::Platform& platform, gd::String autoType, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetBehaviorExpressionMetadata(
      autoType, exprType);
  return entry != nullptr ? *entry->metadata : badExpressionMetadata;
}

ExtensionAndMetadata<ExpressionMetadata>
MetadataProvider::GetExtensionAndExpressionMetadata(const gd::Platform& platform,
                                                    gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetExpressionMetadata(exprType);
  if (entry == nullptr)
    return ExtensionAndMetadata<ExpressionMetadata>(badExtension,
                                                    badExpressionMetadata);
  return ExtensionAndMetadata<ExpressionMetadata>(*entry->extension,
                                                  *entry->metadata);
}

const gd::ExpressionMetadata& MetadataProvider::GetExpressionMetadata(
    const gd::Platform& platform, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetExpressionMetadata(exprType);
  return entry != nullptr ? *entry->metadata : badExpressionMetadata;
}

ExtensionAndMetadata<ExpressionMetadata>
MetadataProvider::GetExtensionAndObjectStrExpressionMetadata(
    const gd::Platform& platform, gd::String objectType, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetObjectStrExpressionMetadata(
      objectType, exprType);
  if (entry == nullptr)
    return ExtensionAndMetadata<ExpressionMetadata>(badExtension,
                                                    badExpressionMetadata);
  return ExtensionAndMetadata<ExpressionMetadata>(*entry->extension,
                                                  *entry->metadata);
}

const gd::ExpressionMetadata& MetadataProvider::GetObjectStrExpressionMetadata(
    const gd::Platform& platform, gd::String objectType, gd::String exprType) {
  const auto* entry = platform.GetMetadataIndex().GetObjectStrExpressionMetadata(
      objectType, exprType);
  return entry != nullptr ? *entry->metadata : badExpressionMetadata;
}

ExtensionAndMetadata<ExpressionMetadata>
MetadataProvider::GetExtensionAndBehaviorStrExpressionMetadata(
    const gd::Platform& platform, gd::String autoType, gd::String exprType) {
  const auto* entry =
      platform.GetMetadataIndex().GetBehaviorStrExpressionMetadata(autoType,
                                                                   exprType);
  if (entry == nullptr)
    return ExtensionAndMetadata<ExpressionMetadata>(badExtension,
                                                    badExpressionMetadata);
  return ExtensionAndMetadata<ExpressionMetadata>(*entry->extension,
                                                  *entry->metadata);
}

const gd::ExpressionMetadata&
MetadataProvider::GetBehaviorStrExpressionMetadata(const gd::Platform& platform,
                                                   gd::String autoType,
                                                   gd::String exprType) {
  const auto* entry =
      platform.GetMetadataIndex().GetBehaviorStrExpressionMetadata(autoType,
                                                                   exprType);
  return entry != nullptr ? *entry->metadata : badExpressionMetadata;
}

ExtensionAndMetadata<ExpressionMetadata>
MetadataProvider::GetExtensionAndStrExpressionMetadata(
    const gd::Platform& platform, gd::String exprType) {
  const auto* entry =
      platform.GetMetadataIndex().GetStrExpressionMetadata(exprType);
  if (entry == nullptr)
    return ExtensionAndMetadata<ExpressionMetadata>(badExtension,
                                                    badExpressionMetadata);
  return ExtensionAndMetadata<ExpressionMetadata>(*entry->extension,
                                                  *entry->metadata);
}

const gd::ExpressionMetadata& MetadataProvider::GetStrExpressionMetadata(
    const gd::Platform& platform, gd::String exprType) {
  const auto* entry =
      platform.GetMetadataIndex().GetStrExpressionMetadata(exprType);
  return entry != nullptr ? *entry->metadata : badExpressionMetadata;
}

const gd::ExpressionMetadata& MetadataProvider::GetAnyExpressionMetadata(
    const gd::Platform& platform, gd::String exprType) {
  const auto& numberExpressionMetadata =
      GetExpressionMetadata(platform, exprType);
  if (&numberExpressionMetadata != &badExpressionMetadata) {
    return numberExpressionMetadata;
  }
  const auto& stringExpressionMetadata =
      GetStrExpressionMetadata(platform, exprType);
  if (&stringExpressionMetadata != &badExpressionMetadata) {
    return stringExpressionMetadata;
  }
  return badExpressionMetadata;
}

const gd::ExpressionMetadata& MetadataProvider::GetObjectAnyExpressionMetadata(
    const gd::Platform& platform, gd::String objectType, gd::String exprType) {
  const auto& numberExpressionMetadata =
      GetObjectExpressionMetadata(platform, objectType, exprType);
  if (&numberExpressionMetadata != &badExpressionMetadata) {
    return numberExpressionMetadata;
  }
  const auto& stringExpressionMetadata =
      GetObjectStrExpressionMetadata(platform, objectType, exprType);
  if (&stringExpressionMetadata != &badExpressionMetadata) {
    return stringExpressionMetadata;
  }
  return badExpressionMetadata;
}

const gd::ExpressionMetadata&
MetadataProvider::GetBehaviorAnyExpressionMetadata(const gd::Platform& platform,
                                                   gd::String autoType,
                                                   gd::String exprType) {
  const auto& numberExpressionMetadata =
      GetBehaviorExpressionMetadata(platform, autoType, exprType);
  if (&numberExpressionMetadata != &badExpressionMetadata) {
    return numberExpressionMetadata;
  }
  const auto& stringExpressionMetadata =
      GetBehaviorStrExpressionMetadata(platform, autoType, exprType);
  if (&stringExpressionMetadata != &badExpressionMetadata) {
    return stringExpressionMetadata;
  }
  return badExpressionMetadata;
}

const gd::ExpressionMetadata& MetadataProvider::GetFunctionCallMetadata(
    const gd::Platform& platform,
    const gd::ObjectsContainersList &objectsContainersList,
    FunctionCallNode& node) {

  if (!node.behaviorName.empty()) {
    gd::String behaviorType =
        objectsContainersList.GetTypeOfBehavior(node.behaviorName);
    return MetadataProvider::GetBehaviorAnyExpressionMetadata(
            platform, behaviorType, node.functionName);
  }
  else if (!node.objectName.empty()) {
    gd::String objectType =
        objectsContainersList.GetTypeOfObject(node.objectName);
    return MetadataProvider::GetObjectAnyExpressionMetadata(
                  platform, objectType, node.functionName);
  }

  return MetadataProvider::GetAnyExpressionMetadata(platform, node.functionName);
}

const gd::ParameterMetadata* MetadataProvider::GetFunctionCallParameterMetadata(
    const gd::Platform& platform,
    const gd::ObjectsContainersList &objectsContainersList,
    FunctionCallNode& functionCall,
    ExpressionNode& parameter) {
      int parameterIndex = -1;
      for (int i = 0; i < functionCall.parameters.size(); i++) {
        if (functionCall.parameters.at(i).get() == &parameter) {
          parameterIndex = i;
          break;
        }
      }
      if (parameterIndex < 0) {
        return nullptr;
      }
      return MetadataProvider::GetFunctionCallParameterMetadata(
          platform,
          objectsContainersList,
          functionCall,
          parameterIndex);
}

const gd::ParameterMetadata* MetadataProvider::GetFunctionCallParameterMetadata(
    const gd::Platform& platform,
    const gd::ObjectsContainersList &objectsContainersList,
    FunctionCallNode& functionCall,
    int parameterIndex) {
      // Search the parameter metadata index skipping invisible ones.
      size_t visibleParameterIndex = 0;
      size_t metadataParameterIndex =
          ExpressionParser2::WrittenParametersFirstIndex(
              functionCall.objectName, functionCall.behaviorName);
      const gd::ExpressionMetadata &metadata = MetadataProvider::GetFunctionCallMetadata(
          platform, objectsContainersList, functionCall);

      if (IsBadExpressionMetadata(metadata)) {
        return nullptr;
      }

      // TODO use a badMetadata instead of a nullptr?
      const gd::ParameterMetadata* parameterMetadata = nullptr;
      while (metadataParameterIndex <
             metadata.GetParameters().GetParametersCount()) {
        if (!metadata.GetParameters().GetParameter(metadataParameterIndex)
                 .IsCodeOnly()) {
          if (visibleParameterIndex == parameterIndex) {
            parameterMetadata =
                &metadata.GetParameters().GetParameter(metadataParameterIndex);
          }
          visibleParameterIndex++;
        }
        metadataParameterIndex++;
      }
      const int visibleParameterCount = visibleParameterIndex;
      // It can be null if there are too many parameters in the expression, this text node is
      // not actually linked to a parameter expected by the function call.
      return parameterMetadata;
}

MetadataProvider::~MetadataProvider() {}
MetadataProvider::MetadataProvider() {}

}  // namespace gd
