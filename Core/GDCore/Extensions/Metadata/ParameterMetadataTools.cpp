/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ParameterMetadataTools.h"
#include "GDCore/Project/ClassWithObjects.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "InstructionMetadata.h"

namespace gd {
void ParameterMetadataTools::ParametersToObjectsContainer(
    gd::Project& project,
    const std::vector<gd::ParameterMetadata>& parameters,
    gd::ClassWithObjects& outputObjectsContainer) {
  auto getParameterName = [](std::size_t index) {
    return "Parameter" + gd::String::From(index);
  };

  for (std::size_t i = 0; i < parameters.size(); ++i) {
    const auto& parameter = parameters[i];
    if (gd::ParameterMetadata::IsObject(parameter.GetType())) {
      outputObjectsContainer.InsertNewObject(
          project,
          parameter.GetExtraInfo(),
          getParameterName(i),
          outputObjectsContainer.GetObjectsCount());
    } else if (parameter.GetType() == "behavior") {
      // Convention is that behavior parameter is after an object parameter
      if (i != 0 &&
          gd::ParameterMetadata::IsObject(parameters[i - 1].GetType())) {
        gd::String objectName = getParameterName(i - 1);
        if (outputObjectsContainer.HasObjectNamed(objectName)) {
          const gd::Object& object =
              outputObjectsContainer.GetObject(objectName);
          gd::String behaviorName = getParameterName(i);

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