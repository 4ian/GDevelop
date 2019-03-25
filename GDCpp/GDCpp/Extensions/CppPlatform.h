/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/IDE/ChangesNotifier.h"
#include "GDCpp/Runtime/CommonTools.h"
namespace gd {
class Behavior;
class Object;
}  // namespace gd
class RuntimeObject;
class RuntimeScene;

typedef std::unique_ptr<RuntimeObject> (*CreateRuntimeObjectFunPtr)(
    RuntimeScene& scene, const gd::Object& object);

/**
 * \brief GDevelop C++ Platform
 *
 * Platform designed to be used to create 2D games based on SFML and OpenGL
 * libraries for rendering, events being translated to C++ and then compiled
 * using GCC.
 */
class GD_API CppPlatform : public gd::Platform {
 public:
  virtual gd::String GetName() const { return "GDevelop C++ platform"; }
#if defined(GD_IDE_ONLY)
  virtual gd::String GetFullName() const {
    return _("Native (Windows or Linux games)");
  }
  virtual gd::String GetSubtitle() const {
    return _("C++ and OpenGL based games for Windows or Linux.");
  }
  virtual gd::String GetDescription() const;
#endif

  /**
   * \brief Create a RuntimeObject from a gd::Object for a scene.
   *
   * \param scene The scene the object is going to be used on.
   * \param scene The gd::Object the RuntimeObject must be based on.
   */
  std::unique_ptr<RuntimeObject> CreateRuntimeObject(RuntimeScene& scene,
                                                     gd::Object& object);

  /**
   * \brief Our platform need to do a bit of extra work when adding an extension
   * ( i.e : Storing pointers to creation/destruction functions ).
   */
  bool AddExtension(std::shared_ptr<gd::PlatformExtension> platformExtension);

  /** \brief The name of the function searched in an extension file to create
   * the extension
   */
  virtual gd::String GetExtensionCreateFunctionName() {
    return "CreateGDExtension";
  }

#if defined(GD_IDE_ONLY)
  virtual gd::String GetIcon() const { return "CppPlatform/icon32.png"; }

  /**
   * \brief We provide a specific ChangesNotifier to ensure that compilation
   * jobs are done properly.
   */
  virtual ChangesNotifier& GetChangesNotifier() const {
    return changesNotifier;
  };

#if !defined(GD_NO_WX_GUI)
  /**
   * \brief Preview can be done directly inside the editor thanks to
   * CppLayoutPreviewer
   */
  virtual std::shared_ptr<gd::LayoutEditorPreviewer> GetLayoutPreviewer(
      gd::LayoutEditorCanvas& editor) const;

  /**
   * \brief Expose to the IDE how to export games.
   */
  virtual std::vector<std::shared_ptr<gd::ProjectExporter>>
  GetProjectExporters() const;
#endif

  /**
   * \brief When destroyed, our platform need to do ensure the destruction of
   * some singletons.
   */
  virtual void OnIDEClosed();
#endif

  /**
   * \brief (Re)load platform built-in extensions.
   * \note Can be useful if, for example, the user changed the language
   * of the editor.
   */
  virtual void ReloadBuiltinExtensions();

  /**
   * \brief Get access to the CppPlatform instance. ( CppPlatform is a singleton
   * ).
   */
  static CppPlatform& Get();

  /**
   * \brief Destroy the singleton.
   *
   * \note You do not need usually to call this method.
   **/
  static void DestroySingleton();

  CppPlatform();
  virtual ~CppPlatform(){};

 private:
  std::map<gd::String, CreateRuntimeObjectFunPtr>
      runtimeObjCreationFunctionTable;  ///< The C++ Platform also need to store
                                        ///< functions to create runtime
                                        ///< objects.
#if defined(GD_IDE_ONLY)
  static ChangesNotifier changesNotifier;
#if !defined(GD_NO_WX_GUI)
  wxBitmap icon32;
#endif
#endif

  static CppPlatform* singleton;
};

#endif  // PLATFORM_H
