/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/String.h"

#include <set>

namespace gd {
class Project;
class Layout;
class SerializerElement;
} // namespace gd

namespace gd {

/**
 * \brief Class used to rename resources (in an object, an entire project,
 * etc...)
 *
 * \ingroup IDE
 */
class UsedResourcesDeclarer : private gd::ArbitraryResourceWorker {
public:
  static std::set<gd::String> GetLayoutUsedResources(gd::Project &project,
                                         gd::Layout &layout);

  static std::set<gd::String> GetProjectUsedResources(gd::Project &project);

  virtual ~UsedResourcesDeclarer(){};

private:
  UsedResourcesDeclarer()
      : gd::ArbitraryResourceWorker(){};

  void DeclareUsedResource(gd::String &resourceName);

  void ExposeFile(gd::String &resourceFileName) override{
      // Don't do anything: we're renaming resources, not the files they are
      // pointing to.
  };
  void ExposeImage(gd::String &imageResourceName) override {
    DeclareUsedResource(imageResourceName);
  };
  void ExposeAudio(gd::String &audioResourceName) override {
    DeclareUsedResource(audioResourceName);
  };
  void ExposeFont(gd::String &fontResourceName) override {
    DeclareUsedResource(fontResourceName);
  };
  void ExposeJson(gd::String &jsonResourceName) override {
    DeclareUsedResource(jsonResourceName);
  };
  void ExposeTilemap(gd::String &tilemapResourceName) override {
    DeclareUsedResource(tilemapResourceName);
  };
  void ExposeTileset(gd::String &tilesetResourceName) override {
    DeclareUsedResource(tilesetResourceName);
  };
  void ExposeVideo(gd::String &videoResourceName) override {
    DeclareUsedResource(videoResourceName);
  };
  void ExposeBitmapFont(gd::String &bitmapFontName) override {
    DeclareUsedResource(bitmapFontName);
  };
  void ExposeModel3D(gd::String &resourceName) override {
    DeclareUsedResource(resourceName);
  };

  std::set<gd::String> resourceNames;
};

} // namespace gd
