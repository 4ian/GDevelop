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

  inline void SetOutlineSize(float size) { outlineSize = size; };
  inline float GetOutlineSize() const { return outlineSize; };

  void SetOutlineOpacity(float val);
  inline float GetOutlineOpacity() const { return outlineOpacity; };

  void SetOutlineColor(unsigned int r, unsigned int v, unsigned int b);
  inline unsigned int GetOutlineColorR() const { return outlineColorR; };
  inline unsigned int GetOutlineColorG() const { return outlineColorG; };
  inline unsigned int GetOutlineColorB() const { return outlineColorB; };

  /** Used by GD events generated code : Prefer using original SetOutlineColor
   */
  void SetOutlineColor(const gd::String& color);

  void SetFillOpacity(float val);
  inline float GetFillOpacity() const { return fillOpacity; };

  void SetFillColor(unsigned int r, unsigned int v, unsigned int b);
  inline unsigned int GetFillColorR() const { return fillColorR; };
  inline unsigned int GetFillColorG() const { return fillColorG; };
  inline unsigned int GetFillColorB() const { return fillColorB; };

  /** Used by GD events generated code : Prefer using original SetFillColor
   */
  void SetFillColor(const gd::String& color);

  inline void SetCoordinatesAbsolute() { absoluteCoordinates = true; }
  inline void SetCoordinatesRelative() { absoluteCoordinates = false; }
  inline bool AreCoordinatesAbsolute() { return absoluteCoordinates; }

  inline void SetClearBetweenFrames(bool value) { clearBetweenFrames = value; }
  inline bool IsClearedBetweenFrames() { return clearBetweenFrames; }

 protected:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
#if defined(GD_IDE_ONLY)
  virtual void DoSerializeTo(gd::SerializerElement& element) const;
#endif

 private:
  // Fill color
  unsigned int fillColorR;
  unsigned int fillColorG;
  unsigned int fillColorB;
  float fillOpacity;

  // Outline
  int outlineSize;
  unsigned int outlineColorR;
  unsigned int outlineColorG;
  unsigned int outlineColorB;
  float outlineOpacity;

  bool absoluteCoordinates;
  bool clearBetweenFrames;
};

/**
 * \brief The Shape Painter object used for storage and by the IDE.
 */
class GD_EXTENSION_API ShapePainterObject : public gd::ObjectConfiguration,
                                            public ShapePainterObjectBase {
 public:
  ShapePainterObject();
  virtual ~ShapePainterObject(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
    return gd::make_unique<ShapePainterObject>(*this);
  }

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
#if defined(GD_IDE_ONLY)
  virtual void DoSerializeTo(gd::SerializerElement& element) const;

#endif
};

#endif  // SHAPEPAINTEROBJECT_H
