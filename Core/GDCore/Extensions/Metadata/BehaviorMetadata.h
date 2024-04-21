/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "InstructionOrExpressionContainerMetadata.h"

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
class PropertyDescriptor;
}  // namespace gd

namespace gd {

/**
 * \brief Contains user-friendly information about a behavior type.
 *
 * \ingroup Events
 */
class GD_CORE_API BehaviorMetadata : public InstructionOrExpressionContainerMetadata {
 public:
  BehaviorMetadata(
      const gd::String& extensionNamespace,
      const gd::String& nameWithNamespace,
      const gd::String& fullname_,
      const gd::String& defaultName_,
      const gd::String& description_,
      const gd::String& group_,
      const gd::String& icon24x24_,
      const gd::String& className_,
      std::shared_ptr<gd::Behavior> instance,
      std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance);
      
  /**
   * \brief Construct a behavior metadata, without "blueprint" behavior.
   * 
   * \note This is used by events based behaviors.
   */
  BehaviorMetadata(
      const gd::String& extensionNamespace,
      const gd::String& nameWithNamespace,
      const gd::String& fullname_,
      const gd::String& defaultName_,
      const gd::String& description_,
      const gd::String& group_,
      const gd::String& icon24x24_);

  BehaviorMetadata(){};
  virtual ~BehaviorMetadata(){};

  /**
   * Declare a new condition as being part of the behavior.
   * \deprecated Prefer using `AddScopedCondition`, to properly namespace
   * the condition.
   */
  gd::InstructionMetadata& AddCondition(const gd::String& name_,
                                        const gd::String& fullname_,
                                        const gd::String& description_,
                                        const gd::String& sentence_,
                                        const gd::String& group_,
                                        const gd::String& icon_,
                                        const gd::String& smallicon_) override;

  /**
   * Declare a new action as being part of the behavior.
   * \deprecated Prefer using `AddScopedAction`, to properly namespace
   * the action.
   */
  gd::InstructionMetadata& AddAction(const gd::String& name_,
                                     const gd::String& fullname_,
                                     const gd::String& description_,
                                     const gd::String& sentence_,
                                     const gd::String& group_,
                                     const gd::String& icon_,
                                     const gd::String& smallicon_) override;

  /**
   * Declare a new condition as being part of the behavior.
   */
  gd::InstructionMetadata& AddScopedCondition(const gd::String& name_,
                                              const gd::String& fullname_,
                                              const gd::String& description_,
                                              const gd::String& sentence_,
                                              const gd::String& group_,
                                              const gd::String& icon_,
                                              const gd::String& smallicon_) override;

  /**
   * Declare a new action as being part of the behavior.
   */
  gd::InstructionMetadata& AddScopedAction(const gd::String& name_,
                                           const gd::String& fullname_,
                                           const gd::String& description_,
                                           const gd::String& sentence_,
                                           const gd::String& group_,
                                           const gd::String& icon_,
                                           const gd::String& smallicon_) override;
  /**
   * Declare a new action as being part of the extension.
   */
  gd::ExpressionMetadata& AddExpression(const gd::String& name_,
                                        const gd::String& fullname_,
                                        const gd::String& description_,
                                        const gd::String& group_,
                                        const gd::String& smallicon_) override;

  /**
   * Declare a new string expression as being part of the extension.
   */
  gd::ExpressionMetadata& AddStrExpression(const gd::String& name_,
                                           const gd::String& fullname_,
                                           const gd::String& description_,
                                           const gd::String& group_,
                                           const gd::String& smallicon_) override;

  /**
   * \brief Declare a new expression and condition as being part of the
   * behavior.
   * \note It's recommended to use this function to avoid declaring twice a
   * similar expression/condition.
   */
  gd::MultipleInstructionMetadata AddExpressionAndCondition(
      const gd::String& type,
      const gd::String& name,
      const gd::String& fullname,
      const gd::String& description,
      const gd::String& sentenceName,
      const gd::String& group,
      const gd::String& icon) override;

  /**
   * \brief Declare a new expression, condition and action as being part of the
   * behavior.
   * \note The action name is prefixed by "Set" (and the namespace, as the
   * condition).
   * \note It's recommended to use this function to avoid declaring 3 times a
   * similar expression/condition/action.
   */
  gd::MultipleInstructionMetadata AddExpressionAndConditionAndAction(
      const gd::String& type,
      const gd::String& name,
      const gd::String& fullname,
      const gd::String& description,
      const gd::String& sentenceName,
      const gd::String& group,
      const gd::String& icon) override;

  /**
   * \brief Create a new action which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated action that is just a "copy" of the new
   * one.
   */
  gd::InstructionMetadata& AddDuplicatedAction(
      const gd::String& newActionName, const gd::String& copiedActionName) override;

  /**
   * \brief Create a new condition which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated condition that is just a "copy" of the new
   * one.
   */
  gd::InstructionMetadata& AddDuplicatedCondition(
      const gd::String& newConditionName,
      const gd::String& copiedConditionName) override;

  /**
   * \brief Create a new expression which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated expression that is just a "copy" of the
   * new one.
   */
  gd::ExpressionMetadata& AddDuplicatedExpression(
      const gd::String& newExpressionName,
      const gd::String& copiedExpressionName);

