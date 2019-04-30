/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PATHFINDINGBEHAVIOR_H
#define PATHFINDINGBEHAVIOR_H
#include <SFML/System/Vector2.hpp>
#include <vector>
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Object.h"
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
class GD_EXTENSION_API PathfindingBehavior : public Behavior {
 public:
  PathfindingBehavior(){};
  virtual ~PathfindingBehavior(){};
  virtual Behavior* Clone() const override {
    return new PathfindingBehavior(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent,
      gd::Project& project) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value,
                              gd::Project& project) override;
#endif

  /**
   * \brief Serialize the behavior
   */
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

 private:
};
#endif  // PATHFINDINGBEHAVIOR_H
