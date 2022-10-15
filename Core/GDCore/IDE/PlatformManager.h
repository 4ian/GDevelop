/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef PLATFORMMANAGER_H
#define PLATFORMMANAGER_H
#include <memory>
#include <vector>
#include "GDCore/Extensions/Platform.h"

namespace gd {

/**
 * \brief Singleton class managing all the platforms available.
 *
 * Platforms can be added thanks to gd::PlatformManager::AddPlatform. <br>
 * See gd::PlatformLoader::LoadPlatformInManager to load a platform from a file.
 *
 *
 * \see gd::PlatformLoader
 */
class GD_CORE_API PlatformManager {
 public:
  /**
   * \brief Add a new platform to be used by the IDE
   */
  bool AddPlatform(std::shared_ptr<gd::Platform> newPlatform);

  /**
   * \brief Get a pointer to the platform called \a platformName.
   * \note The PlatformManager is the owner of the platform, so the pointer
   * should not be freed or deleted.
   */
  gd::Platform *GetPlatform(const gd::String &platformName) const;

  /**
   * \brief Get a list of all platforms available.
   */
  const std::vector<std::shared_ptr<gd::Platform> > &GetAllPlatforms() const {
    return platformsLoaded;
  };

  static PlatformManager *Get() {
    if (NULL == _singleton) {
      _singleton = new PlatformManager;
    }

    return (static_cast<PlatformManager *>(_singleton));
  }

  /**
   * \brief Destroy the global platform manager.
   *
   * This is called by the IDE before shutting down.
   * ( Otherwise, platforms won't get notified that the IDE closed. )
   */
  static void DestroySingleton() {
    if (NULL != _singleton) {
      delete _singleton;
      _singleton = NULL;
    }
  }

 private:
  std::vector<std::shared_ptr<gd::Platform> > platformsLoaded;

  PlatformManager();
  virtual ~PlatformManager();
  static PlatformManager *_singleton;
};

}  // namespace gd
#endif  // PLATFORMMANAGER_H
#endif
