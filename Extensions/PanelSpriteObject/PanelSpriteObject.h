/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/

#ifndef PANELSPRITEOBJECT_H
#define PANELSPRITEOBJECT_H
#include <memory>
#include "GDCore/Project/Object.h"
namespace gd {
class ObjectConfiguration;
class InitialInstance;
class Project;
}

/**
 * PanelSprite Object
 */
class GD_EXTENSION_API PanelSpriteObject : public gd::ObjectConfiguration {
 public:
  PanelSpriteObject();
  virtual ~PanelSpriteObject();
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
    return std::unique_ptr<gd::ObjectConfiguration>(new PanelSpriteObject(*this));
  }

#if defined(GD_IDE_ONLY)
  virtual void ExposeResources(gd::ArbitraryResourceWorker &worker,
                               gd::ResourcesManager *resourcesManager);
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
};

#endif  // PANELSPRITEOBJECT_H
