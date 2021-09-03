/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorMetadata.h"

#include <iostream>

#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

namespace gd {

BehaviorMetadata::BehaviorMetadata(
    const gd::String& extensionNamespace_,
    const gd::String& name_,
    const gd::String& fullname_,
    const gd::String& defaultName_,
    const gd::String& description_,
    const gd::String& group_,
    const gd::String& icon24x24,
    const gd::String& className_,
    std::shared_ptr<gd::Behavior> instance_,
    std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance_)
    : extensionNamespace(extensionNamespace_),
      instance(instance_),
      sharedDatasInstance(sharedDatasInstance_) {
#if defined(GD_IDE_ONLY)
  SetFullName(gd::String(fullname_));
  SetDescription(gd::String(description_));
  SetDefaultName(gd::String(defaultName_));
  SetGroup(group_);
  className = className_;
  iconFilename = icon24x24;
#endif

  if (instance) instance->SetTypeName(name_);
  if (sharedDatasInstance) sharedDatasInstance->SetTypeName(name_);
}

gd::InstructionMetadata& BehaviorMetadata::AddCondition(
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& sentence,
    const gd::String& group,
    const gd::String& icon,
    const gd::String& smallicon) {
#if defined(GD_IDE_ONLY)
  gd::String nameWithNamespace =
      extensionNamespace.empty() ? name : extensionNamespace + name;
  conditionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace,
                                                           nameWithNamespace,
                                                           fullname,
                                                           description,
                                                           sentence,
                                                           group,
                                                           icon,
                                                           smallicon)
                                           .SetHelpPath(GetHelpPath())
                                           .SetIsBehaviorInstruction();
  return conditionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata& BehaviorMetadata::AddAction(
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& sentence,
    const gd::String& group,
    const gd::String& icon,
    const gd::String& smallicon) {
#if defined(GD_IDE_ONLY)
  gd::String nameWithNamespace =
      extensionNamespace.empty() ? name : extensionNamespace + name;
  actionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace,
                                                        nameWithNamespace,
                                                        fullname,
                                                        description,
                                                        sentence,
                                                        group,
                                                        icon,
                                                        smallicon)
                                        .SetHelpPath(GetHelpPath())
                                        .SetIsBehaviorInstruction();
  return actionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata& BehaviorMetadata::AddScopedCondition(
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& sentence,
    const gd::String& group,
    const gd::String& icon,
    const gd::String& smallicon) {
#if defined(GD_IDE_ONLY)
  gd::String nameWithNamespace =
      GetName() + gd::PlatformExtension::GetNamespaceSeparator() + name;
  conditionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace,
                                                           nameWithNamespace,
                                                           fullname,
                                                           description,
                                                           sentence,
                                                           group,
                                                           icon,
                                                           smallicon)
                                           .SetHelpPath(GetHelpPath())
                                           .SetIsBehaviorInstruction();
  return conditionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata& BehaviorMetadata::AddScopedAction(
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& sentence,
    const gd::String& group,
    const gd::String& icon,
    const gd::String& smallicon) {
#if defined(GD_IDE_ONLY)
  gd::String nameWithNamespace =
      GetName() + gd::PlatformExtension::GetNamespaceSeparator() + name;
  actionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace,
                                                        nameWithNamespace,
                                                        fullname,
                                                        description,
                                                        sentence,
                                                        group,
                                                        icon,
                                                        smallicon)
                                        .SetHelpPath(GetHelpPath())
                                        .SetIsBehaviorInstruction();
  return actionsInfos[nameWithNamespace];
#endif
}

gd::ExpressionMetadata& BehaviorMetadata::AddExpression(
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& group,
    const gd::String& smallicon) {
#if defined(GD_IDE_ONLY)
  // Be careful, behaviors expression do not have namespace (not necessary as
  // we refer to the behavior name in the expression).
  expressionsInfos[name] = ExpressionMetadata("number",
                                              extensionNamespace,
                                              name,
                                              fullname,
                                              description,
                                              group,
                                              smallicon)
                               .SetHelpPath(GetHelpPath());
  return expressionsInfos[name];
#endif
}

