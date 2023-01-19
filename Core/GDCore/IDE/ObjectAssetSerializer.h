/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
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

  ~ObjectAssetSerializer(){};

private:
  ObjectAssetSerializer(){};

  static const std::vector<gd::String> resourceTypes;
};

} // namespace gd
