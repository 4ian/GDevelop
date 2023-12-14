/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include <map>
#include <vector>

#include "GDCore/String.h"

namespace gd {
class Object;
class ExtensionDependency;
class PropertyDescriptor;
class Project;
class Layout;
class ArbitraryResourceWorker;
class InitialInstance;
class SerializerElement;
class EffectsContainer;
class AbstractFileSystem;
} // namespace gd

namespace gd {

/**
 * \brief Serialize objects into an asset for the store.
 *
 * \ingroup IDE
 */
class GD_CORE_API ObjectAssetSerializer {
public:
  /**
   * \brief Serialize the object into an asset.
   */
  static void SerializeTo(gd::Project &project, const gd::Object &object,
                          SerializerElement &element);

  /**
   * \brief Copy all resources files of an object to the specified
   * `destinationDirectory` to prepare asset archive export.
   *
   * \param project The object project
   * \param object The object to be used
   * \param destinationDirectory The directory where resources must be copied to
   * \param objectFullName The name to use in file names of sprite resources
   *
   * \return true if no error happened
   */
  static void RenameObjectResourceFiles(
      gd::Project &project, gd::Object &object,
      const gd::String &destinationDirectory, const gd::String &objectFullName,
      std::map<gd::String, gd::String> &resourcesFileNameMap);

  ~ObjectAssetSerializer(){};

private:
  ObjectAssetSerializer(){};

  static void
  NormalizeResourceNames(gd::Object &object,
                         std::map<gd::String, gd::String> &resourcesFileNameMap,
                         const gd::String &objectFullName);

  static const std::vector<gd::String> resourceTypes;
};

} // namespace gd
