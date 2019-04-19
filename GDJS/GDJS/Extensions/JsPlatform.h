/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef JSPLATFORM_H
#define JSPLATFORM_H
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

/**
 * \brief GDevelop Javascript Platform
 *
 * Platform designed to be used to create 2D games based on Javascript.<br>
 * <br>
 * This is the core class that is exposing to the IDE the features of the
 * platform.<br> The IDE creates this platform during its startup, thanks to
 * CreateGDPlatform/DestroyGDPlatform.
 */
class GD_API JsPlatform : public gd::Platform {
 public:
  virtual gd::String GetName() const { return "GDevelop JS platform"; }
  virtual gd::String GetFullName() const {
    return _("HTML5 (Web and Android games)");
  }
  virtual gd::String GetSubtitle() const {
    return _("HTML5 and javascript based games for web browsers.");
  }
  virtual gd::String GetDescription() const {
    return _(
        "Enables the creation of 2D games that can be played in web browsers. "
        "These can also be exported to Android with third-party tools.");
  }
  virtual gd::String GetIcon() const { return "JsPlatform/icon32.png"; }

  /** \brief The name of the function searched in an extension file to create
   * the extension
   */
  virtual gd::String GetExtensionCreateFunctionName() {
    return "CreateGDJSExtension";
  }

  void AddNewExtension(const gd::PlatformExtension& extension);

  /**
   * \brief (Re)load platform built-in extensions.
   * \note Can be useful if, for example, the user changed the language
   * of the editor.
   */
  virtual void ReloadBuiltinExtensions();

  /**
   * Get access to the JsPlatform instance (JsPlatform is a singleton).
   */
  static JsPlatform& Get();

  /**
   * \brief Destroy the singleton.
   *
   * \note You do not need usually to call this method.
   **/
  static void DestroySingleton();

  JsPlatform();
  virtual ~JsPlatform(){};

 private:

  static JsPlatform* singleton;
};

}  // namespace gdjs

#endif  // JSPLATFORM_H
