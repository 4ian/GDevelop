/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "AssetResourcesMergingHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/String.h"


namespace gd {
AssetResourcesMergingHelper::AssetResourcesMergingHelper(
    gd::Project &project_, gd::AbstractFileSystem &fileSystem)
    : ResourcesMergingHelper(project_.GetResourcesManager(), fileSystem),
      project(project_){};

void AssetResourcesMergingHelper::ExposeImage(gd::String &imageName) {
  ExposeResourceAsFile(imageName);
}

void AssetResourcesMergingHelper::ExposeAudio(gd::String &audioName) {
  ExposeResourceAsFile(audioName);
}

void AssetResourcesMergingHelper::ExposeFont(gd::String &fontName) {
  ExposeResourceAsFile(fontName);
}

void AssetResourcesMergingHelper::ExposeJson(gd::String &jsonName) {
  ExposeResourceAsFile(jsonName);
}

void AssetResourcesMergingHelper::ExposeTilemap(gd::String &tilemapName) {
  ExposeResourceAsFile(tilemapName);
}

void AssetResourcesMergingHelper::ExposeTileset(gd::String &tilesetName) {
  ExposeResourceAsFile(tilesetName);
}

void AssetResourcesMergingHelper::ExposeVideo(gd::String &videoName) {
  ExposeResourceAsFile(videoName);
}

void AssetResourcesMergingHelper::ExposeBitmapFont(gd::String &bitmapFontName) {
  ExposeResourceAsFile(bitmapFontName);
}

void AssetResourcesMergingHelper::ExposeResourceAsFile(
    gd::String &resourceName) {

  auto &resource = project.GetResourcesManager().GetResource(resourceName);
  gd::String file = resource.GetFile();
  ExposeFile(file);
  resourceName = file;
}

} // namespace gd
