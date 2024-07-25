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
 * Help handling variables of group objects as a whole.
 *
 * This is used by the object group variable editor.
 */
class GD_CORE_API GroupVariableHelper {
public:
  /**
   * Copy every variable from every object of the group to the other objects
   * if they don't have it already.
   *
   * In the editor, when an object group is created, users can choose between:
   * - doing no change and only see variables that are already shared by any
   * objects of the group
   * - applying this function and see every variable
   */
  static void
  FillAnyVariableBetweenObjects(gd::ObjectsContainer &globalObjectsContainer,
                                gd::ObjectsContainer &objectsContainer,
                                const gd::ObjectGroup &objectGroup);

  /**
   * Build a variable container with the intersection of variables from the
   * every objects of the given group.
   */
  static gd::VariablesContainer MergeVariableContainers(
      const gd::ObjectsContainersList &objectsContainersList,
      const gd::ObjectGroup &objectGroup);

  /**
   * @brief Copy the variables of the group to all objects.
   *
   * Objects can be added during the group edition and may not necessarily have
   * all the variables initially shared by the group.
   *
   * \see gd::GroupVariableHelper::MergeVariableContainers
   */
  static void FillMissingGroupVariablesToObjects(
      gd::ObjectsContainer &globalObjectsContainer,
      gd::ObjectsContainer &objectsContainer,
      const gd::ObjectGroup &objectGroup,
      const gd::SerializerElement &originalSerializedVariables);

  /**
   * @brief Apply the changes done with the variables editor to the objects of
   * the group.
   */
  static void
  ApplyChangesToObjects(gd::ObjectsContainer &globalObjectsContainers,
                        gd::ObjectsContainer &objectsContainers,
                        const gd::VariablesContainer &groupVariablesContainer,
                        const gd::ObjectGroup &objectGroup,
                        const gd::VariablesChangeset &changeset);
};

} // namespace gd
