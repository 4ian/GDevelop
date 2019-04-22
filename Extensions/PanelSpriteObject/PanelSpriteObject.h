/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/

#ifndef PANELSPRITEOBJECT_H
#define PANELSPRITEOBJECT_H
#include <memory>
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class SFMLTextureWrapper;
class RuntimeScene;
namespace gd {
class Object;
class InitialInstance;
class Project;
}

/**
 * PanelSprite Object
 */
class GD_EXTENSION_API PanelSpriteObject : public gd::Object {
 public:
  PanelSpriteObject(gd::String name_);
  virtual ~PanelSpriteObject();
  virtual std::unique_ptr<gd::Object> Clone() const {
    return std::unique_ptr<gd::Object>(new PanelSpriteObject(*this));
  }

#if defined(GD_IDE_ONLY)
  virtual void ExposeResources(gd::ArbitraryResourceWorker &worker);
#endif

  float GetWidth() const { return width; };
  float GetHeight() const { return height; };

  void SetWidth(float newWidth) {
    width = newWidth >= (leftMargin + rightMargin) ? newWidth
                                                   : (leftMargin + rightMargin);
  };
  void SetHeight(float newHeight) {
    height = newHeight >= (topMargin + bottomMargin)
                 ? newHeight
                 : (topMargin + bottomMargin);
  };

  float GetLeftMargin() const { return leftMargin; };
  void SetLeftMargin(float newMargin) { leftMargin = newMargin; };

  float GetTopMargin() const { return topMargin; };
  void SetTopMargin(float newMargin) { topMargin = newMargin; };

  float GetRightMargin() const { return rightMargin; };
  void SetRightMargin(float newMargin) { rightMargin = newMargin; };

  float GetBottomMargin() const { return bottomMargin; };
  void SetBottomMargin(float newMargin) { bottomMargin = newMargin; };

  bool IsTiled() const { return tiled; };
  void SetTiled(bool enable = true) { tiled = enable; };

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

  float leftMargin;
  float topMargin;
  float rightMargin;
  float bottomMargin;

  bool tiled;

  std::shared_ptr<SFMLTextureWrapper> texture;
};

class GD_EXTENSION_API RuntimePanelSpriteObject : public RuntimeObject {
 public:
  RuntimePanelSpriteObject(RuntimeScene &scene,
                           const PanelSpriteObject &panelSpriteObject);
  virtual ~RuntimePanelSpriteObject(){};
  virtual std::unique_ptr<RuntimeObject> Clone() const {
    return gd::make_unique<RuntimePanelSpriteObject>(*this);
  }

  virtual bool Draw(sf::RenderTarget &renderTarget);

  virtual float GetWidth() const { return width; };
  virtual float GetHeight() const { return height; };

  virtual inline void SetWidth(float newWidth) {
    width = newWidth >= (leftMargin + rightMargin) ? newWidth
                                                   : (leftMargin + rightMargin);
  };
  virtual inline void SetHeight(float newHeight) {
    height = newHeight >= (topMargin + bottomMargin)
                 ? newHeight
                 : (topMargin + bottomMargin);
  };

  virtual bool SetAngle(float newAngle) {
    angle = newAngle;
    return true;
  };
  virtual float GetAngle() const { return angle; };

  float GetLeftMargin() const { return leftMargin; };
  void SetLeftMargin(float newMargin) { leftMargin = newMargin; };

  float GetTopMargin() const { return topMargin; };
  void SetTopMargin(float newMargin) { topMargin = newMargin; };

  float GetRightMargin() const { return rightMargin; };
  void SetRightMargin(float newMargin) { rightMargin = newMargin; };

  float GetBottomMargin() const { return bottomMargin; };
  void SetBottomMargin(float newMargin) { bottomMargin = newMargin; };

  void ChangeAndReloadImage(const gd::String &texture,
                            const RuntimeScene &scene);

  gd::String textureName;

#if defined(GD_IDE_ONLY)
  virtual void GetPropertyForDebugger(std::size_t propertyNb,
                                      gd::String &name,
                                      gd::String &value) const;
  virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
  virtual std::size_t GetNumberOfProperties() const;
#endif

 private:
  float width;
  float height;

  float leftMargin;
  float topMargin;
  float rightMargin;
  float bottomMargin;

  float angle;

  std::shared_ptr<SFMLTextureWrapper> texture;
};

#endif  // PANELSPRITEOBJECT_H
