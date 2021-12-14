/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef ARBITRARYRESOURCEWORKER_H
#define ARBITRARYRESOURCEWORKER_H

#include <map>
#include <memory>
#include <vector>
#include "GDCore/String.h"
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
 * \see gd::LaunchResourceWorkerOnEvents
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryResourceWorker {
 public:
  ArbitraryResourceWorker(){};
  virtual ~ArbitraryResourceWorker();

  /**
   * \brief Expose a set of resources.
   * \note When launching an ArbitraryResourceWorker, this should be called
   * first to ensure that resources are known so that images, shaders & audio
   * can make reference to them.
   */
  void ExposeResources(gd::ResourcesManager *resourcesManager);

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

 protected:
  const std::vector<gd::ResourcesManager *> &GetResources() {
    return resourcesManagers;
  };

 private:
  /**
   * \brief Expose a resource: resources that have a file are
   * exposed as file (see ExposeFile).
   */
  void ExposeResource(gd::Resource &resource);

  std::vector<gd::ResourcesManager *> resourcesManagers;
};

/**
 * Tool function iterating over each event and calling
 * Expose(Actions/Conditions)Resources for each actions and conditions with the
 * ArbitraryResourceWorker passed as argument.
 *
 * \see gd::ArbitraryResourceWorker
 * \ingroup IDE
 */
void GD_CORE_API
LaunchResourceWorkerOnEvents(const gd::Project &project,
                             gd::EventsList &events,
                             gd::ArbitraryResourceWorker &worker);

}  // namespace gd

#endif  // ARBITRARYRESOURCEWORKER_H
