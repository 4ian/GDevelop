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

/**
 * \brief Result of parameter validation containing both validity status
 * and deprecation warning.
 */
struct GD_CORE_API ParameterValidationResult {
  bool isValid = true;
  bool hasDeprecationWarning = false;

  ParameterValidationResult() = default;
  ParameterValidationResult(bool isValid_, bool hasDeprecationWarning_)
      : isValid(isValid_), hasDeprecationWarning(hasDeprecationWarning_) {}

  bool IsValid() const { return isValid; }
  bool HasDeprecationWarning() const { return hasDeprecationWarning; }
};

class GD_CORE_API InstructionValidator {
public:
  /**
   * \brief Validate a parameter and check for deprecation warnings in a single
   * pass.
   *
   * The parameter value is read from the instruction itself, so the displayed
   * (possibly defaulted) value doesn't have to be passed.
   */
  static ParameterValidationResult ValidateParameter(
      const gd::Platform &platform,
      const gd::ProjectScopedContainers projectScopedContainers,
      const gd::Instruction &instruction, const InstructionMetadata &metadata,
      std::size_t parameterIndex);

  /**
   * \brief Check if a parameter is valid.
   * \deprecated Use ValidateParameter instead for better performance when you
   * also need to check for deprecation warnings.
   */
  static bool
  IsParameterValid(const gd::Platform &platform,
                   const gd::ProjectScopedContainers projectScopedContainers,
                   const gd::Instruction &instruction,
                   const InstructionMetadata &metadata,
                   std::size_t parameterIndex);

  static gd::String GetRootVariableName(const gd::String &name);

private:
  static bool
  HasRequiredBehaviors(const gd::Instruction &instruction,
                       const gd::InstructionMetadata &instructionMetadata,
                       std::size_t objectParameterIndex,
                       const gd::ObjectsContainersList &objectsContainersList);
};

} // namespace gd