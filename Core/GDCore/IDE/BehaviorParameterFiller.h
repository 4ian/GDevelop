/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/Project/Variable.h"
#include "GDCore/String.h"

namespace gd {
class Instruction;
class Platform;
class ProjectScopedContainers;
class InstructionMetadata;
} // namespace gd

namespace gd {

class GD_CORE_API BehaviorParameterFiller {
public:
  /**
   * \brief Fill all empty or invalid behavior parameters according to the
   * objects.
   */
  static void FillBehaviorParameters(
      const gd::Platform &platform,
      const gd::ProjectScopedContainers &projectScopedContainers,
      const gd::InstructionMetadata &instructionMetadata,
      gd::Instruction &instruction);

private:
};
} // namespace gd
