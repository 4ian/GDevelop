/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>

namespace gd {
class Platform;
class ProjectScopedContainers;
class ObjectsContainersList;
class Instruction;
class InstructionMetadata;
class String;
} // namespace gd

namespace gd {

class GD_CORE_API InstructionValidator {
public:
  static bool
  IsParameterValid(const gd::Platform &platform,
                   const gd::ProjectScopedContainers projectScopedContainers,
                   const gd::Instruction &instruction,
                   const InstructionMetadata &metadata,
                   std::size_t parameterIndex, const gd::String &value);

  static gd::String GetRootVariableName(const gd::String &name);

private:
  static bool
  HasRequiredBehaviors(const gd::Instruction &instruction,
                       const gd::InstructionMetadata &instructionMetadata,
                       std::size_t objectParameterIndex,
                       const gd::ObjectsContainersList &objectsContainersList);
};

} // namespace gd