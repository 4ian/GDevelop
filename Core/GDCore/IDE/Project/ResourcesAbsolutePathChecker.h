/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Helper used to check if a project has at least a resource with an
 * absolute filename.
 *
 * \see ArbitraryResourceWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API ResourcesAbsolutePathChecker
    : public ArbitraryResourceWorker {
public:
  ResourcesAbsolutePathChecker(gd::ResourcesManager &resourcesManager,
                               AbstractFileSystem &fileSystem)
      : ArbitraryResourceWorker(resourcesManager), hasAbsoluteFilenames(false),
        fs(fileSystem){};
  virtual ~ResourcesAbsolutePathChecker(){};

  /**
   * Return true if there is at least a resource with an absolute filename.
   */
  bool HasResourceWithAbsoluteFilenames() const {
    return hasAbsoluteFilenames;
  };

  /**
   * Check if there is a resource with an absolute path
   */
  virtual void ExposeFile(gd::String& resource);

 private:
  bool hasAbsoluteFilenames;
  AbstractFileSystem& fs;
};

}  // namespace gd
