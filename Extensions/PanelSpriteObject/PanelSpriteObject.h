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
}  // namespace gd

/**
 * PanelSprite Object
 */
class GD_EXTENSION_API PanelSpriteObject : public gd::ObjectConfiguration {
 public:
  PanelSpriteObject();
  virtual ~PanelSpriteObject();
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return std::unique_ptr<gd::ObjectConfiguration>(
        new PanelSpriteObject(*this));
  }

  virtual void ExposeResources(gd::ArbitraryResourceWorker &worker) override;

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties()
      const override;

  virtual bool UpdateProperty(const gd::String& name,
                              const gd::String& value) override;

  double GetWidth() const { return width; };
  double GetHeight() const { return height; };

  void SetWidth(double newWidth) {
    width = newWidth >= (leftMargin + rightMargin) ? newWidth
                                                   : (leftMargin + rightMargin);
  };
  void SetHeight(double newHeight) {
    height = newHeight >= (topMargin + bottomMargin)
                 ? newHeight
                 : (topMargin + bottomMargin);
  };

  double GetLeftMargin() const { return leftMargin; };
  void SetLeftMargin(double newMargin) { leftMargin = newMargin; };

  double GetTopMargin() const { return topMargin; };
  void SetTopMargin(double newMargin) { topMargin = newMargin; };

  double GetRightMargin() const { return rightMargin; };
  void SetRightMargin(double newMargin) { rightMargin = newMargin; };

  double GetBottomMargin() const { return bottomMargin; };
  void SetBottomMargin(double newMargin) { bottomMargin = newMargin; };

  bool IsTiled() const { return tiled; };
  void SetTiled(bool enable = true) { tiled = enable; };

  void SetTexture(const gd::String &newTextureName) {
    textureName = newTextureName;
  };
  const gd::String &GetTexture() const { return textureName; };

 private:
  virtual void DoUnserializeFrom(gd::Project &project,
                                 const gd::SerializerElement &element) override;
#if defined(GD_IDE_ONLY)
  virtual void DoSerializeTo(gd::SerializerElement &element) const override;
#endif

  gd::String textureName;

  double width;
  double height;

  double leftMargin;
  double topMargin;
  double rightMargin;
  double bottomMargin;

  bool tiled;
};

#endif  // PANELSPRITEOBJECT_H
