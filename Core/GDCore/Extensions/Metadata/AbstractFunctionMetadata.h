/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <algorithm>
#include <functional>
#include <map>
#include <memory>

#include "GDCore/Events/Instruction.h"
#include "GDCore/String.h"
#include "ParameterMetadata.h"
#include "ParameterOptions.h"

namespace gd {
class Project;
class Layout;
class EventsCodeGenerator;
class EventsCodeGenerationContext;
class SerializerElement;
} // namespace gd

namespace gd {

/**
 * \brief Describe user-friendly information about an expression or an
 * instruction (action or condition), its parameters and the function name as
 * well as other information for code generation.
 *
 * \ingroup Events
 */
class GD_CORE_API AbstractFunctionMetadata {
public:
  AbstractFunctionMetadata(){};
  virtual ~AbstractFunctionMetadata(){};

  /**
   * \see gd::InstructionMetadata::AddParameter
   */
  virtual AbstractFunctionMetadata &
  AddParameter(const gd::String &type, const gd::String &label,
               const gd::String &supplementaryInformation = "",
               bool parameterIsOptional = false) = 0;

  /**
   * \see gd::InstructionMetadata::AddCodeOnlyParameter
   */
  virtual AbstractFunctionMetadata &
  AddCodeOnlyParameter(const gd::String &type,
                       const gd::String &supplementaryInformation) = 0;

  /**
   * \see gd::InstructionMetadata::SetDefaultValue
   */
  virtual AbstractFunctionMetadata &
  SetDefaultValue(const gd::String &defaultValue) = 0;

  /**
   * \see gd::InstructionMetadata::SetParameterExtraInfo
   */
  virtual AbstractFunctionMetadata &
  SetParameterExtraInfo(const gd::String &defaultValue) = 0;

  /**
   * \see gd::InstructionMetadata::SetParameterLongDescription
   */
  virtual AbstractFunctionMetadata &
  SetParameterLongDescription(const gd::String &longDescription) = 0;

  /**
   * \see gd::InstructionMetadata::SetHidden
   */
  virtual AbstractFunctionMetadata &SetHidden() = 0;

  /**
   * Set that the instruction is private - it can't be used outside of the
   * object/ behavior that it is attached too.
   */
  virtual AbstractFunctionMetadata &SetPrivate() = 0;

  /**
   * Set that the instruction can be used in layouts or external events.
   */
  virtual AbstractFunctionMetadata &SetRelevantForLayoutEventsOnly() = 0;

  /**
   * Set that the instruction can be used in function events.
   */
  virtual AbstractFunctionMetadata &SetRelevantForFunctionEventsOnly() = 0;

  /**
   * Set that the instruction can be used in asynchronous function events.
   */
  virtual AbstractFunctionMetadata &
  SetRelevantForAsynchronousFunctionEventsOnly() = 0;

  /**
   * Set that the instruction can be used in custom object events.
   */
  virtual AbstractFunctionMetadata &SetRelevantForCustomObjectEventsOnly() = 0;

  /**
   * \brief Set the function that should be called when generating the source
   * code from events.
   * \param functionName the name of the function to call
   * \note Shortcut for `codeExtraInformation.SetFunctionName`.
   */
  virtual AbstractFunctionMetadata &
  SetFunctionName(const gd::String &functionName) = 0;

  /**
   * \brief Erase any existing include file and add the specified include.
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
   */
  virtual AbstractFunctionMetadata &
  SetIncludeFile(const gd::String &includeFile) = 0;

  /**
   * \brief Add a file to the already existing include files.
   */
  virtual AbstractFunctionMetadata &
  AddIncludeFile(const gd::String &includeFile) = 0;

  /**
   * \brief Get the files that must be included to use the instruction.
   */
  virtual const std::vector<gd::String> &GetIncludeFiles() const = 0;

private:
};

} // namespace gd
