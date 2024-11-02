/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ParameterMetadataTools.h"

#include "GDCore/Events/Expression.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/ParameterMetadataContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "InstructionMetadata.h"

namespace gd {
const ParameterMetadata ParameterMetadataTools::badParameterMetadata;

void ParameterMetadataTools::ParametersToObjectsContainer(
    const gd::Project& project,
    const ParameterMetadataContainer& parameters,
    gd::ObjectsContainer& outputObjectsContainer) {
  // Keep track of all objects and their behaviors names, so we can remove
  // those who are in the container but not in the parameters anymore.
  std::set<gd::String> allObjectNames;
  std::map<gd::String, std::set<gd::String>> allObjectNonDefaultBehaviorNames;

  gd::String lastObjectName;
  for (std::size_t i = 0; i < parameters.GetParametersCount(); ++i) {
    const auto& parameter = parameters.GetParameter(i);
    if (parameter.GetName().empty()) continue;

    auto &valueTypeMetadata = parameter.GetValueTypeMetadata();
    if (valueTypeMetadata.IsObject()) {
      const gd::String& objectName = parameter.GetName();
      const gd::String& objectType = parameter.GetExtraInfo();
      allObjectNames.insert(objectName);

      // Check if we can keep the existing object.
      if (outputObjectsContainer.HasObjectNamed(objectName)) {
        const gd::Object& object = outputObjectsContainer.GetObject(objectName);

        if (object.GetType() != objectType) {
          // Object type has changed, remove it so it is re-created.
          outputObjectsContainer.RemoveObject(objectName);
        }
      }

      if (outputObjectsContainer.HasObjectNamed(objectName)) {
        // Keep the existing object, ensure the default behaviors
        // are all present (and no more than required by the object type).
        // Non default behaviors coming from parameters will be added or removed later.
        project.EnsureObjectDefaultBehaviors(outputObjectsContainer.GetObject(objectName));
      } else {
        // Create a new object (and its default behaviors) if needed.
        outputObjectsContainer.InsertNewObject(
            project,
            objectType,
            objectName,
            outputObjectsContainer.GetObjectsCount());
      }

      // Memorize the last object name. By convention, parameters that require
      // an object (mainly, "objectvar" and "behavior") should be placed after
      // the object in the list of parameters (if possible, just after).
      // Search "lastObjectName" in the codebase for other place where this
      // convention is enforced.
      lastObjectName = objectName;
    } else if (valueTypeMetadata.IsBehavior()) {
      if (!lastObjectName.empty()) {
        if (outputObjectsContainer.HasObjectNamed(lastObjectName)) {
          const gd::String& behaviorName = parameter.GetName();
          const gd::String& behaviorType = parameter.GetExtraInfo();

          gd::Object& object = outputObjectsContainer.GetObject(lastObjectName);
          allObjectNonDefaultBehaviorNames[lastObjectName].insert(behaviorName);

          // Check if we can keep the existing behavior.
          if (object.HasBehaviorNamed(behaviorName)) {
            if (object.GetBehavior(behaviorName).GetTypeName() !=
                behaviorType) {
              // Behavior type has changed, remove it so it is re-created.
              object.RemoveBehavior(behaviorName);
            }
          }

          if (!object.HasBehaviorNamed(behaviorName)) {
            object.AddNewBehavior(
                project, parameter.GetExtraInfo(), behaviorName);
          }
        }
      }
    }
  }

  // Remove objects that are not in the parameters anymore.
  std::set<gd::String> objectNamesInContainer =
      outputObjectsContainer.GetAllObjectNames();
  for (const auto& objectName : objectNamesInContainer) {
    if (allObjectNames.find(objectName) == allObjectNames.end()) {
      outputObjectsContainer.RemoveObject(objectName);
    }
  }

  // Remove behaviors of objects that are not in the parameters anymore.
  for (const auto& objectName : allObjectNames) {
    if (!outputObjectsContainer.HasObjectNamed(objectName)) {
      // Should not happen.
      continue;
    }

    auto& object = outputObjectsContainer.GetObject(objectName);
    const auto& allBehaviorNames = allObjectNonDefaultBehaviorNames[objectName];
    for (const auto& behaviorName : object.GetAllBehaviorNames()) {
      if (object.GetBehavior(behaviorName).IsDefaultBehavior()) {
        // Default behaviors are already ensured to be all present
        // (and no more than required by the object type).
        continue;
      }

      if (allBehaviorNames.find(behaviorName) == allBehaviorNames.end()) {
        object.RemoveBehavior(behaviorName);
      }
    }
  }
}

void ParameterMetadataTools::ForEachParameterMatchingSearch(
    const std::vector<const ParameterMetadataContainer*>&
        parametersVectorsList,
    const gd::String& search,
    std::function<void(const gd::ParameterMetadata&)> cb) {
  for (auto it = parametersVectorsList.rbegin();
       it != parametersVectorsList.rend();
       ++it) {
    const ParameterMetadataContainer* parametersVector = *it;

    for (const auto &parameterMetadata :
         parametersVector->GetInternalVector()) {
      if (parameterMetadata->GetName().FindCaseInsensitive(search) !=
          gd::String::npos)
        cb(*parameterMetadata);
    }
  }
}

bool ParameterMetadataTools::Has(
      const std::vector<const ParameterMetadataContainer*>& parametersVectorsList,
      const gd::String& parameterName) {
  for (auto it = parametersVectorsList.rbegin();
       it != parametersVectorsList.rend();
       ++it) {
    const ParameterMetadataContainer* parametersVector = *it;

    for (const auto& parameterMetadata: parametersVector->GetInternalVector()) {
      if (parameterMetadata->GetName() == parameterName) return true;
    }
  }

  return false;
}

const gd::ParameterMetadata& ParameterMetadataTools::Get(
    const std::vector<const ParameterMetadataContainer*>&
        parametersVectorsList,
    const gd::String& parameterName) {
  for (auto it = parametersVectorsList.rbegin();
       it != parametersVectorsList.rend();
       ++it) {
    const ParameterMetadataContainer* parametersVector = *it;

    for (const auto &parameterMetadata :
         parametersVector->GetInternalVector()) {
      if (parameterMetadata->GetName() == parameterName)
        return *parameterMetadata;
    }
  }

  return badParameterMetadata;
}

void ParameterMetadataTools::IterateOverParameters(
    const std::vector<gd::Expression>& parameters,
    const ParameterMetadataContainer& parametersMetadata,
    std::function<void(const gd::ParameterMetadata& parameterMetadata,
                       const gd::Expression& parameterValue,
                       const gd::String& lastObjectName)> fn) {
  IterateOverParametersWithIndex(
      parameters,
      parametersMetadata,
      [&fn](const gd::ParameterMetadata& parameterMetadata,
            const gd::Expression& parameterValue,
            size_t parameterIndex,
            const gd::String& lastObjectName) {
        fn(parameterMetadata, parameterValue, lastObjectName);
      });
}

void ParameterMetadataTools::IterateOverParametersWithIndex(
    const std::vector<gd::Expression>& parameters,
    const ParameterMetadataContainer& parametersMetadata,
    std::function<void(const gd::ParameterMetadata& parameterMetadata,
                       const gd::Expression& parameterValue,
                       size_t parameterIndex,
                       const gd::String& lastObjectName)> fn) {
  gd::String lastObjectName = "";
  for (std::size_t pNb = 0; pNb < parametersMetadata.GetParametersCount();
       ++pNb) {
    const gd::ParameterMetadata &parameterMetadata =
        parametersMetadata.GetParameter(pNb);
    const gd::Expression &parameterValue =
        pNb < parameters.size() ? parameters[pNb].GetPlainString() : "";
    const gd::Expression& parameterValueOrDefault =
        parameterValue.GetPlainString().empty() && parameterMetadata.IsOptional()
            ? Expression(parameterMetadata.GetDefaultValue())
            : parameterValue;

    fn(parameterMetadata, parameterValueOrDefault, pNb, lastObjectName);

    // Memorize the last object name. By convention, parameters that require
    // an object (mainly, "objectvar" and "behavior") should be placed after
    // the object in the list of parameters (if possible, just after).
    // Search "lastObjectName" in the codebase for other place where this
    // convention is enforced.
    if (gd::ParameterMetadata::IsObject(parameterMetadata.GetType()))
      lastObjectName = parameterValueOrDefault.GetPlainString();
  }
}

void ParameterMetadataTools::IterateOverParametersWithIndex(
    const gd::Platform &platform,
    const gd::ObjectsContainersList &objectsContainersList, FunctionCallNode &node,
    std::function<void(const gd::ParameterMetadata &parameterMetadata,
                       std::unique_ptr<gd::ExpressionNode> &parameterNode,
                       size_t parameterIndex, const gd::String &lastObjectName)>
        fn) {
  gd::String lastObjectName = node.objectName;

  const bool isObjectFunction = !node.objectName.empty();
  const gd::ExpressionMetadata &metadata =
      isObjectFunction ? MetadataProvider::GetObjectAnyExpressionMetadata(
                             platform,
                             objectsContainersList.GetTypeOfObject(node.objectName),
                             node.functionName)
                       : MetadataProvider::GetAnyExpressionMetadata(
                             platform, node.functionName);

  if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
    return;
  }

