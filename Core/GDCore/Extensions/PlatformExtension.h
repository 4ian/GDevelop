/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com) This
 * project is released under the MIT License.
 */

#pragma once
#include <map>
#include <memory>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/DependencyMetadata.h"
#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/Extensions/Metadata/EventMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionOrExpressionGroupMetadata.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"
#include "GDCore/Tools/VersionPriv.h"

namespace gd {
class Instruction;
class InstructionMetadata;
class MultipleInstructionMetadata;
class ExpressionMetadata;
class ObjectMetadata;
class BehaviorMetadata;
class EffectMetadata;
class DependencyMetadata;
class BaseEvent;
class EventMetadata;
class EventCodeGenerator;
class ArbitraryResourceWorker;
class BehaviorsSharedData;
class Behavior;
class Object;
class ObjectConfiguration;
}  // namespace gd

typedef std::function<std::unique_ptr<gd::ObjectConfiguration>()>
    CreateFunPtr;

namespace gd {

/**
 * \brief Class used by gd::PlatformExtension to ensure that an extension is
 * compiled against the right versions of libraries.
 */
class GD_CORE_API CompilationInfo {
 public:
  CompilationInfo() : informationCompleted(false){};
  virtual ~CompilationInfo(){};

  bool informationCompleted;

  bool runtimeOnly;  ///< True if the extension was compiled for a runtime use
                     ///< only

#if defined(__GNUC__)
  int gccMajorVersion;
  int gccMinorVersion;
  int gccPatchLevel;
#endif

  int sfmlMajorVersion;
  int sfmlMinorVersion;

  gd::String gdCoreVersion;
  int sizeOfpInt;
};

struct GD_CORE_API DuplicatedInstructionOptions {
  bool unscoped;
};

/**
 * \brief Base class for implementing platform's extensions.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API PlatformExtension {
 public:
  CompilationInfo compilationInfo;

  PlatformExtension();
  virtual ~PlatformExtension();

  /** \name Extension setup
   * Common setup for all extensions
   */
  ///@{

  /**
   * \brief Must be called to declare the main information about the extension.
   */
  PlatformExtension& SetExtensionInformation(const gd::String& name_,
                                             const gd::String& fullname_,
                                             const gd::String& description_,
                                             const gd::String& author_,
                                             const gd::String& license_);

  /**
   * \brief Set the URL of the extension icon.
   */
  PlatformExtension& SetIconUrl(const gd::String& iconUrl_) {
    iconUrl = iconUrl_;
    return *this;
  }

  /**
   * \brief Set the category of the extension.
   */
  PlatformExtension& SetCategory(const gd::String& category_) {
    category = category_;
    return *this;
  }

  /**
   * \brief Set the path to the help, relative to the GDevelop documentation
   * root. For example, "/all-features/collisions" for
   * "https://wiki.gdevelop.io/gdevelop5/all-features/collisions".
   *
   * The instructions, objects and behaviors will have this help path set by
   * default, unless you call SetHelpPath on them.
   */
  PlatformExtension& SetExtensionHelpPath(const gd::String& helpPath_) {
    helpPath = helpPath_;
    return *this;
  }

  /**
   * \brief Mark this extension as deprecated: the IDE will hide it from the
   * user.
   */
  void MarkAsDeprecated() { deprecated = true; }

  ///@}

  /** \name Features declaration
   * Declare features provided by the extension
   */
  ///@{

  /**
   * \brief Declare a new condition as being part of the extension.
   */
  gd::InstructionMetadata& AddCondition(const gd::String& name_,
                                        const gd::String& fullname_,
                                        const gd::String& description_,
                                        const gd::String& sentence_,
                                        const gd::String& group_,
                                        const gd::String& icon_,
                                        const gd::String& smallicon_);

  /**
   * \brief Declare a new action as being part of the extension.
   */
  gd::InstructionMetadata& AddAction(const gd::String& name_,
                                     const gd::String& fullname_,
                                     const gd::String& description_,
                                     const gd::String& sentence_,
                                     const gd::String& group_,
                                     const gd::String& icon_,
                                     const gd::String& smallicon_);
  /**
   * \brief Declare a new expression as being part of the extension.
   */
  gd::ExpressionMetadata& AddExpression(const gd::String& name_,
                                        const gd::String& fullname_,
                                        const gd::String& description_,
                                        const gd::String& group_,
                                        const gd::String& smallicon_);
  /**
   * \brief Declare a new string expression as being part of the extension.
   */
  gd::ExpressionMetadata& AddStrExpression(const gd::String& name_,
                                           const gd::String& fullname_,
                                           const gd::String& description_,
                                           const gd::String& group_,
                                           const gd::String& smallicon_);

