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
class InstructionMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief Contains user-friendly information about a behavior type
 *
 * Implementations may derive from this class so as to provide more complete
 * metadata if needed. ( For example, GDevelop C++ Platform is shared pointers
 * to objects that will be cloned so as to create the behaviors... )
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
   * Declare a new condition as being part of the extension.
   */
  gd::InstructionMetadata& AddCondition(const gd::String& name_,
                                        const gd::String& fullname_,
                                        const gd::String& description_,
                                        const gd::String& sentence_,
                                        const gd::String& group_,
                                        const gd::String& icon_,
                                        const gd::String& smallicon_);

  /**
   * Declare a new action as being part of the extension.
   */
  gd::InstructionMetadata& AddAction(const gd::String& name_,
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
   * Get the help path of the behavior, relative to the documentation root.
   */
  const gd::String &GetHelpPath() const { return helpPath; }

  /**
   * Set the help path of the behavior, relative to the documentation root.
   * 
   * The behavior instructions will have this help path set by
   * default, unless you call SetHelpPath on them.
   */
  BehaviorMetadata &SetHelpPath(const gd::String &path) {
    helpPath = path;
    return *this;
  }

#if defined(GD_IDE_ONLY)
  const gd::String& GetFullName() const { return fullname; }
  const gd::String& GetDefaultName() const { return defaultName; }
  const gd::String& GetDescription() const { return description; }
  const gd::String& GetGroup() const { return group; }
  const gd::String& GetIconFilename() const { return iconFilename; }
#endif
  std::shared_ptr<gd::Behavior> Get() const { return instance; }
  std::shared_ptr<gd::BehaviorsSharedData> GetSharedDataInstance() const {
    return sharedDatasInstance;
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
#endif

  std::shared_ptr<gd::Behavior> instance;
  std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance;
};

}  // namespace gd

#endif  // BEHAVIORMETADATA_H
