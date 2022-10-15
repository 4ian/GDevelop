/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ParameterMetadataTools.h"

#include "GDCore/Events/Expression.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "InstructionMetadata.h"

namespace gd {
void ParameterMetadataTools::ParametersToObjectsContainer(
    const gd::Project& project,
    const std::vector<gd::ParameterMetadata>& parameters,
    gd::ObjectsContainer& outputObjectsContainer) {
  outputObjectsContainer.GetObjects().clear();

  gd::String lastObjectName;
  for (std::size_t i = 0; i < parameters.size(); ++i) {
    const auto& parameter = parameters[i];
    if (parameter.GetName().empty()) continue;

    if (gd::ParameterMetadata::IsObject(parameter.GetType())) {
      outputObjectsContainer.InsertNewObject(
          project,
          parameter.GetExtraInfo(),
          parameter.GetName(),
          outputObjectsContainer.GetObjectsCount());

      // Memorize the last object name. By convention, parameters that require
      // an object (mainly, "objectvar" and "behavior") should be placed after
      // the object in the list of parameters (if possible, just after).
      // Search "lastObjectName" in the codebase for other place where this
      // convention is enforced.
      lastObjectName = parameter.GetName();
    } else if (gd::ParameterMetadata::IsBehavior(parameter.GetType())) {
      if (!lastObjectName.empty()) {
        if (outputObjectsContainer.HasObjectNamed(lastObjectName)) {
          const gd::Object& object =
              outputObjectsContainer.GetObject(lastObjectName);
          gd::String behaviorName = parameter.GetName();

          if (!object.HasBehaviorNamed(behaviorName)) {
            outputObjectsContainer.GetObject(lastObjectName)
                .AddNewBehavior(
                    project, parameter.GetExtraInfo(), behaviorName);
          }
        }
      }
    }
  }
}

void ParameterMetadataTools::IterateOverParameters(
    const std::vector<gd::Expression>& parameters,
    const std::vector<gd::ParameterMetadata>& parametersMetadata,
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
    const std::vector<gd::ParameterMetadata>& parametersMetadata,
    std::function<void(const gd::ParameterMetadata& parameterMetadata,
                       const gd::Expression& parameterValue,
                       size_t parameterIndex,
                       const gd::String& lastObjectName)> fn) {
  gd::String lastObjectName = "";
  for (std::size_t pNb = 0; pNb < parametersMetadata.size(); ++pNb) {
    const gd::ParameterMetadata& parameterMetadata = parametersMetadata[pNb];
    const gd::Expression& parameterValue =
        pNb < parameters.size() ? parameters[pNb].GetPlainString() : "";
    const gd::Expression& parameterValueOrDefault =
        parameterValue.GetPlainString().empty() && parameterMetadata.optional
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

size_t ParameterMetadataTools::GetObjectParameterIndexFor(
    const std::vector<gd::ParameterMetadata>& parametersMetadata,
    size_t parameterIndex) {
  // By convention, parameters that require
  // an object (mainly, "objectvar" and "behavior") should be placed after
  // the object in the list of parameters (if possible, just after).
  // Search "lastObjectName" in the codebase for other place where this
  // convention is enforced.
  for (std::size_t pNb = parameterIndex; pNb < parametersMetadata.size();
       pNb--) {
    if (gd::ParameterMetadata::IsObject(parametersMetadata[pNb].GetType())) {
      return pNb;
    }
  }

  return gd::String::npos;
}

}  // namespace gd