gd::ExpressionMetadata& BehaviorMetadata::AddStrExpression(
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& group,
    const gd::String& smallicon) {
#if defined(GD_IDE_ONLY)
  // Be careful, behaviors expression do not have namespace (not necessary as
  // we refer to the behavior name in the expression).
  strExpressionsInfos[name] = ExpressionMetadata("string",
                                                 extensionNamespace,
                                                 name,
                                                 fullname,
                                                 description,
                                                 group,
                                                 smallicon)
                                  .SetHelpPath(GetHelpPath());
  return strExpressionsInfos[name];
#endif
}

gd::MultipleInstructionMetadata BehaviorMetadata::AddExpressionAndCondition(
    const gd::String& type,
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& descriptionSubject,
    const gd::String& sentenceName,
    const gd::String& group,
    const gd::String& icon) {
  gd::String expressionDescriptionTemplate = _("Return <subject>.");
  auto& expression =
      type == "number"
          ? AddExpression(name,
                          fullname,
                          expressionDescriptionTemplate.FindAndReplace(
                              "<subject>", descriptionSubject),
                          group,
                          icon)
          : AddStrExpression(name,
                             fullname,
                             expressionDescriptionTemplate.FindAndReplace(
                                 "<subject>", descriptionSubject),
                             group,
                             icon);

  gd::String conditionDescriptionTemplate = _("Compare <subject>.");
  auto& condition =
      AddScopedCondition(name,
                         fullname,
                         conditionDescriptionTemplate.FindAndReplace(
                             "<subject>", descriptionSubject),
                         sentenceName,
                         group,
                         icon,
                         icon);

  return MultipleInstructionMetadata::WithExpressionAndCondition(expression,
                                                                 condition);
}

gd::MultipleInstructionMetadata
BehaviorMetadata::AddExpressionAndConditionAndAction(
    const gd::String& type,
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& descriptionSubject,
    const gd::String& sentenceName,
    const gd::String& group,
    const gd::String& icon) {
  gd::String expressionDescriptionTemplate = _("Return <subject>.");
  auto& expression =
      type == "number"
          ? AddExpression(name,
                          fullname,
                          expressionDescriptionTemplate.FindAndReplace(
                              "<subject>", descriptionSubject),
                          group,
                          icon)
          : AddStrExpression(name,
                             fullname,
                             expressionDescriptionTemplate.FindAndReplace(
                                 "<subject>", descriptionSubject),
                             group,
                             icon);

  gd::String conditionDescriptionTemplate = _("Compare <subject>.");
  auto& condition =
      AddScopedCondition(name,
                         fullname,
                         conditionDescriptionTemplate.FindAndReplace(
                             "<subject>", descriptionSubject),
                         sentenceName,
                         group,
                         icon,
                         icon);

  gd::String actionDescriptionTemplate = _("Change <subject>.");
  auto& action = AddScopedAction(
      "Set" + name,
      fullname,
      actionDescriptionTemplate.FindAndReplace("<subject>", descriptionSubject),
      sentenceName,
      group,
      icon,
      icon);

  return MultipleInstructionMetadata::WithExpressionAndConditionAndAction(
      expression, condition, action);
}

#if defined(GD_IDE_ONLY)
gd::InstructionMetadata& BehaviorMetadata::AddDuplicatedAction(
    const gd::String& newActionName, const gd::String& copiedActionName) {
  gd::String newNameWithNamespace = extensionNamespace + newActionName;
  gd::String copiedNameWithNamespace = extensionNamespace + copiedActionName;

  auto copiedAction = actionsInfos.find(copiedNameWithNamespace);
  if (copiedAction == actionsInfos.end()) {
    gd::LogWarning("Could not find an action with name " +
                   copiedNameWithNamespace + " to copy.");
  } else {
    actionsInfos[newNameWithNamespace] = copiedAction->second;
  }

  return actionsInfos[newNameWithNamespace];
}

