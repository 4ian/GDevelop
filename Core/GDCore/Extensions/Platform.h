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
#include "GDCore/Project/ChangesNotifier.h"
#include "GDCore/Project/LayoutEditorPreviewer.h"
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
   * Member functions used to create the platforms objects
   */
  ///@{

  /**
   * \brief Create an object of given type with the specified name.
   */
  std::unique_ptr<gd::Object> CreateObject(gd::String type,
                                           const gd::String& name) const;

  /**
   * \brief Create a behavior
   */
  std::unique_ptr<gd::Behavior> CreateBehavior(const gd::String& type) const;

  /**
   * \brief Create a behavior shared data object.
   */
  std::shared_ptr<gd::BehaviorsSharedData> CreateBehaviorSharedDatas(
      const gd::String& type) const;

#if defined(GD_IDE_ONLY)
  /**
   * \brief Create an event of given type
   */
  std::shared_ptr<gd::BaseEvent> CreateEvent(const gd::String& type) const;

  ///@}

  /** \name Notification of changes
   * The platform can do extra work when a change occurs by providing a special
   * gd::ChangesNotifier
   */
  ///@{

  /**
   * \brief Must provide a ChangesNotifier object that will be called by the IDE
   * if needed. The IDE is not supposed to store the returned object.
   *
   * The default implementation simply return a ChangesNotifier object doing
   * nothing.
   */
  virtual ChangesNotifier& GetChangesNotifier() const {
    return defaultEmptyChangesNotifier;
  };
    ///@}

    /** \name Preview and compilation
     * The platform should provides specialized classes used for previewing
     * layouts or exporting the project.
     */
    ///@{

#if !defined(GD_NO_WX_GUI)
  /**
   * \brief Must provide a gd::LayoutEditorPreviewer object that will be stored
   * and used by LayoutEditorCanvas to display/run a preview of the layout of a
   * project.
   *
   * The default implementation simply return a gd::LayoutEditorPreviewer object
   * doing nothing.
   */
  virtual std::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(
      gd::LayoutEditorCanvas& editor) const;

  /**
   * \brief Must provide at least one gd::ProjectExporter object that will be
   * used by the IDE to export the project so as to be used without the IDE.
   *
   * The default implementation simply return a vector containing a
   * gd::ProjectExporter object doing nothing.
   */
  virtual std::vector<std::shared_ptr<gd::ProjectExporter>>
  GetProjectExporters() const;
#endif
  ///@}

  /**
   * \brief Called when the IDE is about to shut down: Take this opportunity for
   * erasing for example any temporary file.
   */
  virtual void OnIDEClosed(){};

  /**
   * \brief Called when the IDE is initialized and ready to be used.
   */
  virtual void OnIDEInitialized(){};

#endif

 private:
  std::vector<std::shared_ptr<PlatformExtension>>
      extensionsLoaded;  ///< Extensions of the platform
  std::map<gd::String, CreateFunPtr>
      creationFunctionTable;  ///< Creation functions for objects

#if defined(GD_IDE_ONLY)
  static ChangesNotifier defaultEmptyChangesNotifier;
#endif
};

}  // namespace gd

#endif  // GDCORE_PLATFORM_H
