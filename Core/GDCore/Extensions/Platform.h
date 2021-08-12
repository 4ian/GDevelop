/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_PLATFORM_H
#define GDCORE_PLATFORM_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/String.h"

namespace gd {
class InstructionsMetadataHolder;
class Project;
class Object;
class Behavior;
class BehaviorMetadata;
class ObjectMetadata;
class BaseEvent;
class BehaviorsSharedData;
class PlatformExtension;
class LayoutEditorCanvas;
class ProjectExporter;
}  // namespace gd

typedef std::function<std::unique_ptr<gd::Object>(gd::String name)>
    CreateFunPtr;

#undef CreateEvent

namespace gd {

/**
 * \brief Base class for implementing a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Platform {
 public:
  Platform();
  virtual ~Platform();

  /**
   * \brief Must return the platform name
   */
  virtual gd::String GetName() const { return "Unnamed platform"; }

  /**
   * \brief Must return the platform full name, displayed to users.
   */
  virtual gd::String GetFullName() const { return "Unnamed platform"; }

#if defined(GD_IDE_ONLY)
  /**
   * \brief Must return a text describing the platform in a few words.
   */
  virtual gd::String GetSubtitle() const { return ""; }

  /**
   * \brief Must return a text describing the platform, displayed to users.
   */
  virtual gd::String GetDescription() const { return ""; }

  /**
   * \brief Must return a filename to a 32*32 image file for the platform.
   */
  virtual gd::String GetIcon() const { return ""; }
#endif

  /** \name Extensions management
   * Member functions used to manage the extensions
   */
  ///@{
  /**
   * \brief (Re)load platform built-in extensions.
   * \note Can be useful if, for example, the user changed the language
   * of the editor.
   */
  virtual void ReloadBuiltinExtensions(){};

  /**
   * \brief Must return the name of the function that is used to create an
   * extension for this platform.
   *
   * For example, GD C++ Platform uses "CreateGDExtension" and GD JS Platform
   * "CreateGDJSExtension". \see gd::ExtensionsLoader
   */
  virtual gd::String GetExtensionCreateFunctionName() { return ""; }

  /**
   * \brief Add an extension to the platform.
   * \note This method is virtual and can be redefined by platforms if they want
   * to do special work when an extension is loaded. \see gd::ExtensionsLoader
   */
  virtual bool AddExtension(std::shared_ptr<PlatformExtension> extension);

  /**
   * \brief Return true if an extension with the specified name is loaded
   */
  bool IsExtensionLoaded(const gd::String& name) const;

  /**
   * \brief Get an extension of the platform
   * @return Shared pointer to the extension
   */
  std::shared_ptr<PlatformExtension> GetExtension(const gd::String& name) const;

  /**
   * \brief Get all extensions loaded for the platform.
   * @return Vector of Shared pointer containing all extensions
   */
  const std::vector<std::shared_ptr<gd::PlatformExtension>>&
  GetAllPlatformExtensions() const {
    return extensionsLoaded;
  };

  /**
   * \brief Remove an extension from the platform.
   *
   * Events, objects, behaviors provided by the extension won't be available
   * anymore.
   */
  virtual void RemoveExtension(const gd::String& name);
  ///@}

  /** \name Factory method
   * Member functions used to create the platform objects.
   * TODO: This could be moved to gd::MetadataProvider.
   */
  ///@{

  /**
   * \brief Create an object of given type with the specified name.
   */
  std::unique_ptr<gd::Object> CreateObject(gd::String type,
                                           const gd::String& name) const;

#if defined(GD_IDE_ONLY)
  /**
   * \brief Create an event of given type
   */
  std::shared_ptr<gd::BaseEvent> CreateEvent(const gd::String& type) const;

  ///@}

  /**
   * \brief Activate or disable the logs on the standard output when
   * loading an extension.
   */
  void EnableExtensionLoadingLogs(bool enable) { enableExtensionLoadingLogs = enable; };

  /**
   * \brief Called when the IDE is about to shut down: Take this opportunity for
   * erasing for example any temporary file.
   * @deprecated This should be removed.
   */
  virtual void OnIDEClosed(){};

  /**
   * \brief Called when the IDE is initialized and ready to be used.
   * @deprecated This should be removed.
   */
  virtual void OnIDEInitialized(){};

#endif

 private:
  std::vector<std::shared_ptr<PlatformExtension>>
      extensionsLoaded;  ///< Extensions of the platform
  std::map<gd::String, CreateFunPtr>
      creationFunctionTable;  ///< Creation functions for objects
  bool enableExtensionLoadingLogs;
};

}  // namespace gd

#endif  // GDCORE_PLATFORM_H
