/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PHYSICBEHAVIOR_H
#define PHYSICBEHAVIOR_H

#include <map>
#include <set>
#include <vector>
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Vector2.h"
namespace gd {
class Project;
class SerializerElement;
}  // namespace gd

class GD_EXTENSION_API PhysicsBehavior : public gd::Behavior {
 public:
  PhysicsBehavior(){};
  virtual ~PhysicsBehavior(){};
  virtual Behavior *Clone() const override {
    return new PhysicsBehavior(*this);
  }

  enum Positioning { OnOrigin = 0, OnCenter = 2 };

#if defined(GD_IDE_ONLY)
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement &behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement &behaviorContent,
                              const gd::String &name,
                              const gd::String &value) override;
#endif
  /**
   * Serialize the behavior
   */
  virtual void InitializeContent(
      gd::SerializerElement &behaviorContent) override;

 private:
  gd::String GetStringFromCoordsVector(const std::vector<gd::Vector2f> &vec,
                                       char32_t coordsSep,
                                       char32_t composantSep);
  enum ShapeType {
    Box,
    Circle,
    CustomPolygon
  } shapeType;  ///< the kind of hitbox -> Box, Circle or CustomPolygon
};

#endif  // PHYSICBEHAVIOR_H
