/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>

namespace gd {
class AbstractFileSystem;
class Project;
} // namespace gd

namespace gd {

/**
 * \brief ResourcesMergingHelper is used (mainly during export)
 * to list resources and generate new filenames, to allow them to be all copied
 * in a single directory (potentially changing the filename to avoid conflicts,
 * but preserving extensions).
 *
 * \see ArbitraryResourceWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API AssetResourcesMergingHelper : public ArbitraryResourceWorker {
public:
  AssetResourcesMergingHelper(
      gd::ResourcesManager &resourcesManager,
      std::map<gd::String, gd::String> &resourcesFileNameMap_)
      : ArbitraryResourceWorker(resourcesManager),
        resourcesFileNameMap(&resourcesFileNameMap_){};
  virtual ~AssetResourcesMergingHelper(){};

  void ExposeImage(gd::String &imageName) override;
  void ExposeAudio(gd::String &audioName) override;
  void ExposeFont(gd::String &fontName) override;
  void ExposeJson(gd::String &jsonName) override;
  void ExposeTilemap(gd::String &tilemapName) override;
  void ExposeTileset(gd::String &tilesetName) override;
  void ExposeVideo(gd::String &videoName) override;
  void ExposeBitmapFont(gd::String &bitmapFontName) override;
  void ExposeFile(gd::String &resource) override;

  /**
   * \brief Return a map containing the resources old absolute filename as key,
   * and the resources new filenames as value. The new filenames are relative to
   * the Base Directory.
   */
  std::map<gd::String, gd::String> &GetAllResourcesOldAndNewFilename() {
    return *resourcesFileNameMap;
  };

protected:
  void ExposeResourceAsFile(gd::String &resourceName);

  /**
   * New file names that can be accessed by their original name.
   */
  std::map<gd::String, gd::String> *resourcesFileNameMap;
};

} // namespace gd
