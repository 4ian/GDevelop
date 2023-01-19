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
class GD_CORE_API AssetResourcesMergingHelper : public ResourcesMergingHelper {
public:
  AssetResourcesMergingHelper(gd::Project &project_,
                              gd::AbstractFileSystem &fileSystem);
  virtual ~AssetResourcesMergingHelper(){};

  void ExposeImage(gd::String &imageName) override;
  void ExposeAudio(gd::String &audioName) override;
  void ExposeFont(gd::String &fontName) override;
  void ExposeJson(gd::String &jsonName) override;
  void ExposeTilemap(gd::String &tilemapName) override;
  void ExposeTileset(gd::String &tilesetName) override;
  void ExposeVideo(gd::String &videoName) override;
  void ExposeBitmapFont(gd::String &bitmapFontName) override;

protected:
  void ExposeResourceAsFile(gd::String &resourceName);

  gd::Project &project;
};

} // namespace gd