  size_t parameterIndex = 0;
  for (size_t metadataIndex = (isObjectFunction ? 1 : 0);
       metadataIndex < metadata.GetParameters().GetParametersCount() &&
       parameterIndex < node.parameters.size();
       ++metadataIndex) {
    auto &parameterMetadata = metadata.GetParameters().GetParameter(metadataIndex);
    if (parameterMetadata.IsCodeOnly()) {
      continue;
    }
    auto &parameterNode = node.parameters[parameterIndex];
    ++parameterIndex;

    fn(parameterMetadata, parameterNode, parameterIndex, lastObjectName);

    // Memorize the last object name. By convention, parameters that require
    // an object (mainly, "objectvar" and "behavior") should be placed after
    // the object in the list of parameters (if possible, just after).
    // Search "lastObjectName" in the codebase for other place where this
    // convention is enforced.
    if (gd::ParameterMetadata::IsObject(parameterMetadata.GetType()))
      // Object can't be expressions so it should always be the object name.
      lastObjectName =
          gd::ExpressionParser2NodePrinter::PrintNode(*parameterNode);
  }
}

size_t ParameterMetadataTools::GetObjectParameterIndexFor(
    const ParameterMetadataContainer& parametersMetadata,
    size_t parameterIndex) {
  // By convention, parameters that require
  // an object (mainly, "objectvar" and "behavior") should be placed after
  // the object in the list of parameters (if possible, just after).
  // Search "lastObjectName" in the codebase for other place where this
  // convention is enforced.
  for (std::size_t pNb = parameterIndex;
       pNb < parametersMetadata.GetParametersCount(); pNb--) {
    if (gd::ParameterMetadata::IsObject(
            parametersMetadata.GetParameter(pNb).GetType())) {
      return pNb;
    }
  }

  return gd::String::npos;
}

}  // namespace gd
