/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef IMAGESUSEDINVENTORIZER_H
#define IMAGESUSEDINVENTORIZER_H

#include <set>
#include <vector>

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Class used to track all resources used by a game,
 * or a part of it (like a gd::Object).
 *
 * Usage example:
\code
gd::ResourcesInUseHelper resourcesInUse;
project.ExposeResources(resourcesInUse);

//Get a set with the name of all images in the project:
std::set<gd::String> & usedImages = resourcesInUse.GetAllImages();
\endcode
 *
 * \ingroup IDE
 */
class ResourcesInUseHelper : public gd::ArbitraryResourceWorker {
 public:
  ResourcesInUseHelper() : gd::ArbitraryResourceWorker(){};
  virtual ~ResourcesInUseHelper(){};

  std::set<gd::String>& GetAllImages() { return GetAll("image"); };
  std::set<gd::String>& GetAllAudios() { return GetAll("audio"); };
  std::set<gd::String>& GetAllFonts() { return GetAll("font"); };
  std::set<gd::String>& GetAllJsons() { return GetAll("json"); };
  std::set<gd::String>& GetAllTilemaps() { return GetAll("tilemap"); };
  std::set<gd::String>& GetAllVideos() { return GetAll("video"); };
  std::set<gd::String>& GetAllBitmapFonts() { return GetAll("bitmapFont"); };
  std::set<gd::String>& GetAll(const gd::String& resourceType) {
    if (resourceType == "image") return allImages;
    if (resourceType == "audio") return allAudios;
    if (resourceType == "font") return allFonts;
    if (resourceType == "json") return allJsons;
    if (resourceType == "tilemap") return allTilemaps;
    if (resourceType == "video") return allVideos;
    if (resourceType == "bitmapFont") return allBitmapFonts;

    return emptyResources;
  };

  virtual void ExposeFile(gd::String& resource) override{
      /*Don't care, we just list resource names*/
  };
  virtual void ExposeImage(gd::String& imageResourceName) override {
    allImages.insert(imageResourceName);
  };
  virtual void ExposeAudio(gd::String& audioResourceName) override {
    allAudios.insert(audioResourceName);
  };
  virtual void ExposeFont(gd::String& fontResourceName) override {
    allFonts.insert(fontResourceName);
  };
  virtual void ExposeJson(gd::String& jsonResourceName) override {
    allJsons.insert(jsonResourceName);
  };
  virtual void ExposeTilemap(gd::String& tilemapResourceName) override {
    allTilemaps.insert(tilemapResourceName);
  };
  virtual void ExposeVideo(gd::String& videoResourceName) override {
    allVideos.insert(videoResourceName);
  };
  virtual void ExposeBitmapFont(gd::String& bitmapFontResourceName) override {
    allBitmapFonts.insert(bitmapFontResourceName);
  };

 protected:
  std::set<gd::String> allImages;
  std::set<gd::String> allAudios;
  std::set<gd::String> allFonts;
  std::set<gd::String> allJsons;
  std::set<gd::String> allTilemaps;
  std::set<gd::String> allVideos;
  std::set<gd::String> allBitmapFonts;
  std::set<gd::String> emptyResources;
};

}  // namespace gd

#endif  // IMAGESUSEDINVENTORIZER_H
#endif
