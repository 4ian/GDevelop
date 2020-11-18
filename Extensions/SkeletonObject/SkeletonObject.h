
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#ifndef SKELETONOBJECT_H
#define SKELETONOBJECT_H

#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/String.h"
namespace gd {
class InitialInstance;
class Project;
}
namespace sf {
class Texture;
class Sprite;
}

class GD_EXTENSION_API SkeletonObject : public gd::Object {
 public:
  SkeletonObject(gd::String name_);
  virtual ~SkeletonObject(){};
  virtual std::unique_ptr<gd::Object> Clone() const override {
    return gd::make_unique<SkeletonObject>(*this);
  }

#if defined(GD_IDE_ONLY)
  std::map<gd::String, gd::PropertyDescriptor> GetProperties() const override;
  bool UpdateProperty(const gd::String& name,
                      const gd::String& value) override;
#endif

 private:
  void DoUnserializeFrom(gd::Project& project,
                         const gd::SerializerElement& element) override;
#if defined(GD_IDE_ONLY)
  void DoSerializeTo(gd::SerializerElement& element) const override;
#endif

  gd::String skeletalDataFilename;
  gd::String rootArmatureName;
  gd::String textureDataFilename;
  gd::String textureName;
  gd::String apiName;
  bool debugPolygons;

#if defined(GD_IDE_ONLY)
  sf::Vector2f originalSize;
  sf::Vector2f originOffset;
  bool sizeDirty;
#endif
};

gd::Object* CreateSkeletonObject(gd::String name);

#endif  // SKELETONOBJECT_H
