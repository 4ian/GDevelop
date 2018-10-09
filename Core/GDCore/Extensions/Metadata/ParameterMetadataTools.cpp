/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ParameterMetadataTools.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "InstructionMetadata.h"

namespace gd {
void ParameterMetadataTools::ParametersToObjectsContainer(
    gd::Project& project,
    const std::vector<gd::ParameterMetadata>& parameters,
    gd::ObjectsContainer& outputObjectsContainer) {
  outputObjectsContainer.GetObjects().clear();
  for (std::size_t i = 0; i < parameters.size(); ++i) {
    const auto& parameter = parameters[i];
    if (parameter.GetName().empty()) continue;

    if (gd::ParameterMetadata::IsObject(parameter.GetType())) {
      outputObjectsContainer.InsertNewObject(
          project,
          parameter.GetExtraInfo(),
          parameter.GetName(),
          outputObjectsContainer.GetObjectsCount());
    } else if (parameter.GetType() == "behavior") {
      // Convention is that behavior parameter is after an object parameter
      if (i != 0 &&
          gd::ParameterMetadata::IsObject(parameters[i - 1].GetType())) {
        gd::String objectName = parameter.GetName();
        if (outputObjectsContainer.HasObjectNamed(objectName)) {
          const gd::Object& object =
              outputObjectsContainer.GetObject(objectName);
          gd::String behaviorName = parameter.GetName();

          if (!object.HasBehaviorNamed(behaviorName)) {
            outputObjectsContainer.GetObject(objectName)
                .AddNewBehavior(
                    project, parameter.GetExtraInfo(), behaviorName);
          }
        }
      }
    }
  }
}
}  // namespace gd