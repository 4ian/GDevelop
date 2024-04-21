/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <vector>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
}  // namespace gd

namespace gd {

class GD_CORE_API ObjectsUsingResourceCollector
    : public ArbitraryObjectsWorker {
public:
  ObjectsUsingResourceCollector(gd::ResourcesManager &resourcesManager_,
                                const gd::String &resourceName_)
      : resourcesManager(&resourcesManager_), resourceName(resourceName_){};
  virtual ~ObjectsUsingResourceCollector();

  std::vector<gd::String>& GetObjectNames() { return objectNames; }

 private:
  void DoVisitObject(gd::Object& object) override;

  std::vector<gd::String> objectNames;
  gd::String resourceName;
  gd::ResourcesManager *resourcesManager;
};

class GD_CORE_API ResourceNameMatcher : public ArbitraryResourceWorker {
public:
  ResourceNameMatcher(gd::ResourcesManager &resourcesManager,
                      const gd::String &resourceName_)
      : resourceName(resourceName_),
        matchesResourceName(false), gd::ArbitraryResourceWorker(
                                        resourcesManager){};
  virtual ~ResourceNameMatcher(){};

  bool AnyResourceMatches() { return matchesResourceName; }
  void Reset() { matchesResourceName = false; }

 private:
  virtual void ExposeFile(gd::String& resource) override{
      /*Don't care, we just read resource names*/
  };
  virtual void ExposeImage(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeAudio(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeFont(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeJson(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeTilemap(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeTileset(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeVideo(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeBitmapFont(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeModel3D(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeAtlas(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };
  virtual void ExposeSpine(gd::String& otherResourceName) override {
    MatchResourceName(otherResourceName);
  };

  void MatchResourceName(gd::String& otherResourceName) {
    if (otherResourceName == resourceName) matchesResourceName = true;
  }

  gd::String resourceName;
  bool matchesResourceName;
};

};  // namespace gd
