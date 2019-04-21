/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#ifndef TILEDSPRITEOBJECT_H
#define TILEDSPRITEOBJECT_H
#include <memory>
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class SFMLTextureWrapper;
class RuntimeScene;
namespace gd {
class InitialInstance;
}
#if defined(GD_IDE_ONLY)
namespace gd {
class Project;
}
#endif

/**
 * TiledSprite Object
 */
class GD_EXTENSION_API TiledSpriteObject : public gd::Object {
 public:
  TiledSpriteObject(gd::String name_);
  virtual ~TiledSpriteObject(){};
  virtual std::unique_ptr<gd::Object> Clone() const {
    return gd::make_unique<TiledSpriteObject>(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual void ExposeResources(gd::ArbitraryResourceWorker &worker);
#endif

  virtual float GetWidth() const { return width; };
  virtual float GetHeight() const { return height; };

  virtual void SetWidth(float newWidth) { width = newWidth; };
  virtual void SetHeight(float newHeight) { height = newHeight; };

  void SetTexture(const gd::String &newTextureName) {
    textureName = newTextureName;
  };
  const gd::String &GetTexture() const { return textureName; };

  gd::String textureName;  ///< deprecated. Use Get/SetTexture instead.

 private:
  virtual void DoUnserializeFrom(gd::Project &project,
                                 const gd::SerializerElement &element);
#if defined(GD_IDE_ONLY)
  virtual void DoSerializeTo(gd::SerializerElement &element) const;
#endif

  float width;
  float height;
  bool smooth;

  std::shared_ptr<SFMLTextureWrapper> texture;
};

class GD_EXTENSION_API RuntimeTiledSpriteObject : public RuntimeObject {
 public:
  RuntimeTiledSpriteObject(RuntimeScene &scene,
                           const TiledSpriteObject &tiledSpriteObject);
  virtual ~RuntimeTiledSpriteObject(){};
  virtual std::unique_ptr<RuntimeObject> Clone() const {
    return gd::make_unique<RuntimeTiledSpriteObject>(*this);
  }

  virtual bool Draw(sf::RenderTarget &renderTarget);

  virtual float GetWidth() const { return width; };
  virtual float GetHeight() const { return height; };

  virtual float GetAngle() const { return angle; };
  virtual bool SetAngle(float ang) {
    angle = ang;
    return true;
  };

  virtual void SetWidth(float newWidth) { width = newWidth; };
  virtual void SetHeight(float newHeight) { height = newHeight; };

  void SetXOffset(float xOffset_) { xOffset = xOffset_; };
  float GetXOffset() const { return xOffset; };
  void SetYOffset(float yOffset_) { yOffset = yOffset_; };
  float GetYOffset() const { return yOffset; };

  void ChangeAndReloadImage(const gd::String &texture,
                            const RuntimeScene &scene);

#if defined(GD_IDE_ONLY)
  virtual void GetPropertyForDebugger(std::size_t propertyNb,
                                      gd::String &name,
                                      gd::String &value) const;
  virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
  virtual std::size_t GetNumberOfProperties() const;
#endif

  gd::String textureName;

 private:
  float width;
  float height;
  float angle;
  bool smooth;
  float xOffset;
  float yOffset;

  std::shared_ptr<SFMLTextureWrapper> texture;
};

#endif  // TILEDSPRITEOBJECT_H
