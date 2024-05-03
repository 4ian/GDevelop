/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSFUNCTIONEXTENSION_H
#define GDCORE_EVENTSFUNCTIONEXTENSION_H

#include <vector>

#include "GDCore/Extensions/Metadata/DependencyMetadata.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {
// TODO Remove the EventsFunctionsContainer inheritance and make it an attribute.
// This will allow to get EventsFunctionsContainer the same way for extensions,
// objects and behaviors.
/**
 * \brief Hold a list of Events Functions (gd::EventsFunction) and Events Based
 * Behaviors.
 *
 * Events functions can be generated as stand-alone functions, and
 * converted to actions/conditions/expressions.
 * Events behaviors can be generated to a runtime behavior, with functions
 * converted to behavior actions/conditions/expressions. Similarly, a
 * gd::EventsFunctionsExtension can be converted to an extension.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsFunctionsExtension : public EventsFunctionsContainer {
 public:
  EventsFunctionsExtension();
  EventsFunctionsExtension(const EventsFunctionsExtension&);
  EventsFunctionsExtension& operator=(const EventsFunctionsExtension& rhs);
  virtual ~EventsFunctionsExtension(){};

  /**
   * \brief Return a pointer to a new EventsFunctionsExtension constructed from
   * this one.
   */
  EventsFunctionsExtension* Clone() const {
    return new EventsFunctionsExtension(*this);
  };

  const gd::String& GetVersion() const { return version; };
  EventsFunctionsExtension& SetVersion(const gd::String& version_) {
    version = version_;
    return *this;
  }

  const gd::String& GetNamespace() const { return extensionNamespace; };
  EventsFunctionsExtension& SetNamespace(const gd::String& namespace_) {
    extensionNamespace = namespace_;
    return *this;
  }

  const gd::String& GetShortDescription() const { return shortDescription; };
  EventsFunctionsExtension& SetShortDescription(
      const gd::String& shortDescription_) {
    shortDescription = shortDescription_;
    return *this;
  }

  const gd::String& GetDescription() const { return description; };
  EventsFunctionsExtension& SetDescription(const gd::String& description_) {
    description = description_;
    return *this;
  }

  const gd::String& GetName() const { return name; };
  EventsFunctionsExtension& SetName(const gd::String& name_) {
    name = name_;
    return *this;
  }

  const gd::String& GetFullName() const { return fullName; };
  EventsFunctionsExtension& SetFullName(const gd::String& fullName_) {
    fullName = fullName_;
    return *this;
  }

  const gd::String& GetCategory() const { return category; };
  EventsFunctionsExtension& SetCategory(const gd::String& category_) {
    category = category_;
    return *this;
  }

  const std::vector<gd::String>& GetTags() const { return tags; };
  std::vector<gd::String>& GetTags() { return tags; };

  const std::vector<gd::String>& GetAuthorIds() const { return authorIds; };
  std::vector<gd::String>& GetAuthorIds() { return authorIds; };

  const gd::String& GetAuthor() const { return author; };
  EventsFunctionsExtension& SetAuthor(const gd::String& author_) {
    author = author_;
    return *this;
  }

  const gd::String& GetPreviewIconUrl() const { return previewIconUrl; };
  EventsFunctionsExtension& SetPreviewIconUrl(
      const gd::String& previewIconUrl_) {
    previewIconUrl = previewIconUrl_;
    return *this;
  }

  const gd::String& GetIconUrl() const { return iconUrl; };
  EventsFunctionsExtension& SetIconUrl(const gd::String& iconUrl_) {
    iconUrl = iconUrl_;
    return *this;
  }

  /**
   * \brief Get the help path of this extension, relative to the GDevelop
   * documentation root.
   */
  const gd::String& GetHelpPath() const { return helpPath; };

  /**
   * \brief Set the help path of this extension, relative to the GDevelop
   * documentation root.
   */
  EventsFunctionsExtension& SetHelpPath(const gd::String& helpPath_) {
    helpPath = helpPath_;
    return *this;
  }

  /**
   * \brief Return a reference to the list of the events based behaviors.
   */
  gd::SerializableWithNameList<EventsBasedBehavior>& GetEventsBasedBehaviors() {
    return eventsBasedBehaviors;
  }

  /**
   * \brief Return a const reference to the list of the events based behaviors.
   */
  const gd::SerializableWithNameList<EventsBasedBehavior>&
  GetEventsBasedBehaviors() const {
    return eventsBasedBehaviors;
  }

  /**
   * \brief Return a reference to the list of the events based objects.
   */
  gd::SerializableWithNameList<EventsBasedObject>& GetEventsBasedObjects() {
    return eventsBasedObjects;
  }

  /**
   * \brief Return a const reference to the list of the events based objects.
   */
  const gd::SerializableWithNameList<EventsBasedObject>&
  GetEventsBasedObjects() const {
    return eventsBasedObjects;
  }

  /**
   * \brief Sets an extension origin. This method is not present since the
   * beginning so the projects created before that will have extensions
   * installed from the store without an origin. Keep that in mind when creating
   * features that rely on an extension's origin.
   */
  virtual void SetOrigin(const gd::String& originName_,
                         const gd::String& originIdentifier_) {
    originName = originName_;
    originIdentifier = originIdentifier_;
  }

  virtual const gd::String& GetOriginName() const { return originName; }
  virtual const gd::String& GetOriginIdentifier() const {
    return originIdentifier;
  }

  /** \name Dependencies
   */
  ///@{

  /**
   * \brief Adds a new dependency.
   */
  gd::DependencyMetadata& AddDependency() {
    gd::DependencyMetadata dependency;
    dependencies.push_back(dependency);
    return dependencies.back();
  };

  /**
   * \brief Adds a new dependency.
   */
  void RemoveDependencyAt(size_t index) {
    dependencies.erase(dependencies.begin() + index);
  };

  /**
   * \brief Returns the list of dependencies.
   */
  std::vector<gd::DependencyMetadata>& GetAllDependencies() {
    return dependencies;
  };

  /**
   * \brief Returns the list of dependencies.
   */
  const std::vector<gd::DependencyMetadata>& GetAllDependencies() const {
    return dependencies;
  };

  ///@}

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the EventsFunctionsExtension to the specified element
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the EventsFunctionsExtension from the specified element.
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);

  /**
   * \brief Load the extension without free functions, behaviors and objects
   * implementation.
   */
  void UnserializeExtensionDeclarationFrom(
      gd::Project& project,
      const gd::SerializerElement& element);

  /**
   * \brief Load free functions, behaviors and objects implementation
   * (in opposition to load just their "declaration" by reading their name).
   */
  void UnserializeExtensionImplementationFrom(
      gd::Project& project,
      const gd::SerializerElement& element);
  ///@}

  /** \name Lifecycle event functions
   */
  ///@{
  static bool IsExtensionLifecycleEventsFunction(
      const gd::String& eventsFunctionName);
  ///@}

 private:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::EventsFunctionsExtension& other);

  void SerializeDependencyTo(const gd::DependencyMetadata& dependency,
                             gd::SerializerElement& serializer) const {
    serializer.SetStringAttribute("type", dependency.GetDependencyType());
    serializer.SetStringAttribute("exportName", dependency.GetExportName());
    serializer.SetStringAttribute("name", dependency.GetName());
    serializer.SetStringAttribute("version", dependency.GetVersion());
  }

  gd::DependencyMetadata UnserializeDependencyFrom(
      gd::SerializerElement& serializer) {
    gd::DependencyMetadata dependency;
    dependency.SetDependencyType(serializer.GetStringAttribute("type"));
    dependency.SetExportName(serializer.GetStringAttribute("exportName"));
    dependency.SetName(serializer.GetStringAttribute("name"));
    dependency.SetVersion(serializer.GetStringAttribute("version"));
    return dependency;
  }

  gd::String version;
  gd::String extensionNamespace;
  gd::String shortDescription;
  gd::String description;
  gd::String name;
  gd::String fullName;
  gd::String category;
  std::vector<gd::String> tags;
  std::vector<gd::String> authorIds;
  gd::String author;
  gd::String previewIconUrl;
  gd::String originName;
  gd::String originIdentifier;
  gd::String iconUrl;
  gd::String helpPath;  ///< The relative path to the help for this extension in
                        ///< the documentation (or an absolute URL).
  gd::SerializableWithNameList<EventsBasedBehavior> eventsBasedBehaviors;
  gd::SerializableWithNameList<EventsBasedObject> eventsBasedObjects;
  std::vector<gd::DependencyMetadata> dependencies;
};

}  // namespace gd

#endif  // GDCORE_EVENTSFUNCTIONEXTENSION_H
