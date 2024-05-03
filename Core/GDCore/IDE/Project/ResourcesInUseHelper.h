/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <set>
#include <vector>

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/String.h"
#include "GDCore/IDE/ResourceExposer.h"

namespace gd {

/**
 * \brief Class used to track all resources used by a game,
 * or a part of it (like a gd::Object).
 *
 * Usage example:
\code
gd::ResourcesInUseHelper resourcesInUse;
gd::ResourceExposer::ExposeWholeProjectResources(project, resourcesInUse);

//Get a set with the name of all images in the project:
std::set<gd::String> & usedImages = resourcesInUse.GetAllImages();
\endcode
 *
 * \ingroup IDE
 */
class ResourcesInUseHelper : public gd::ArbitraryResourceWorker {
public:
  ResourcesInUseHelper(gd::ResourcesManager &resourcesManager)
      : gd::ArbitraryResourceWorker(resourcesManager){};
  virtual ~ResourcesInUseHelper(){};

  const std::vector<gd::String>& GetAllResources();
  std::set<gd::String>& GetAllImages() { return GetAll("image"); };
  std::set<gd::String>& GetAllAudios() { return GetAll("audio"); };
  std::set<gd::String>& GetAllFonts() { return GetAll("font"); };
  std::set<gd::String>& GetAllJsons() { return GetAll("json"); };
  std::set<gd::String>& GetAllTilemaps() { return GetAll("tilemap"); };
  std::set<gd::String>& GetAllTilesets() { return GetAll("tileset"); };
  std::set<gd::String>& GetAllVideos() { return GetAll("video"); };
  std::set<gd::String>& GetAllBitmapFonts() { return GetAll("bitmapFont"); };
  std::set<gd::String>& GetAll3DModels() { return GetAll("model3D"); };
  std::set<gd::String>& GetAllAtlases() { return GetAll("atlas"); };
  std::set<gd::String>& GetAllSpines() { return GetAll("spine"); };
  std::set<gd::String>& GetAll(const gd::String& resourceType) {
    if (resourceType == "image") return allImages;
    if (resourceType == "audio") return allAudios;
    if (resourceType == "font") return allFonts;
    if (resourceType == "json") return allJsons;
    if (resourceType == "tilemap") return allTilemaps;
    if (resourceType == "tileset") return allTilesets;
    if (resourceType == "video") return allVideos;
    if (resourceType == "bitmapFont") return allBitmapFonts;
    if (resourceType == "model3D") return allModel3Ds;
    if (resourceType == "atlas") return allAtlases;
    if (resourceType == "spine") return allSpines;

    return emptyResources;
  };

  virtual void ExposeFile(gd::String& resource) override{
      /*Don't care, we just list resource names*/
  };
  virtual void ExposeImage(gd::String& resourceName) override {
    allImages.insert(resourceName);
  };
  virtual void ExposeAudio(gd::String& resourceName) override {
    allAudios.insert(resourceName);
  };
  virtual void ExposeFont(gd::String& resourceName) override {
    allFonts.insert(resourceName);
  };
  virtual void ExposeJson(gd::String& resourceName) override {
    allJsons.insert(resourceName);
  };
  virtual void ExposeTilemap(gd::String& resourceName) override {
    allTilemaps.insert(resourceName);
  };
  virtual void ExposeTileset(gd::String& resourceName) override {
    allTilesets.insert(resourceName);
  };
  virtual void ExposeVideo(gd::String& resourceName) override {
    allVideos.insert(resourceName);
  };
  virtual void ExposeBitmapFont(gd::String& resourceName) override {
    allBitmapFonts.insert(resourceName);
  };
  virtual void ExposeModel3D(gd::String& resourceName) override {
    allModel3Ds.insert(resourceName);
  };
  virtual void ExposeAtlas(gd::String& resourceName) override {
    allAtlases.insert(resourceName);
  };
  virtual void ExposeSpine(gd::String& resourceName) override {
    allSpines.insert(resourceName);
  };

 protected:
  std::vector<gd::String> allResources;
  std::set<gd::String> allImages;
  std::set<gd::String> allAudios;
  std::set<gd::String> allFonts;
  std::set<gd::String> allJsons;
  std::set<gd::String> allTilemaps;
  std::set<gd::String> allTilesets;
  std::set<gd::String> allVideos;
  std::set<gd::String> allBitmapFonts;
  std::set<gd::String> allModel3Ds;
  std::set<gd::String> allAtlases;
  std::set<gd::String> allSpines;
  std::set<gd::String> emptyResources;

  static const std::vector<gd::String> resourceTypes;
};

}  // namespace gd
