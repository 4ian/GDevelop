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
  static void SerializeTo(gd::Project &project, const gd::Object &object, const gd::String& objectFullName,
                          SerializerElement &element,
      std::map<gd::String, gd::String> &resourcesFileNameMap);


  ~ObjectAssetSerializer(){};

private:
  ObjectAssetSerializer(){};

  static void RenameObjectResourceFiles(
      gd::Project &project, gd::Object &object,
      const gd::String &destinationDirectory, const gd::String &objectFullName,
      std::map<gd::String, gd::String> &resourcesFileNameMap,
      std::map<gd::String, gd::String> &resourcesNameReverseMap);
};

} // namespace gd
