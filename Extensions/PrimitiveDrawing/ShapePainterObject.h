/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SHAPEPAINTEROBJECT_H
#define SHAPEPAINTEROBJECT_H
#include <vector>

#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class Object;
class InitialInstance;
class Project;
}  // namespace gd

/**
 * \brief Base object storing the setup of a shape painter object.
 * \todo This is useless (now that GDCpp is removed). It should be merged
 * with ShapePainterObject.
 */
class GD_EXTENSION_API ShapePainterObjectBase {
 public:
  ShapePainterObjectBase();
  virtual ~ShapePainterObjectBase(){};

  inline void SetOutlineSize(double size) { outlineSize = size; };
  inline double GetOutlineSize() const { return outlineSize; };

  void SetOutlineOpacity(double val);
  inline double GetOutlineOpacity() const { return outlineOpacity; };

  void SetOutlineColor(const gd::String& color) { outlineColor = color; };
  const gd::String& GetOutlineColor() const { return outlineColor; };

  void SetFillOpacity(double val);
  inline double GetFillOpacity() const { return fillOpacity; };

  void SetFillColor(const gd::String& color) { fillColor = color; };
  const gd::String& GetFillColor() const { return fillColor; };

  inline void SetCoordinatesAbsolute() { absoluteCoordinates = true; }
  inline void SetCoordinatesRelative() { absoluteCoordinates = false; }
  inline bool AreCoordinatesAbsolute() const { return absoluteCoordinates; }

  inline void SetClearBetweenFrames(bool value) { clearBetweenFrames = value; }
  inline bool IsClearedBetweenFrames() const { return clearBetweenFrames; }

  inline const gd::String& GetAntialiasing() const { return antialiasing; }
  inline void SetAntialiasing(const gd::String& value) { antialiasing = value; }

 protected:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
  virtual void DoSerializeTo(gd::SerializerElement& element) const;

 private:
  // Fill color
  gd::String fillColor;
  float fillOpacity;

  // Outline
  int outlineSize;
  gd::String outlineColor;
  float outlineOpacity;

  bool absoluteCoordinates;
  bool clearBetweenFrames;

  // Antialiasing
  gd::String antialiasing;
};

/**
 * \brief The Shape Painter object used for storage and by the IDE.
 */
class GD_EXTENSION_API ShapePainterObject : public gd::ObjectConfiguration,
                                            public ShapePainterObjectBase {
 public:
  ShapePainterObject();
  virtual ~ShapePainterObject(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return gd::make_unique<ShapePainterObject>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor>
  GetProperties() const override;

  virtual bool UpdateProperty(const gd::String &name,
                              const gd::String &value) override;

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element) override;
  virtual void DoSerializeTo(gd::SerializerElement& element) const override;
};

#endif  // SHAPEPAINTEROBJECT_H
