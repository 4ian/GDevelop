/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#ifndef TILEDSPRITEOBJECT_H
#define TILEDSPRITEOBJECT_H
#include <memory>
#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class InitialInstance;
class Project;
}

/**
 * TiledSprite Object
 */
class GD_EXTENSION_API TiledSpriteObject : public gd::ObjectConfiguration {
 public:
  TiledSpriteObject();
  virtual ~TiledSpriteObject(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
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
};

#endif  // TILEDSPRITEOBJECT_H
