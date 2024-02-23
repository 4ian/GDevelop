/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
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
   * \brief Serialize an object into an asset.
   *
   * \param project The project that contains the object and its resources.
   * It's not actually modified.
   * \param object The object to serialize as an asset.
   * \param objectFullName The object name with spaces instead of PascalCase.
   * \param element The element where the asset is serialize.
   * \param usedResourceNames Return the names of the resources used by the asset.
   */
  static void
  SerializeTo(gd::Project &project, const gd::Object &object,
              const gd::String &objectFullName, SerializerElement &element,
              std::vector<gd::String> &usedResourceNames);

  ~ObjectAssetSerializer(){};

private:
  ObjectAssetSerializer(){};

  static gd::String GetObjectExtensionName(const gd::Object &object);
};

} // namespace gd
