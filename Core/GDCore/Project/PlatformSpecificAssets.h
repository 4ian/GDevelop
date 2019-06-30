/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_PLATFORMASSETS_H
#define GDCORE_PLATFORMASSETS_H
#include <map>
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class ArbitraryResourceWorker;
}

namespace gd {

/**
 * \brief Store the icons, splashscreens or reference to any other asset
 * that can be needed when exporting the game.
 *
 * \see gd::Project
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API PlatformSpecificAssets {
 public:
  PlatformSpecificAssets(){};
  virtual ~PlatformSpecificAssets(){};

  /**
   * \brief Return true if the specified asset exists.
   */
  bool Has(const gd::String& platform, const gd::String& name) const;

  /**
   * \brief Get the specified asset resource name.
   */
  const gd::String& Get(const gd::String& platform,
                        const gd::String& name) const;

  /**
   * \brief Remove the specified asset.
   */
  void Remove(const gd::String& platform, const gd::String& name);

  /**
   * \brief Remove the specified asset.
   */
  void Set(const gd::String& platform,
           const gd::String& name,
           const gd::String& resourceName);

  void ExposeResources(gd::ArbitraryResourceWorker& worker);

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the PlatformSpecificAssets
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the PlatformSpecificAssets.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

 private:
  std::map<gd::String, gd::String> assets;

  static gd::String badStr;
};
}  // namespace gd

#endif  // GDCORE_PLATFORMASSETS_H
