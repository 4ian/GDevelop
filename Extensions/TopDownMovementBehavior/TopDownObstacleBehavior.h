/**

GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TOPDOWNOBSTACLEBEHAVIOR_H
#define TOPDOWNOBSTACLEBEHAVIOR_H
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Object.h"
class ScenePlatformObjectsManager;
class RuntimeScene;
namespace gd {
class SerializerElement;
}
#if defined(GD_IDE_ONLY)
#include <map>
namespace gd {
class PropertyDescriptor;
class Project;
class Layout;
}  // namespace gd
#endif

/**
 * \brief Behavior that mark object as being a platform for objects using
 * PlatformerObject behavior.
 */
class GD_EXTENSION_API TopDownObstacleBehavior : public Behavior {
 public:
  TopDownObstacleBehavior(){};
  virtual ~TopDownObstacleBehavior(){};
  virtual Behavior* Clone() const override {
    return new TopDownObstacleBehavior(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;
#endif
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

 private:
};

#endif  // PLATFORMBEHAVIOR_H
