/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef ParameterMetadataTools_H
#define ParameterMetadataTools_H
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
class ObjectsContainer;
class ParameterMetadata;
class Expression;
}  // namespace gd

namespace gd {
class GD_CORE_API ParameterMetadataTools {
 public:
  static void ParametersToObjectsContainer(
      const gd::Project& project,
      const std::vector<gd::ParameterMetadata>& parameters,
      gd::ObjectsContainer& outputObjectsContainer);

  /**
   * Iterate over a list of parameters and their values.
   * Callback function is called with the parameter metadata, its value
   * and if applicable the name of the object it's linked to.
   */
  static void IterateOverParameters(
      const std::vector<gd::Expression>& parameters,
      const std::vector<gd::ParameterMetadata>& parametersMetadata,
      std::function<void(const gd::ParameterMetadata& parameterMetadata,
                         const gd::Expression& parameterValue,
                         const gd::String& lastObjectName)> fn);

  /**
   * Iterate over a list of parameters and their values.
   * Callback function is called with the parameter metadata, its value
   * and if applicable the name of the object it's linked to.
   */
  static void IterateOverParametersWithIndex(
      const std::vector<gd::Expression>& parameters,
      const std::vector<gd::ParameterMetadata>& parametersMetadata,
      std::function<void(const gd::ParameterMetadata& parameterMetadata,
                         const gd::Expression& parameterValue,
                         size_t parameterIndex,
                         const gd::String& lastObjectName)> fn);

  /**
   * Given a parameter, return, if applicable, the index of the object parameter
   * it's linked to.
   */
  static size_t GetObjectParameterIndexFor(
      const std::vector<gd::ParameterMetadata>& parametersMetadata,
      size_t parameterIndex);
};
}  // namespace gd

#endif  // ParameterMetadataTools_H
#endif
