/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"
#include "ParameterOptions.h"

namespace gd {}  // namespace gd

namespace gd {

/**
 * \brief A "composite" metadata that can be used to easily declare
 * both an expression and a related condition (and a related action)
 * without writing manually the three of them.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API MultipleInstructionMetadata : public AbstractFunctionMetadata {
 public:
  static MultipleInstructionMetadata WithExpressionAndCondition(
      gd::ExpressionMetadata &expression, gd::InstructionMetadata &condition) {
    return MultipleInstructionMetadata(expression, condition);
  }
  static MultipleInstructionMetadata WithExpressionAndConditionAndAction(
      gd::ExpressionMetadata &expression,
      gd::InstructionMetadata &condition,
      gd::InstructionMetadata &action) {
    return MultipleInstructionMetadata(expression, condition, action);
  }
  static MultipleInstructionMetadata WithConditionAndAction(
      gd::InstructionMetadata &condition, gd::InstructionMetadata &action) {
    return MultipleInstructionMetadata(condition, action);
  }

  /**
   * \see gd::InstructionMetadata::AddParameter
   */
  MultipleInstructionMetadata &AddParameter(
      const gd::String &type,
      const gd::String &label,
      const gd::String &supplementaryInformation = "",
      bool parameterIsOptional = false) override {
    if (expression)
      expression->AddParameter(
          type, label, supplementaryInformation, parameterIsOptional);
    if (condition)
      condition->AddParameter(
          type, label, supplementaryInformation, parameterIsOptional);
    if (action)
      action->AddParameter(
          type, label, supplementaryInformation, parameterIsOptional);
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::AddCodeOnlyParameter
   */
  MultipleInstructionMetadata &AddCodeOnlyParameter(
      const gd::String &type, const gd::String &supplementaryInformation) override {
    if (expression)
      expression->AddCodeOnlyParameter(type, supplementaryInformation);
    if (condition)
      condition->AddCodeOnlyParameter(type, supplementaryInformation);
    if (action) action->AddCodeOnlyParameter(type, supplementaryInformation);
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::SetDefaultValue
   */
  MultipleInstructionMetadata &SetDefaultValue(const gd::String &defaultValue) override {
    if (expression) expression->SetDefaultValue(defaultValue);
    if (condition) condition->SetDefaultValue(defaultValue);
    if (action) action->SetDefaultValue(defaultValue);
    return *this;
  };

  /**
   * \see gd::InstructionMetadata::SetParameterExtraInfo
   */
  MultipleInstructionMetadata &SetParameterExtraInfo(
      const gd::String &defaultValue) override {
    if (expression) expression->SetParameterExtraInfo(defaultValue);
    if (condition) condition->SetParameterExtraInfo(defaultValue);
    if (action) action->SetParameterExtraInfo(defaultValue);
    return *this;
  };

  /**
   * \see gd::InstructionMetadata::SetParameterLongDescription
   */
  MultipleInstructionMetadata &SetParameterLongDescription(
      const gd::String &longDescription) override {
    if (expression) expression->SetParameterLongDescription(longDescription);
    if (condition) condition->SetParameterLongDescription(longDescription);
    if (action) action->SetParameterLongDescription(longDescription);
    return *this;
  };

  /**
   * \see gd::InstructionMetadata::SetHidden
   */
  MultipleInstructionMetadata &SetHidden() override {
    if (expression) expression->SetHidden();
    if (condition) condition->SetHidden();
    if (action) action->SetHidden();
    return *this;
  };

  /**
   * \see gd::InstructionMetadata::SetRequiresBaseObjectCapability
   */
  MultipleInstructionMetadata &SetRequiresBaseObjectCapability(
      const gd::String &capability) {
    if (expression) expression->SetRequiresBaseObjectCapability(capability);
    if (condition) condition->SetRequiresBaseObjectCapability(capability);
    if (action) action->SetRequiresBaseObjectCapability(capability);
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::UseStandardOperatorParameters
   * \see gd::InstructionMetadata::UseStandardRelationalOperatorParameters
   */
  MultipleInstructionMetadata &UseStandardParameters(
      const gd::String &type, const ParameterOptions &options) {
    if (condition)
      condition->UseStandardRelationalOperatorParameters(type, options);
    if (action) action->UseStandardOperatorParameters(type, options);
    return *this;
  }

  MultipleInstructionMetadata &SetFunctionName(const gd::String &functionName) override {
    if (expression) expression->SetFunctionName(functionName);
    if (condition) condition->SetFunctionName(functionName);
    if (action) action->SetFunctionName(functionName);
    return *this;
  }

  MultipleInstructionMetadata &SetGetter(const gd::String &getter) {
    if (expression) expression->SetFunctionName(getter);
    if (condition) condition->SetFunctionName(getter);
    if (action) action->SetGetter(getter);
    return *this;
  }

  /**
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
   */
  MultipleInstructionMetadata &SetIncludeFile(const gd::String &includeFile) override {
    if (expression)
      expression->SetIncludeFile(includeFile);
    if (condition)
      condition->SetIncludeFile(includeFile);
    if (action) action->SetIncludeFile(includeFile);
    return *this;
  }

  MultipleInstructionMetadata &AddIncludeFile(const gd::String &includeFile) override {
    if (expression)
      expression->GetCodeExtraInformation().AddIncludeFile(includeFile);
    if (condition)
      condition->AddIncludeFile(includeFile);
    if (action) action->AddIncludeFile(includeFile);
    return *this;
  }

  /**
   * \brief Get the files that must be included to use the instruction.
   */
  const std::vector<gd::String> &GetIncludeFiles() const override {
    if (expression)
      return expression->GetCodeExtraInformation().GetIncludeFiles();
    if (condition)
      return condition->GetIncludeFiles();
    if (action) return action->GetIncludeFiles();
    // It can't actually happen.
    throw std::logic_error("no instruction metadata");
  }

  /**
   * \see gd::InstructionMetadata::SetPrivate
   */
  MultipleInstructionMetadata &SetPrivate() override {
    if (expression) expression->SetPrivate();
    if (condition) condition->SetPrivate();
    if (action) action->SetPrivate();
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::SetHelpPath
   */
  MultipleInstructionMetadata &SetHelpPath(const gd::String &path) {
    if (expression) expression->SetHelpPath(path);
    if (condition) condition->SetHelpPath(path);
    if (action) action->SetHelpPath(path);
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::MarkAsSimple
   */
  MultipleInstructionMetadata &MarkAsSimple() {
    if (condition) condition->MarkAsSimple();
    if (action) action->MarkAsSimple();
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::MarkAsAdvanced
   */
  MultipleInstructionMetadata &MarkAsAdvanced() {
    if (condition) condition->MarkAsAdvanced();
    if (action) action->MarkAsAdvanced();
    return *this;
  }

  /**
   * \see gd::InstructionMetadata::MarkAsComplex
   */
  MultipleInstructionMetadata &MarkAsComplex() {
    if (condition) condition->MarkAsComplex();
    if (action) action->MarkAsComplex();
    return *this;
  }

  /**
   * Set that the instruction can be used in layouts or external events.
   */
  MultipleInstructionMetadata &SetRelevantForLayoutEventsOnly() override {
    if (condition) condition->SetRelevantForLayoutEventsOnly();
    if (action) action->SetRelevantForLayoutEventsOnly();
    return *this;
  }

  /**
   * Set that the instruction can be used in function events.
   */
  MultipleInstructionMetadata &SetRelevantForFunctionEventsOnly() override {
    if (condition) condition->SetRelevantForFunctionEventsOnly();
    if (action) action->SetRelevantForFunctionEventsOnly();
    return *this;
  }

  /**
   * Set that the instruction can be used in asynchronous function events.
   */
  MultipleInstructionMetadata &SetRelevantForAsynchronousFunctionEventsOnly() override {
    if (condition) condition->SetRelevantForAsynchronousFunctionEventsOnly();
    if (action) action->SetRelevantForAsynchronousFunctionEventsOnly();
    return *this;
  }

  /**
   * Set that the instruction can be used in custom object events.
   */
  MultipleInstructionMetadata &SetRelevantForCustomObjectEventsOnly() override {
    if (condition) condition->SetRelevantForCustomObjectEventsOnly();
    if (action) action->SetRelevantForCustomObjectEventsOnly();
    return *this;
  }

  /**
   * \brief Don't use, only here to fulfill Emscripten bindings requirements.
   */
  MultipleInstructionMetadata()
      : expression(nullptr), condition(nullptr), action(nullptr){};

 private:
  MultipleInstructionMetadata(gd::ExpressionMetadata &expression_,
                              gd::InstructionMetadata &condition_)
      : expression(&expression_), condition(&condition_), action(nullptr){};
  MultipleInstructionMetadata(gd::ExpressionMetadata &expression_,
                              gd::InstructionMetadata &condition_,
                              gd::InstructionMetadata &action_)
      : expression(&expression_), condition(&condition_), action(&action_){};
  MultipleInstructionMetadata(gd::InstructionMetadata &condition_,
                              gd::InstructionMetadata &action_)
      : expression(nullptr), condition(&condition_), action(&action_){};

  gd::ExpressionMetadata *expression;
  gd::InstructionMetadata *condition;
  gd::InstructionMetadata *action;
};

}  // namespace gd
