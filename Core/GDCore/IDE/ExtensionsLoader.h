/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef EXTENSIONSLOADER_H
#define EXTENSIONSLOADER_H
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Platform;
}

namespace gd {

/**
 * \brief Internal class loading static extensions.
 *
 * Class that load extensions and store them in a Platform.
 * 
 * \note This is for loading extensions declared in C++, usually in
 * files called "Extension.cpp" or "JsExtension.cpp".
 * GDevelop 5 extensions can also be declared directly in JavaScript. 
 * See newIDE/app/src/JsExtensionsLoader and "JsExtension.js" files
 * for extensions declared in JavaScript.
 */
class GD_CORE_API ExtensionsLoader {
 public:
  /**
   * \brief Load all extensions located in the extensions directory for a
   * platform.
   *
   * \param directory The directory where extensions must be searched.
   * \param platform The platform the extensions belongs to.
   * \param forgiving If set to true, files will try to be opened, but a failure
   * when searching for the platform creation function symbol won't be logged as
   * an error. (All other errors are still reported as usual).
   *
   * \note Extensions files must have extensions *.xgd(w|l|m)(e),
   * w for Windows, l for Linux, m for Mac, e for Edittime extensions.
   */
  static void LoadAllExtensions(const gd::String& directory,
                                gd::Platform& platform,
                                bool forgiving = false);

  /**
   * \brief Load an extension from a file and add it to a platform.
   *
   * \param fullpath The fullpath to the extension file.
   * \param platform The platform the extension belongs to.
   * \param forgiving If set to true, files will try to be opened, but a failure
   * when searching for the platform creation function symbol won't be logged as
   * an error. (All other errors are still reported as usual).
   */
  static void LoadExtension(const gd::String& fullpath,
                            gd::Platform& platform,
                            bool forgiving = false);

  /**
   * \brief To be called when extensions loading is done.
   *
   * This is necessary on Linux to make symbols exported by extensions
   * available. \param directory The directory where extensions have been loaded
   * from.
   */
  static void ExtensionsLoadingDone(const gd::String& directory);

 private:
  ExtensionsLoader(){};
  virtual ~ExtensionsLoader(){};
};

}  // namespace gd

#endif  // EXTENSIONSLOADER_H
