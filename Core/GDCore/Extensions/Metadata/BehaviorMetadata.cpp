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
  // Be careful, behaviors expression do not have namespace ( not necessary as
  // we refer to the auomatism name in the expression )
  expressionsInfos[name] =
      ExpressionMetadata(
          extensionNamespace, name, fullname, description, group, smallicon)
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
  // Be careful, behaviors expression do not have namespace ( not necessary as
  // we refer to the auomatism name in the expression )
  strExpressionsInfos[name] =
      ExpressionMetadata(
          extensionNamespace, name, fullname, description, group, smallicon)
          .SetHelpPath(GetHelpPath());
  return strExpressionsInfos[name];
#endif
}

gd::MultipleInstructionMetadata BehaviorMetadata::AddExpressionAndCondition(
    const gd::String& type,
    const gd::String& name,
    const gd::String& fullname,
    const gd::String& description,
    const gd::String& sentenceName,
    const gd::String& group,
    const gd::String& icon) {
  auto& expression =
      type == "number"
          ? AddExpression(name, fullname, description, group, icon)
          : AddStrExpression(name, fullname, description, group, icon);
  auto& condition = AddScopedCondition(name,
                                 fullname,
                                 // TODO
                                 _("Compare ") + description,
                                 sentenceName + ""  // TODO
                                 ,
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
    const gd::String& description,
    const gd::String& sentenceName,
    const gd::String& group,
    const gd::String& icon) {
  auto& expression =
      type == "number"
          ? AddExpression(name, fullname, description, group, icon)
          : AddStrExpression(name, fullname, description, group, icon);
  // TODO: ScopedCondition
  auto& condition = AddScopedCondition(name,
                                 fullname,
                                 // TODO
                                 _("Compare ") + description,
                                 sentenceName + ""  // TODO
                                 ,
                                 group,
                                 icon,
                                 icon);
  // TODO: ScopedAction
  auto& action = AddScopedAction("Set" + name,
                           fullname,
                           // TODO
                           _("Change ") + description,
                           sentenceName + ""  // TODO
                           ,
                           group,
                           icon,
                           icon);

  return MultipleInstructionMetadata::WithExpressionAndConditionAndAction(
      expression, condition, action);
}

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

}  // namespace gd
