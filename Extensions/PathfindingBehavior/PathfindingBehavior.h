/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include "GDCore/Vector2.h"
#include <vector>
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"

namespace gd {
class Layout;
}
class RuntimeScene;
class PlatformBehavior;
class ScenePathfindingObstaclesManager;
namespace gd {
class SerializerElement;
}
class RuntimeScenePlatformData;

/**
 * \brief Compute path for objects avoiding obstacles
 */
class GD_EXTENSION_API PathfindingBehavior : public gd::Behavior {
 public:
  PathfindingBehavior(){};
  virtual ~PathfindingBehavior(){};
  virtual std::unique_ptr<gd::Behavior> Clone() const override {
    return gd::make_unique<PathfindingBehavior>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;

  /**
   * \brief Serialize the behavior
   */
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

 private:
};
