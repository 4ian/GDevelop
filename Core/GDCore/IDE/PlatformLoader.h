/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef PLATFORMLOADER_H
#define PLATFORMLOADER_H
#include <memory>
#include "GDCore/String.h"
namespace gd {
class Platform;
}

namespace gd {

/**
 * \brief Load a gd::Platform in memory from a file and add it to the manager.
 *
 * Platforms are expected to be compiled into shared library. The shared library
 * must provides the two C functions CreateGDPlatform and DestroyGDPlatform :
 \code
extern "C" gd::Platform * GD_API CreateGDPlatform();
extern "C" void GD_API DestroyGDPlatform();
 \endcode
 *
 * Platforms are expected to be singletons, so the DestroyGDPlatform is not
passing
 * any pointer as argument.
 */
class GD_CORE_API PlatformLoader {
 public:
  /**
   * Load a specific platform.
   *
   * \param fullpath The path to the platform file.
   * \return Smart pointer to the loaded platform. Can be NULL ( if loading
   * failed ).
   */
  static std::shared_ptr<gd::Platform> LoadPlatformInManager(
      gd::String fullpath);

 private:
  PlatformLoader();
  virtual ~PlatformLoader(){};
};

}  // namespace gd

#endif  // PLATFORMLOADER_H
