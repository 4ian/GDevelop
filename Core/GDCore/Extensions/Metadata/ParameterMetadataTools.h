/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include <functional>
#include <vector>
#include <memory>
#include "GDCore/String.h"
namespace gd {
class Platform;
class Project;
class ObjectsContainer;
class ObjectsContainersList;
class ParameterMetadata;
class Expression;
struct FunctionCallNode;
struct ExpressionNode;
}  // namespace gd

namespace gd {
class GD_CORE_API ParameterMetadataTools {
 public:
  static void ParametersToObjectsContainer(
      const gd::Project& project,
      const std::vector<gd::ParameterMetadata>& parameters,
      gd::ObjectsContainer& outputObjectsContainer);

  static void ForEachParameterMatchingSearch(
      const std::vector<const std::vector<gd::ParameterMetadata>*>& parametersVectorsList,
      const gd::String& search,
      std::function<void(const gd::ParameterMetadata&)> cb);

  static bool Has(
      const std::vector<const std::vector<gd::ParameterMetadata>*>& parametersVectorsList,
      const gd::String& parameterName);

  static const gd::ParameterMetadata& Get(
      const std::vector<const std::vector<gd::ParameterMetadata>*>& parametersVectorsList,
      const gd::String& parameterName);

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
   * Iterate over the parameters of a FunctionCallNode.
   * Callback function is called with the parameter metadata, its value
   * and if applicable the name of the object it's linked to.
   */
  static void IterateOverParametersWithIndex(
      const gd::Platform &platform,
      const gd::ObjectsContainersList &objectsContainersList, FunctionCallNode &node,
      std::function<void(const gd::ParameterMetadata &parameterMetadata,
                         std::unique_ptr<gd::ExpressionNode> &parameterNode,
                         size_t parameterIndex,
                         const gd::String &lastObjectName)>
          fn);

  /**
   * Given a parameter, return, if applicable, the index of the object parameter
   * it's linked to.
   */
  static size_t GetObjectParameterIndexFor(
      const std::vector<gd::ParameterMetadata>& parametersMetadata,
      size_t parameterIndex);

private:
  static const gd::ParameterMetadata badParameterMetadata;
};
}  // namespace gd
