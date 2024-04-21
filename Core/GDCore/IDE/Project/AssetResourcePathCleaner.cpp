/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "AssetResourcePathCleaner.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/String.h"

namespace gd {
void AssetResourcePathCleaner::ExposeImage(gd::String &imageName) {
  ExposeResourceAsFile(imageName);
}

void AssetResourcePathCleaner::ExposeAudio(gd::String &audioName) {
  ExposeResourceAsFile(audioName);
}

void AssetResourcePathCleaner::ExposeFont(gd::String &fontName) {
  ExposeResourceAsFile(fontName);
}

void AssetResourcePathCleaner::ExposeJson(gd::String &jsonName) {
  ExposeResourceAsFile(jsonName);
}

void AssetResourcePathCleaner::ExposeTilemap(gd::String &tilemapName) {
  ExposeResourceAsFile(tilemapName);
}

void AssetResourcePathCleaner::ExposeTileset(gd::String &tilesetName) {
  ExposeResourceAsFile(tilesetName);
}

void AssetResourcePathCleaner::ExposeVideo(gd::String &videoName) {
  ExposeResourceAsFile(videoName);
}

void AssetResourcePathCleaner::ExposeBitmapFont(gd::String &bitmapFontName) {
  ExposeResourceAsFile(bitmapFontName);
}

void AssetResourcePathCleaner::ExposeResourceAsFile(gd::String &resourceName) {

  auto &resource = resourcesManager->GetResource(resourceName);
  gd::String file = resource.GetFile();
  ExposeFile(file);

  resourcesNameReverseMap[file] = resourceName;
  resourceName = file;
}

void AssetResourcePathCleaner::ExposeFile(gd::String &resourceFilePath) {

  size_t slashPos = resourceFilePath.find_last_of("/");
  size_t antiSlashPos = resourceFilePath.find_last_of("\\");
  size_t baseNamePos =
      slashPos == String::npos
          ? antiSlashPos == String::npos ? 0 : (antiSlashPos + 1)
      : antiSlashPos == String::npos ? (slashPos + 1)
      : slashPos > antiSlashPos      ? (slashPos + 1)
                                     : (antiSlashPos + 1);
  gd::String baseName =
      baseNamePos != 0
          ? resourceFilePath.substr(baseNamePos, resourceFilePath.length())
          : resourceFilePath;

  resourcesFileNameMap[resourceFilePath] = baseName;
  resourceFilePath = baseName;
}

} // namespace gd