  /**
   * \brief Declare a new expression and condition as being part of the
   * extension.
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
   * extension.
   * \note The action name is prefixed by "Set" (and the namespace, as the
   * condition and the expression).
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

  gd::DependencyMetadata& AddDependency();

  /**
   * \brief Declare a new object as being part of the extension.
   * \tparam T the declared class inherited from *gd::Object*
   * \param name The name of the object.
   * \param fullname The user friendly name of the object.
   * \param description The user friendly description of the object.
   * \param icon The icon of the object.
   */
  template <class T>
  gd::ObjectMetadata& AddObject(const gd::String& name_,
                                const gd::String& fullname_,
                                const gd::String& description_,
                                const gd::String& icon_);

  /**
   * \brief Declare a new object as being part of the extension.
   * \param name The name of the object
   * \param fullname The user friendly name of the object
   * \param description The user friendly description of the object
   * \param icon The icon of the object.
   * \param instance The "blueprint" object to be copied when a new object is
   asked for.
   */
  gd::ObjectMetadata& AddObject(const gd::String& name_,
                                const gd::String& fullname_,
                                const gd::String& description_,
                                const gd::String& icon_,
                                std::shared_ptr<gd::ObjectConfiguration> instance);

  /**
   * \brief Declare a new events based object as being part of the extension.
   *
   * \param name The name of the object
   * \param fullname The user friendly name of the object
   * \param description The user friendly description of the object
   * \param icon The icon of the object.
   */
  gd::ObjectMetadata& AddEventsBasedObject(
      const gd::String& name_,
      const gd::String& fullname_,
      const gd::String& description_,
      const gd::String& icon_);

  /**
   * \brief Declare a new behavior as being part of the extension.
   *
   * \param name The name of the behavior
   * \param fullname The user friendly name of the behavior
   * \param defaultName The default name of behavior instances
   * \param description The user friendly description of the behavior
   * \param group The behavior category label
   * \param icon The icon of the behavior.
   * \param className The name of the class implementing the behavior
   * \param instance An instance of the behavior that
   * will be used to create the behavior
   * \param sharedDatasInstance Optional
   * instance of the data shared by the behaviors having the same name.
   */
  gd::BehaviorMetadata& AddBehavior(
      const gd::String& name_,
      const gd::String& fullname_,
      const gd::String& defaultName_,
      const gd::String& description_,
      const gd::String& group_,
      const gd::String& icon_,
      const gd::String& className_,
      std::shared_ptr<gd::Behavior> instance,
      std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance);

  /**
   * \brief Declare a new effect as being part of the extension.
   * \param name The internal name of the effect (also called effect type).
   */
  gd::EffectMetadata& AddEffect(const gd::String& name_);

