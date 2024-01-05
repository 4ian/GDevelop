/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
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
 * \brief AssetResourcePathCleaner is used when exporting an object as an asset.
 * It removes the folder from the path.
 *
 * \see ArbitraryResourceWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API AssetResourcePathCleaner : public ArbitraryResourceWorker {
public:
  AssetResourcePathCleaner(
      gd::ResourcesManager &resourcesManager,
      std::map<gd::String, gd::String> &resourcesFileNameMap_,
      std::map<gd::String, gd::String> &resourcesNameReverseMap_)
      : ArbitraryResourceWorker(resourcesManager),
        resourcesFileNameMap(resourcesFileNameMap_),
        resourcesNameReverseMap(resourcesNameReverseMap_){};
  virtual ~AssetResourcePathCleaner(){};

  void ExposeImage(gd::String &imageName) override;
  void ExposeAudio(gd::String &audioName) override;
  void ExposeFont(gd::String &fontName) override;
  void ExposeJson(gd::String &jsonName) override;
  void ExposeTilemap(gd::String &tilemapName) override;
  void ExposeTileset(gd::String &tilesetName) override;
  void ExposeVideo(gd::String &videoName) override;
  void ExposeBitmapFont(gd::String &bitmapFontName) override;
  void ExposeFile(gd::String &resource) override;

protected:
  void ExposeResourceAsFile(gd::String &resourceName);

  /**
   * New file names that can be accessed by their original name.
   */
  std::map<gd::String, gd::String> &resourcesFileNameMap;

  /**
   * Original resource names that can be accessed by their new name.
   */
  std::map<gd::String, gd::String> &resourcesNameReverseMap;
};

} // namespace gd