  /**
   * \brief Create a new string expression which is the duplicate of the
   * specified one.
   *
   * Useful for handling a deprecated string expression that is just a "copy" of
   * the new one.
   */
  gd::ExpressionMetadata& AddDuplicatedStrExpression(
      const gd::String& newExpressionName,
      const gd::String& copiedExpressionName);

  BehaviorMetadata& SetFullName(const gd::String& fullname_) override;
  BehaviorMetadata& SetDefaultName(const gd::String& defaultName_);
  BehaviorMetadata& SetDescription(const gd::String& description_) override;
  BehaviorMetadata& SetGroup(const gd::String& group_);

  /**
   * \brief Erase any existing include file and add the specified include.
   * \note The requirement may vary depending on the platform: Most of the time,
   * the include file contains the declaration of the behavior.
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
   */
  BehaviorMetadata& SetIncludeFile(const gd::String& includeFile) override;

  /**
   * \brief Add a file to the already existing include files.
   */
  BehaviorMetadata& AddIncludeFile(const gd::String& includeFile) override;

  /**
   * \brief Add a file to the already existing required files.
   * \note These files are required for the behavior to work,
   * but they are not executable.
   */
  BehaviorMetadata& AddRequiredFile(const gd::String& requiredFile);

  /**
   * Get the help path of the behavior, relative to the GDevelop documentation
   * root.
   */
  const gd::String& GetHelpPath() const override { return helpPath; }

  /**
   * Set the help path of the behavior, relative to the GDevelop documentation
   * root.
   *
   * The behavior instructions will have this help path set by
   * default, unless you call SetHelpPath on them.
   */
  BehaviorMetadata& SetHelpPath(const gd::String& path) override {
    helpPath = path;
    return *this;
  }

  const gd::String& GetName() const override;
  const gd::String& GetFullName() const override { return fullname; }
  const gd::String& GetDefaultName() const { return defaultName; }
  const gd::String& GetDescription() const override { return description; }
  const gd::String& GetGroup() const { return group; }
  const gd::String& GetIconFilename() const override { return iconFilename; }

  /**
   * \brief Set the type of the object that this behavior can be used on.
   */
  BehaviorMetadata& SetObjectType(const gd::String& objectType_) {
    objectType = objectType_;
    return *this;
  }

  /**
   * \brief Get the type of the object that this behavior can be used on.
   *
   * \note An empty string means the base object, so any object.
   */
  const gd::String& GetObjectType() const { return objectType; }

  /**
   * \brief Get the types of the behaviors that are required by this behavior.
   */
  const std::vector<gd::String>& GetRequiredBehaviorTypes() const;

  /**
   * Check if the behavior is private - it can't be used outside of its
   * extension.
   */
  bool IsPrivate() const { return isPrivate; }

  /**
   * Set that the behavior is private - it can't be used outside of its
   * extension.
   */
  BehaviorMetadata &SetPrivate() {
    isPrivate = true;
    return *this;
  }

  /**
   * Check if the behavior is hidden - it can be used but not attached to
   * objects by users.
   */
  bool IsHidden() const { return isHidden; }

  /**
   * Set that the behavior is hidden - it can be used but not attached to
   * objects by users.
   */
  BehaviorMetadata &SetHidden() {
    isHidden = true;
    return *this;
  }

  /**
   * \brief Return the associated gd::Behavior, handling behavior contents.
   * 
   * \note Returns a dumb Behavior for events based behaviors as CustomBehavior
   * are using EventBasedBehavior.
   */
  gd::Behavior& Get() const;

  /**
   * \brief Called when the IDE wants to know about the custom properties of the
   * behavior.
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  std::map<gd::String, gd::PropertyDescriptor> GetProperties() const;

  /**
   * \brief Return the associated gd::BehaviorsSharedData, handling behavior
   * shared data, if any (nullptr if none).
   * 
   * \note Returns nullptr for events based behaviors as they don't declare
   * shared data yet.
   */
  gd::BehaviorsSharedData* GetSharedDataInstance() const;

  /**
   * \brief Called when the IDE wants to know about the custom shared properties
   * of the behavior.
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  std::map<gd::String, gd::PropertyDescriptor> GetSharedProperties() const;

  /**
   * \brief Return a reference to a map containing the names of the actions
   * (as keys) and the metadata associated with (as values).
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllActions() override { return actionsInfos; };

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllConditions() override { return conditionsInfos; };

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllExpressions() override { return expressionsInfos; };

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllStrExpressions() override { return strExpressionsInfos; };

  std::map<gd::String, gd::InstructionMetadata> conditionsInfos;
  std::map<gd::String, gd::InstructionMetadata> actionsInfos;
  std::map<gd::String, gd::ExpressionMetadata> expressionsInfos;
  std::map<gd::String, gd::ExpressionMetadata> strExpressionsInfos;

  std::vector<gd::String> includeFiles;
  std::vector<gd::String> requiredFiles;
  gd::String className;

 private:
  gd::String extensionNamespace;
  gd::String helpPath;
  gd::String fullname;
  gd::String defaultName;
  gd::String description;
  gd::String group;
  gd::String iconFilename;
  gd::String objectType;
  mutable std::vector<gd::String> requiredBehaviors;
  bool isPrivate = false;
  bool isHidden = false;

  // TODO: Nitpicking: convert these to std::unique_ptr to clarify ownership.
  std::shared_ptr<gd::Behavior> instance;
  std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance;

  static const std::map<gd::String, gd::PropertyDescriptor> badProperties;
};

}  // namespace gd