  /**
   * \brief Declare a new event as being part of the extension.
   */
  gd::EventMetadata& AddEvent(const gd::String& name_,
                              const gd::String& fullname_,
                              const gd::String& description_,
                              const gd::String& group_,
                              const gd::String& smallicon_,
                              std::shared_ptr<gd::BaseEvent> instance);

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
      const gd::String& copiedConditionName,
      gd::DuplicatedInstructionOptions options = {.unscoped = false});
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

  /**
   * \brief Adds a property to the extension.
   */
  gd::PropertyDescriptor& RegisterProperty(const gd::String& name) {
    return extensionPropertiesMetadata[name];
  };

  /**
   * \brief Add some metadata (icon, etc...) for a group used for instructions
   * or expressions.
   */
  InstructionOrExpressionGroupMetadata& AddInstructionOrExpressionGroupMetadata(
      const gd::String& name) {
    return instructionOrExpressionGroupMetadata[name];
  }

  /**
   * \brief Delete all instructions having no function name or custom code
   * generator.
   */
  void StripUnimplementedInstructionsAndExpressions();
  ///@}

  /** \name Extension accessors
   * Accessors to read the information and content of the extension.
   */
  ///@{

  /**
   * \brief Return the name extension user friendly name.
   */
  const gd::String& GetFullName() const { return fullname; }

  /**
   * \brief Return the name of the extension
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Return the category of the extension
   */
  const gd::String& GetCategory() const { return category; }

  /**
   * \brief Return a description of the extension
   */
  const gd::String& GetDescription() const { return informations; }

  /**
   * \brief Return the name of the extension developer
   */
  const gd::String& GetAuthor() const { return author; }

  /**
   * \brief Return the name of extension license
   */
  const gd::String& GetLicense() const { return license; }

  /**
   * \brief Return the help path of extension, relative to the
   * GDevelop documentation root.
   */
  const gd::String& GetHelpPath() const { return helpPath; }

  /**
   * \brief Return the URL to the icon to be displayed for this
   * extension.
   */
  const gd::String& GetIconUrl() const { return iconUrl; }

  /**
   * \brief Return keywords that help search engines find this extension.
   */
  const std::vector<gd::String>& GetTags() const { return tags; }

  /**
   * \brief Set keywords that help search engines find this extension.
   */
  PlatformExtension& SetTags(const gd::String& csvTags) {
    tags.clear();
    tags = csvTags.Split(',');
    for (size_t i = 0; i < tags.size(); i++)
    {
      tags[i] = tags[i].Trim().LowerCase();
    }
    return *this;
  }

  /**
   * \brief Add a keyword that help search engines find this extension.
   */
  PlatformExtension& AddTag(const gd::String& tag) {
    tags.push_back(tag);
    return *this;
  }

  /**
   * \brief Check if the extension is flagged as being deprecated.
   */
  bool IsDeprecated() const { return deprecated; }

  /**
   * \brief Return true if the extension is a standard extension that cannot be
   * deactivated
   */
  bool IsBuiltin() const;

  /**
   * \brief Get the namespace of the extension.
   * \note The namespace is simply the name of the extension concatenated with
   * "::" at the end.
   */
  const gd::String& GetNameSpace() { return nameSpace; };

  /**
   * \brief Return a vector containing all the object types provided by the
   * extension
   */
  std::vector<gd::String> GetExtensionObjectsTypes() const;

  /**
   * \brief Return a vector containing all the behavior types provided by the
   * extension
   */
  std::vector<gd::String> GetBehaviorsTypes() const;

  /**
   * \brief Return a function to create the object if the type is handled by the
   * extension
   */
  CreateFunPtr GetObjectCreationFunctionPtr(const gd::String& objectType) const;

  /**
   * \brief Return a vector containing all the effect types provided by the
   * extension.
   */
  std::vector<gd::String> GetExtensionEffectTypes() const;

  /**
   * \brief Create a custom event.
   *
   * Return an empty pointer if \a eventType is not provided by the extension.
   */
  std::shared_ptr<gd::BaseEvent> CreateEvent(const gd::String& eventType) const;
  /**
   * \brief Get the gd::Behavior handling the given behavior type.
   *
   * Return nullptr if \a behaviorType is not provided by the extension.
   */
  gd::Behavior* GetBehavior(const gd::String& behaviorType) const;

  /**
   * \brief Get the gd::BehaviorsSharedData handling the given behavior shared
   * data.
   *
   * Return nullptr if \a behaviorType is not provided by the extension.
   */
  gd::BehaviorsSharedData* GetBehaviorSharedDatas(
      const gd::String& behaviorType) const;

  /**
   * \brief Return a reference to the ObjectMetadata object associated to \a
   * objectType
   */
  ObjectMetadata& GetObjectMetadata(const gd::String& objectType);

  /**
   * \brief Return a reference to the BehaviorMetadata object associated to \a
   * behaviorType
   */
  BehaviorMetadata& GetBehaviorMetadata(const gd::String& behaviorType);

  /**
   * \brief Return true if the extension contains a behavior associated to \a
   * behaviorType
   */
  bool HasBehavior(const gd::String& behaviorType) const;

  /**
   * \brief Return the metadata for the effect with the given name.
   */
  EffectMetadata& GetEffectMetadata(const gd::String& effectName);

  /**
   * \brief Return a map containing all the events provided by the extension
   */
  std::map<gd::String, gd::EventMetadata>& GetAllEvents();

  /**
   * \brief Return a reference to a map containing the names of the actions
   * (as keys) and the metadata associated with (as values).
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllActions();

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllConditions();

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllExpressions();

  /**
   * \see gd::PlatformExtension::GetAllActions
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllStrExpressions();

  /**
   * \brief Return a reference to a vector containing the metadata of all the
   * dependencies of the extension.
   */
  std::vector<gd::DependencyMetadata>& GetAllDependencies();

  /**
   * \brief Return a reference to a map containing the names of the actions,
   * related to the object type, and the metadata associated with.
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllActionsForObject(
      gd::String objectType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllConditionsForObject(
      gd::String objectType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllExpressionsForObject(
      gd::String objectType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllStrExpressionsForObject(
      gd::String objectType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllActionsForBehavior(
      gd::String autoType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::InstructionMetadata>& GetAllConditionsForBehavior(
      gd::String autoType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllExpressionsForBehavior(
      gd::String autoType);

  /**
   * \see gd::PlatformExtension::GetAllActionsForObject
   */
  std::map<gd::String, gd::ExpressionMetadata>& GetAllStrExpressionsForBehavior(
      gd::String autoType);

  /**
   * \brief Get all the properties of the extension. Properties
   * are shown in the game properties in the editor, and are exported in the
   * project data.
   */
  std::map<gd::String, gd::PropertyDescriptor>& GetAllProperties() {
    return extensionPropertiesMetadata;
  }

  /**
   * \brief Get the metadata (icon, etc...) for groups used for instructions
   * or expressions.
   */
  const std::map<gd::String, InstructionOrExpressionGroupMetadata>&
  GetAllInstructionOrExpressionGroupMetadata() const {
    return instructionOrExpressionGroupMetadata;
  }
  ///@}

  /**
   * \brief Return the name of all the extensions which are considered provided
   * by platforms.
   */
  static std::vector<gd::String> GetBuiltinExtensionsNames();

  /**
   * \brief Get the string used to separate the name of the
   * instruction/expression and the extension.
   */
  static gd::String GetNamespaceSeparator() { return "::"; }

  static gd::String GetEventsFunctionFullType(const gd::String &extensionName,
                                              const gd::String &functionName);

  static gd::String
  GetBehaviorEventsFunctionFullType(const gd::String &extensionName,
                                    const gd::String &behaviorName,
                                    const gd::String &functionName);

  static gd::String GetBehaviorFullType(const gd::String &extensionName,
                                        const gd::String &behaviorName);

  static gd::String
  GetObjectEventsFunctionFullType(const gd::String &extensionName,
                                  const gd::String &objectName,
                                  const gd::String &functionName);

  static gd::String GetObjectFullType(const gd::String &extensionName,
                                      const gd::String &objectName);

