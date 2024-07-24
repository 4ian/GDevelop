/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Project/VariablesContainer.h"

namespace gd {
class ObjectsContainersList;
class ObjectsContainer;
class ObjectGroup;
class VariablesContainer;
struct VariablesChangeset;
} // namespace gd

namespace gd {

/**
 * \brief
 */
class GD_CORE_API GroupVariableHelper {
public:
  /**
   * @brief
   */
  static void
  FillAnyVariableBetweenObjects(gd::ObjectsContainer &globalObjectsContainer,
                                gd::ObjectsContainer &objectsContainer,
                                const gd::ObjectGroup &objectGroup);

  /**
   * @brief
   */
  static gd::VariablesContainer MergeVariableContainers(
      const gd::ObjectsContainersList &objectsContainersList,
      const gd::ObjectGroup &objectGroup);

  /**
   * @brief
   */
  static void FillMissingGroupVariablesToObjects(
      gd::ObjectsContainer &globalObjectsContainer,
      gd::ObjectsContainer &objectsContainer,
      const gd::ObjectGroup &objectGroup,
      const gd::SerializerElement &originalSerializedVariables);

  /**
   * @brief
   */
  static void
  ApplyChangesToObjects(gd::ObjectsContainer &globalObjectsContainers,
                        gd::ObjectsContainer &objectsContainers,
                        const gd::VariablesContainer &groupVariablesContainer,
                        const gd::ObjectGroup &objectGroup,
                        const gd::VariablesChangeset &changeset);
};

} // namespace gd
