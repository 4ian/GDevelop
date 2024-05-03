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
 * \brief Find resource usages in several parts of the project.
 *
 * \ingroup IDE
 */
class SceneResourcesFinder : private gd::ArbitraryResourceWorker {
public:
  /**
   * @brief Find resource usages in a given scenes.
   *
   * It doesn't include resources used globally.
   */
  static std::set<gd::String> FindSceneResources(gd::Project &project,
                                                      gd::Layout &layout);

  /**
   * @brief Find resource that are used globally in the project.
   *
   * It doesn't include resources used in scenes.
   */
  static std::set<gd::String> FindProjectResources(gd::Project &project);

  virtual ~SceneResourcesFinder(){};

private:
  SceneResourcesFinder(gd::ResourcesManager &resourcesManager)
      : gd::ArbitraryResourceWorker(resourcesManager){};

  void AddUsedResource(gd::String &resourceName);

  void ExposeFile(gd::String &resourceFileName) override{
      // Don't do anything: we're renaming resources, not the files they are
      // pointing to.
  };
  void ExposeImage(gd::String &imageResourceName) override {
    AddUsedResource(imageResourceName);
  };
  void ExposeAudio(gd::String &audioResourceName) override {
    AddUsedResource(audioResourceName);
  };
  void ExposeFont(gd::String &fontResourceName) override {
    AddUsedResource(fontResourceName);
  };
  void ExposeJson(gd::String &jsonResourceName) override {
    AddUsedResource(jsonResourceName);
  };
  void ExposeTilemap(gd::String &tilemapResourceName) override {
    AddUsedResource(tilemapResourceName);
  };
  void ExposeTileset(gd::String &tilesetResourceName) override {
    AddUsedResource(tilesetResourceName);
  };
  void ExposeVideo(gd::String &videoResourceName) override {
    AddUsedResource(videoResourceName);
  };
  void ExposeBitmapFont(gd::String &bitmapFontName) override {
    AddUsedResource(bitmapFontName);
  };
  void ExposeModel3D(gd::String &resourceName) override {
    AddUsedResource(resourceName);
  };
  void ExposeAtlas(gd::String &resourceName) override {
    AddUsedResource(resourceName);
  };
  void ExposeSpine(gd::String &resourceName) override {
    AddUsedResource(resourceName);
  };

  std::set<gd::String> resourceNames;
};

} // namespace gd
