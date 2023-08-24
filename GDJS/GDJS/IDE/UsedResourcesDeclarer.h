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
  static void DeclareLayoutUsedResources(gd::SerializerElement &layoutElement,
                                         gd::Project &project,
                                         gd::Layout &layout);

  static void DeclareProjectUsedResources(gd::SerializerElement &layoutElement,
                                          gd::Project &project);

  virtual ~UsedResourcesDeclarer(){};

private:
  UsedResourcesDeclarer(gd::SerializerElement &resourcesElement_)
      : gd::ArbitraryResourceWorker(), resourcesElement(resourcesElement_){};

  void DeclareLayoutResource(gd::String &resourceName);

  void ExposeFile(gd::String &resourceFileName) override{
      // Don't do anything: we're renaming resources, not the files they are
      // pointing to.
  };
  void ExposeImage(gd::String &imageResourceName) override {
    DeclareLayoutResource(imageResourceName);
  };
  void ExposeAudio(gd::String &audioResourceName) override {
    DeclareLayoutResource(audioResourceName);
  };
  void ExposeFont(gd::String &fontResourceName) override {
    DeclareLayoutResource(fontResourceName);
  };
  void ExposeJson(gd::String &jsonResourceName) override {
    DeclareLayoutResource(jsonResourceName);
  };
  void ExposeTilemap(gd::String &tilemapResourceName) override {
    DeclareLayoutResource(tilemapResourceName);
  };
  void ExposeTileset(gd::String &tilesetResourceName) override {
    DeclareLayoutResource(tilesetResourceName);
  };
  void ExposeVideo(gd::String &videoResourceName) override {
    DeclareLayoutResource(videoResourceName);
  };
  void ExposeBitmapFont(gd::String &bitmapFontName) override {
    DeclareLayoutResource(bitmapFontName);
  };
  void ExposeModel3D(gd::String &resourceName) override {
    DeclareLayoutResource(resourceName);
  };

  gd::SerializerElement &resourcesElement;
  std::set<gd::String> resourceNames;
};

} // namespace gd