gd::InstructionMetadata& BehaviorMetadata::AddDuplicatedCondition(
    const gd::String& newConditionName, const gd::String& copiedConditionName) {
  gd::String newNameWithNamespace = extensionNamespace + newConditionName;
  gd::String copiedNameWithNamespace = extensionNamespace + copiedConditionName;

  auto copiedCondition = conditionsInfos.find(copiedNameWithNamespace);
  if (copiedCondition == conditionsInfos.end()) {
    gd::LogWarning("Could not find a condition with name " +
                   copiedNameWithNamespace + " to copy.");
  } else {
    conditionsInfos[newNameWithNamespace] = copiedCondition->second;
  }

  return conditionsInfos[newNameWithNamespace];
}

gd::ExpressionMetadata& BehaviorMetadata::AddDuplicatedExpression(
    const gd::String& newExpressionName,
    const gd::String& copiedExpressionName) {
  gd::String newNameWithNamespace = extensionNamespace + newExpressionName;
  gd::String copiedNameWithNamespace =
      extensionNamespace + copiedExpressionName;

  auto copiedExpression = expressionsInfos.find(copiedNameWithNamespace);
  if (copiedExpression == expressionsInfos.end()) {
    gd::LogWarning("Could not find an expression with name " +
                   copiedNameWithNamespace + " to copy.");
  } else {
    expressionsInfos[newNameWithNamespace] = copiedExpression->second;
  }

  return expressionsInfos[newNameWithNamespace];
}

gd::ExpressionMetadata& BehaviorMetadata::AddDuplicatedStrExpression(
    const gd::String& newExpressionName,
    const gd::String& copiedExpressionName) {
  gd::String newNameWithNamespace = extensionNamespace + newExpressionName;
  gd::String copiedNameWithNamespace =
      extensionNamespace + copiedExpressionName;

  auto copiedExpression = strExpressionsInfos.find(copiedNameWithNamespace);
  if (copiedExpression == strExpressionsInfos.end()) {
    gd::LogWarning("Could not find a string expression with name " +
                   copiedNameWithNamespace + " to copy.");
  } else {
    strExpressionsInfos[newNameWithNamespace] = copiedExpression->second;
  }

  return strExpressionsInfos[newNameWithNamespace];
}
#endif

BehaviorMetadata& BehaviorMetadata::SetFullName(const gd::String& fullname_) {
#if defined(GD_IDE_ONLY)
  fullname = fullname_;
#endif
  return *this;
}
BehaviorMetadata& BehaviorMetadata::SetDefaultName(
    const gd::String& defaultName_) {
#if defined(GD_IDE_ONLY)
  defaultName = defaultName_;
#endif
  return *this;
}
BehaviorMetadata& BehaviorMetadata::SetDescription(
    const gd::String& description_) {
#if defined(GD_IDE_ONLY)
  description = description_;
#endif
  return *this;
}
BehaviorMetadata& BehaviorMetadata::SetGroup(const gd::String& group_) {
#if defined(GD_IDE_ONLY)
  group = group_;
#endif
  return *this;
}
BehaviorMetadata& BehaviorMetadata::SetIncludeFile(
    const gd::String& includeFile) {
#if defined(GD_IDE_ONLY)
  includeFiles.clear();
  includeFiles.push_back(includeFile);
#endif
  return *this;
}
BehaviorMetadata& BehaviorMetadata::AddIncludeFile(
    const gd::String& includeFile) {
#if defined(GD_IDE_ONLY)
  if (std::find(includeFiles.begin(), includeFiles.end(), includeFile) ==
      includeFiles.end())
    includeFiles.push_back(includeFile);
#endif
  return *this;
}

const gd::String& BehaviorMetadata::GetName() const {
  return instance->GetTypeName();
}

gd::Behavior& BehaviorMetadata::Get() const {
  if (!instance)
    gd::LogFatalError(
        "Trying to get a behavior from a BehaviorMetadata that has no "
        "behavior. This will crash - please double check that the "
        "BehaviorMetadata is valid.");

  return *instance;
}

}  // namespace gd
