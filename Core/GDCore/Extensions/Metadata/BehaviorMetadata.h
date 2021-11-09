/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef BEHAVIORMETADATA_H
#define BEHAVIORMETADATA_H
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
}  // namespace gd

namespace gd {

/**
 * \brief Contains user-friendly information about a behavior type.
 *
 * \ingroup Events
 */
class GD_CORE_API BehaviorMetadata {
 public:
  BehaviorMetadata(
      const gd::String& extensionNamespace,
      const gd::String& name_,
      const gd::String& fullname_,
      const gd::String& defaultName_,
      const gd::String& description_,
      const gd::String& group_,
      const gd::String& icon24x24_,
      const gd::String& className_,
      std::shared_ptr<gd::Behavior> instance,
      std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance);
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
                                        const gd::String& smallicon_);

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
                                     const gd::String& smallicon_);

  /**
   * Declare a new condition as being part of the behavior.
   */
  gd::InstructionMetadata& AddScopedCondition(const gd::String& name_,
                                              const gd::String& fullname_,
                                              const gd::String& description_,
                                              const gd::String& sentence_,
                                              const gd::String& group_,
                                              const gd::String& icon_,
                                              const gd::String& smallicon_);

  /**
   * Declare a new action as being part of the behavior.
   */
  gd::InstructionMetadata& AddScopedAction(const gd::String& name_,
                                           const gd::String& fullname_,
                                           const gd::String& description_,
                                           const gd::String& sentence_,
                                           const gd::String& group_,
                                           const gd::String& icon_,
                                           const gd::String& smallicon_);
  /**
   * Declare a new action as being part of the extension.
   */
  gd::ExpressionMetadata& AddExpression(const gd::String& name_,
                                        const gd::String& fullname_,
                                        const gd::String& description_,
                                        const gd::String& group_,
                                        const gd::String& smallicon_);

  /**
   * Declare a new string expression as being part of the extension.
   */
  gd::ExpressionMetadata& AddStrExpression(const gd::String& name_,
                                           const gd::String& fullname_,
                                           const gd::String& description_,
                                           const gd::String& group_,
                                           const gd::String& smallicon_);

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
      const gd::String& icon);

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
      const gd::String& icon);

  /**
   * \brief Create a new action which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated action that is just a "copy" of the new
   * one.
   */
  gd::InstructionMetadata& AddDuplicatedAction(
      const gd::String& newActionName, const gd::String& copiedActionName);

  /**
   * \brief Create a new condition which is the duplicate of the specified one.
   *
   * Useful for handling a deprecated condition that is just a "copy" of the new
   * one.
   */
  gd::InstructionMetadata& AddDuplicatedCondition(
      const gd::String& newConditionName,
      const gd::String& copiedConditionName);

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

  BehaviorMetadata& SetFullName(const gd::String& fullname_);
  BehaviorMetadata& SetDefaultName(const gd::String& defaultName_);
  BehaviorMetadata& SetDescription(const gd::String& description_);
  BehaviorMetadata& SetGroup(const gd::String& group_);

  /**
   * \brief Erase any existing include file and add the specified include.
   * \note The requirement may vary depending on the platform: Most of the time,
   * the include file contains the declaration of the behavior.
   */
  BehaviorMetadata& SetIncludeFile(const gd::String& includeFile);

  /**
   * \brief Add a file to the already existing include files.
   */
  BehaviorMetadata& AddIncludeFile(const gd::String& includeFile);

  /**
   * Get the help path of the behavior, relative to the GDevelop documentation
   * root.
   */
  const gd::String& GetHelpPath() const { return helpPath; }

  /**
   * Set the help path of the behavior, relative to the GDevelop documentation
   * root.
   *
   * The behavior instructions will have this help path set by
   * default, unless you call SetHelpPath on them.
   */
  BehaviorMetadata& SetHelpPath(const gd::String& path) {
    helpPath = path;
    return *this;
  }

  const gd::String& GetName() const;
#if defined(GD_IDE_ONLY)
  const gd::String& GetFullName() const { return fullname; }
  const gd::String& GetDefaultName() const { return defaultName; }
  const gd::String& GetDescription() const { return description; }
  const gd::String& GetGroup() const { return group; }
  const gd::String& GetIconFilename() const { return iconFilename; }

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
#endif

  /**
   * \brief Return the associated gd::Behavior, handling behavior contents.
   */
  gd::Behavior& Get() const;

  /**
   * \brief Return the associated gd::BehaviorsSharedData, handling behavior
   * shared data, if any (nullptr if none).
   */
  gd::BehaviorsSharedData* GetSharedDataInstance() const {
    return sharedDatasInstance.get();
  }

#if defined(GD_IDE_ONLY)
  std::map<gd::String, gd::InstructionMetadata> conditionsInfos;
  std::map<gd::String, gd::InstructionMetadata> actionsInfos;
  std::map<gd::String, gd::ExpressionMetadata> expressionsInfos;
  std::map<gd::String, gd::ExpressionMetadata> strExpressionsInfos;

  std::vector<gd::String> includeFiles;
  gd::String className;
#endif
 private:
  gd::String extensionNamespace;
  gd::String helpPath;
#if defined(GD_IDE_ONLY)
  gd::String fullname;
  gd::String defaultName;
  gd::String description;
  gd::String group;
  gd::String iconFilename;
  gd::String objectType;
#endif

  // TODO: Nitpicking: convert these to std::unique_ptr to clarify ownership.
  std::shared_ptr<gd::Behavior> instance;
  std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance;
};

}  // namespace gd

#endif  // BEHAVIORMETADATA_H
