/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <map>

#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"

namespace gd {
class Behavior;
class BehaviorsSharedData;
class MultipleInstructionMetadata;
class InstructionMetadata;
class ExpressionMetadata;
} // namespace gd

namespace gd {

/**
 * \brief Contains user-friendly information about instructions and expressions
 * (usually for a behavior or an object).
 *
 * \ingroup Events
 */
class GD_CORE_API InstructionOrExpressionContainerMetadata {
public:
  InstructionOrExpressionContainerMetadata(){};
  virtual ~InstructionOrExpressionContainerMetadata(){};

  /**
   * Declare a new condition as being part of the behavior or object.
   * \deprecated Prefer using `AddScopedCondition`, to properly namespace
   * the condition.
   */
  virtual gd::InstructionMetadata &
  AddCondition(const gd::String &name_, const gd::String &fullname_,
               const gd::String &description_, const gd::String &sentence_,
               const gd::String &group_, const gd::String &icon_,
               const gd::String &smallicon_) = 0;

  /**
   * Declare a new action as being part of the behavior or object.
   * \deprecated Prefer using `AddScopedAction`, to properly namespace
   * the action.
   */
  virtual gd::InstructionMetadata &
  AddAction(const gd::String &name_, const gd::String &fullname_,
            const gd::String &description_, const gd::String &sentence_,
            const gd::String &group_, const gd::String &icon_,
            const gd::String &smallicon_) = 0;

  /**
   * Declare a new condition as being part of the behavior or object.
   */
  virtual gd::InstructionMetadata &
  AddScopedCondition(const gd::String &name_, const gd::String &fullname_,
                     const gd::String &description_,
                     const gd::String &sentence_, const gd::String &group_,
                     const gd::String &icon_, const gd::String &smallicon_) = 0;

  /**
   * Declare a new action as being part of the behavior or object.
   */
  virtual gd::InstructionMetadata &
  AddScopedAction(const gd::String &name_, const gd::String &fullname_,
                  const gd::String &description_, const gd::String &sentence_,
                  const gd::String &group_, const gd::String &icon_,
                  const gd::String &smallicon_) = 0;
  /**
   * Declare a new action as being part of the extension.
   */
  virtual gd::ExpressionMetadata &
  AddExpression(const gd::String &name_, const gd::String &fullname_,
                const gd::String &description_, const gd::String &group_,
                const gd::String &smallicon_) = 0;

  /**
   * Declare a new string expression as being part of the extension.
   */
  virtual gd::ExpressionMetadata &
  AddStrExpression(const gd::String &name_, const gd::String &fullname_,
                   const gd::String &description_, const gd::String &group_,
                   const gd::String &smallicon_) = 0;

  /**
   * \brief Declare a new expression and condition as being part of the
   * behavior.
   * \note It's recommended to use this function to avoid declaring twice a
   * similar expression/condition.
   */
  virtual gd::MultipleInstructionMetadata AddExpressionAndCondition(
      const gd::String &type, const gd::String &name,
      const gd::String &fullname, const gd::String &description,
      const gd::String &sentenceName, const gd::String &group,
      const gd::String &icon) = 0;

  /**
   * \brief Declare a new expression, condition and action as being part of the
   * behavior.
   * \note The action name is prefixed by "Set" (and the namespace, as the
   * condition).
   * \note It's recommended to use this function to avoid declaring 3 times a
   * similar expression/condition/action.
   */
  virtual gd::MultipleInstructionMetadata AddExpressionAndConditionAndAction(
      const gd::String &type, const gd::String &name,
      const gd::String &fullname, const gd::String &description,
      const gd::String &sentenceName, const gd::String &group,
      const gd::String &icon) = 0;

  /**
   * \brief Create a new action which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated action that is just a "copy" of the new
   * one.
   */
  virtual gd::InstructionMetadata &
  AddDuplicatedAction(const gd::String &newActionName,
                      const gd::String &copiedActionName) = 0;

  /**
   * \brief Create a new condition which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated condition that is just a "copy" of the new
   * one.
   */
  virtual gd::InstructionMetadata &
  AddDuplicatedCondition(const gd::String &newConditionName,
                         const gd::String &copiedConditionName) = 0;

  virtual InstructionOrExpressionContainerMetadata &
  SetFullName(const gd::String &fullname_) = 0;
  virtual InstructionOrExpressionContainerMetadata &
  SetDescription(const gd::String &description_) = 0;

  /**
   * \brief Erase any existing include file and add the specified include.
   * \note The requirement may vary depending on the platform: Most of the time,
   * the include file contains the declaration of the behavior.
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
   */
  virtual InstructionOrExpressionContainerMetadata &
  SetIncludeFile(const gd::String &includeFile) = 0;

  /**
   * \brief Add a file to the already existing include files.
   */
  virtual InstructionOrExpressionContainerMetadata &
  AddIncludeFile(const gd::String &includeFile) = 0;

  /**
   * Get the help path of the behavior, relative to the GDevelop documentation
   * root.
   */
  virtual const gd::String &GetHelpPath() const = 0;

  /**
   * Set the help path of the behavior, relative to the GDevelop documentation
   * root.
   *
   * The behavior instructions will have this help path set by
   * default, unless you call SetHelpPath on them.
   */
  virtual InstructionOrExpressionContainerMetadata &
  SetHelpPath(const gd::String &path) = 0;

  virtual const gd::String &GetName() const = 0;
  virtual const gd::String &GetFullName() const = 0;
  virtual const gd::String &GetDescription() const = 0;
  virtual const gd::String &GetIconFilename() const = 0;

  /**
   * \brief Return a reference to a map containing the names of the actions
   * (as keys) and the metadata associated with (as values).
   */
  virtual std::map<gd::String, gd::InstructionMetadata> &GetAllActions() = 0;

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  virtual std::map<gd::String, gd::InstructionMetadata> &GetAllConditions() = 0;

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  virtual std::map<gd::String, gd::ExpressionMetadata> &GetAllExpressions() = 0;

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  virtual std::map<gd::String, gd::ExpressionMetadata> &
  GetAllStrExpressions() = 0;

private:
};

} // namespace gd