private:
  /**
   * Set the namespace (the string all actions/conditions/expressions start
   * with).
   */
  void SetNameSpace(gd::String nameSpace_);

  gd::String name;  ///< Name identifying the extension
  gd::String
      nameSpace;  ///< Automatically set from the name of the extension, and
                  ///< added to every
                  ///< actions/conditions/expressions/objects/behavior/event.
  gd::String fullname;      ///< Name displayed to users in the editor.
  gd::String informations;  ///< Description displayed to users in the editor.
  gd::String category;
  gd::String author;        ///< Author displayed to users in the editor.
  gd::String license;       ///< License name displayed to users in the editor.
  bool deprecated;  ///< true if the extension is deprecated and shouldn't be
                    ///< shown in IDE.
  gd::String helpPath;  ///< The relative path to the help for this extension in
                        ///< the documentation.
  gd::String iconUrl;   ///< The URL to the icon to be shown for this extension.
  std::vector<gd::String> tags;

  std::map<gd::String, gd::ObjectMetadata> objectsInfos;
  std::map<gd::String, gd::BehaviorMetadata> behaviorsInfo;
  std::map<gd::String, gd::EffectMetadata> effectsMetadata;
  std::map<gd::String, gd::InstructionMetadata> conditionsInfos;
  std::map<gd::String, gd::InstructionMetadata> actionsInfos;
  std::map<gd::String, gd::ExpressionMetadata> expressionsInfos;
  std::map<gd::String, gd::ExpressionMetadata> strExpressionsInfos;
  std::vector<gd::DependencyMetadata> extensionDependenciesMetadata;
  std::map<gd::String, gd::EventMetadata> eventsInfos;
  std::map<gd::String, gd::PropertyDescriptor> extensionPropertiesMetadata;
  std::map<gd::String, InstructionOrExpressionGroupMetadata>
      instructionOrExpressionGroupMetadata;

  ObjectMetadata badObjectMetadata;
  BehaviorMetadata badBehaviorMetadata;
  EffectMetadata badEffectMetadata;
  static std::map<gd::String, gd::InstructionMetadata>
      badConditionsMetadata;  ///< Used when a condition is not found in the
                              ///< extension
  static std::map<gd::String, gd::InstructionMetadata>
      badActionsMetadata;  ///< Used when an action is not found in the
                           ///< extension
  static std::map<gd::String, gd::ExpressionMetadata>
      badExpressionsMetadata;  ///< Used when an expression is not found in the
                               ///< extension
};

}  // namespace gd

/** \brief Macro used by extensions in their constructor to declare how they
 * have been compiled. \see gd::CompilationInfo
 */
#define GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION() \
  compilationInfo.runtimeOnly = false;                  \
  compilationInfo.sfmlMajorVersion = 2;                 \
  compilationInfo.sfmlMinorVersion = 0;                 \
  compilationInfo.gdCoreVersion = GD_VERSION_STRING;    \
  compilationInfo.sizeOfpInt = sizeof(int*);            \
  compilationInfo.gccMajorVersion = __GNUC__;           \
  compilationInfo.gccMinorVersion = __GNUC_MINOR__;     \
  compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;  \
  compilationInfo.informationCompleted = true;

#include "GDCore/Extensions/PlatformExtension.inl"
