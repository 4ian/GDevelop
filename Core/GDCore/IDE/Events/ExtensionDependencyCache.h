/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <map>
#include <memory>
#include <set>

#include "GDCore/String.h"

namespace gd {
class Project;
} // namespace gd

namespace gd {

/**
 * Scan event-based extensions to find dependencies to other event-based
 * extensions and keep the result in a cache to avoid to check extensions
 * several times.
 */
class GD_CORE_API ExtensionDependencyCache {
public:
  const std::set<gd::String> &
  FindRequiredExtensionsRecursively(gd::Project &project,
                                    const gd::String &extensionName);

private:
  std::set<gd::String> &
  InsertAndGetNewDependencies(const gd::String &extensionName);

  std::map<gd::String, std::set<gd::String>> dependenciesByExtension;
};

}; // namespace gd
