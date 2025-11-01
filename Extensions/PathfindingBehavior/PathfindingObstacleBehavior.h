/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include <map>

#include "GDCore/Project/Behavior.h"
namespace gd {
class SerializerElement;
class PropertyDescriptor;
class Project;
class Layout;
}  // namespace gd

/**
 * \brief Behavior that mark object as being obstacles for objects using
 * pathfinding behavior.
 */
class GD_EXTENSION_API PathfindingObstacleBehavior : public gd::Behavior {
 public:
  PathfindingObstacleBehavior(){};
  virtual ~PathfindingObstacleBehavior(){};
  virtual std::unique_ptr<gd::Behavior> Clone() const override {
    return gd::make_unique<PathfindingObstacleBehavior>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;

  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

 private:
};
