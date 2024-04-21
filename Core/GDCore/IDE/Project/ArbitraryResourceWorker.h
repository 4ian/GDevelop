/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <map>
#include <memory>
#include <vector>
#include "GDCore/String.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
namespace gd {
class BaseEvent;
}
namespace gd {
class Project;
}
namespace gd {
class EventsList;
}
namespace gd {
class Resource;
}
namespace gd {
class ResourcesManager;
}

namespace gd {

/**
 * \brief ArbitraryResourceWorker is used so as to inventory resources and
 * sometimes update them.
 *
 * \see ResourcesMergingHelper
 * \see gd::ResourcesInUseHelper
 *
 * \see gd::GetResourceWorkerOnEvents
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryResourceWorker {
public:
  ArbitraryResourceWorker(gd::ResourcesManager &resourcesManager_)
      : resourcesManager(&resourcesManager_){};
  virtual ~ArbitraryResourceWorker();

  /**
   * \brief Expose a set of resources.
   * \note When launching an ArbitraryResourceWorker, this should be called
   * first to ensure that resources are known so that images, shaders & audio
   * can make reference to them.
   */
  void ExposeResources();

  /**
   * \brief Expose a resource from a given type.
   */
  void ExposeResourceWithType(const gd::String& resourceType, gd::String& resourceName);

  /**
   * \brief Expose an image, which is always a reference to a "image" resource.
   */
  virtual void ExposeImage(gd::String &imageName);

  /**
   * \brief Expose an audio, which is either a reference to an "audio" resource,
   * or a filename if no resource with this name exists (for backward compatibility).
   */
  virtual void ExposeAudio(gd::String &audioName);

  /**
   * \brief Expose a font, which is either a reference to a "font" resource,
   * or a filename if no resource with this name exists (for backward compatibility).
   */
  virtual void ExposeFont(gd::String &fontName);

  /**
   * \brief Expose a JSON, which is always a reference to a "json" resource.
   */
  virtual void ExposeJson(gd::String &jsonName);

  /**
   * \brief Expose a Tilemap, which is always a reference to a "tilemap" resource.
   */
  virtual void ExposeTilemap(gd::String &tilemapName);

  /**
   * \brief Expose a Tileset, which is always a reference to a "tileset" resource.
   */
  virtual void ExposeTileset(gd::String &tilesetName);

  /**
   * \brief Expose a 3D model, which is always a reference to a "model3D" resource.
   */
  virtual void ExposeModel3D(gd::String &resourceName);
  
  /**
   * \brief Expose an atlas, which is always a reference to a "atlas" resource.
   */
  virtual void ExposeAtlas(gd::String &resourceName);

  /**
   * \brief Expose an spine, which is always a reference to a "spine" resource.
   */
  virtual void ExposeSpine(gd::String &resourceName);

  /**
   * \brief Expose a video, which is always a reference to a "video" resource.
   */
  virtual void ExposeVideo(gd::String &videoName);

  /**
   * \brief Expose a bitmap font, which is always a reference to a "bitmapFont" resource.
   */
  virtual void ExposeBitmapFont(gd::String &bitmapFontName);

  /**
   * \brief Expose a shader.
   * \warn Currently unsupported.
   */
  virtual void ExposeShader(gd::String &shaderName){};

  /**
   * \brief Expose a raw filename.
   */
  virtual void ExposeFile(gd::String &resourceFileName) = 0;

  /**
   * \brief Expose the embedded resources of the specified resource.
   */
  virtual void ExposeEmbeddeds(gd::String &resourceName);

protected:
  gd::ResourcesManager * resourcesManager;

 private:
  /**
   * \brief Expose a resource: resources that have a file are
   * exposed as file (see ExposeFile).
   */
  void ExposeResource(gd::Resource &resource);
};

/**
 * Launch the specified resource worker on every resource referenced in the
 * events.
 */
class ResourceWorkerInEventsWorker : public gd::ArbitraryEventsWorker {
public:
  ResourceWorkerInEventsWorker(const gd::Project &project_,
                               gd::ArbitraryResourceWorker &worker_)
      : project(project_), worker(worker_){};
  virtual ~ResourceWorkerInEventsWorker(){};

private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  const gd::Project &project;
  gd::ArbitraryResourceWorker &worker;
};

ResourceWorkerInEventsWorker GD_CORE_API GetResourceWorkerOnEvents(
    const gd::Project &project, gd::ArbitraryResourceWorker &worker);

/**
 * Launch the specified resource worker on every resource referenced in the
 * objects.
 */
class GD_CORE_API ResourceWorkerInObjectsWorker
    : public gd::ArbitraryObjectsWorker {
public:
  ResourceWorkerInObjectsWorker(const gd::Project &project_, gd::ArbitraryResourceWorker &worker_)
      : project(project_), worker(worker_){};
  ~ResourceWorkerInObjectsWorker() {}

private:
  void DoVisitObject(gd::Object &object) override;
  void DoVisitBehavior(gd::Behavior &behavior) override;

  const gd::Project &project;
  gd::ArbitraryResourceWorker &worker;
};

gd::ResourceWorkerInObjectsWorker GD_CORE_API
GetResourceWorkerOnObjects(const gd::Project &project, gd::ArbitraryResourceWorker &worker);

}  // namespace gd
