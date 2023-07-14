/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef SPRITE_H
#define SPRITE_H
#include <memory>

#include "GDCore/Extensions/Builtin/SpriteExtension/Point.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Polygon2d.h"
#include "GDCore/String.h"
#undef LoadImage  // prevent windows.h to be polluting everything

namespace gd {

/**
 * \brief Represents a sprite to be displayed on the screen.
 *
 * \see Direction
 * \see SpriteObject
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Sprite {
 public:
  Sprite();
  virtual ~Sprite();

  /**
   * \brief Change the name of the sprite image.
   */
  inline void SetImageName(const gd::String& image_) { image = image_; }

  /**
   * \brief Get the name of the sprite image.
   */
  inline const gd::String& GetImageName() const { return image; }

  /**
   * \brief Get the name of the sprite image.
   */
  inline gd::String& GetImageName() { return image; }

  /**
   * \brief Get the collision mask (custom or automatically generated owing to
   * IsFullImageCollisionMask())
   *
   * \warning If the image has not been loaded ( using LoadImage ) and the
   * collision mask is set as automatic, the returned mask won't be correct.
   */
  std::vector<Polygon2d> GetCollisionMask() const;

  /**
   * \brief Get the custom collision mask.
   */
  std::vector<Polygon2d>& GetCustomCollisionMask() {
    return customCollisionMask;
  };

  /**
   * \brief Get the custom collision mask.
   */
  const std::vector<Polygon2d>& GetCustomCollisionMask() const {
    return customCollisionMask;
  };

  /**
   * \brief Set the custom collision mask.
   * Call then `SetFullImageCollisionMask(false)` to use it.
   */
  void SetCustomCollisionMask(const std::vector<Polygon2d>& collisionMask);

  /**
   * \brief Return true if the collision mask is a bounding box, false if a
   * custom collision mask is used.
   */
  inline bool IsFullImageCollisionMask() const {
    return fullImageCollisionMask;
  }

  /**
   * \brief Un/set use of the custom collision mask.
   */
  inline void SetFullImageCollisionMask(bool enabled) {
    fullImageCollisionMask = enabled;
  };

  /**
   * \brief Return all points, excluding origin and center.
   */
  inline std::vector<Point>& GetAllNonDefaultPoints() { return points; }

  /**
   * \brief Return all points, excluding origin and center.
   */
  inline const std::vector<Point>& GetAllNonDefaultPoints() const {
    return points;
  }

  /**
   * \brief Add a point
   */
  void AddPoint(const Point& point);

  /**
   * \brief Delete a point
   */
  void DelPoint(const gd::String& name);

  /**
   * \brief Get the specified point.
   */
  const Point& GetPoint(const gd::String& name) const;

  /**
   * \brief Get the specified point.
   */
  Point& GetPoint(const gd::String& name);

  /**
   * \brief Return true if the point exists.
   */
  bool HasPoint(const gd::String& name) const;

  /**
   * \brief Return Origin point.
   */
  inline const Point& GetOrigin() const { return origine; }

  /**
   * \brief Return Origin point.
   */
  inline Point& GetOrigin() { return origine; }

  /**
   * \brief Return Center point.
   *
   * \warning If the image has not been loaded (using LoadImage) and the center
   * point is set as automatic, the returned point won't be correct.
   */
  inline const Point& GetCenter() const { return centre; }

  /**
   * \brief Return Center point.
   *
   * \warning If the image has not been loaded (using LoadImage) and the center
   * point is set as automatic, the returned point won't be correct.
   */
  inline Point& GetCenter() { return centre; }

  /**
   * \brief Return true if the center point is automatically computed.
   */
  inline bool IsDefaultCenterPoint() const { return automaticCentre; }

  /**
   * \brief Un/set center as being automatically computed.
   */
  bool SetDefaultCenterPoint(bool enabled);

 private:
  gd::String image;  ///< Name of the image to be loaded in Image Manager.

  bool fullImageCollisionMask;  ///< True to use a bounding box wrapping the
                                ///< whole image as collision mask. If false,
                                ///< custom collision mask is used.
  std::vector<Polygon2d> customCollisionMask;  ///< Custom collision mask

  std::vector<Point> points;  ///< List of the points used by the sprite
  Point origine;              ///< Origin point
  Point centre;               ///< Center point
  bool automaticCentre;       ///< True to let the sprite compute its center

  static Point
      badPoint;  ///< Returned when no other valid Point object is available.
};

}  // namespace gd
#endif  // SPRITE_H
