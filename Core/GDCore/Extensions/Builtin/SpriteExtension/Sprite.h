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
 * \brief Represents a sprite (also called "frame" in this context) to be displayed on the screen.
 *
 * A sprite can display either:
 * - A standalone image (using `image` field)
 * - A frame from a spritesheet (using `spritesheetResourceName` and `spritesheetFrameName`)
 *
 * When using a spritesheet, the `image` field should be empty, and the texture
 * will be read from the spritesheet's frame data.
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
   * \note When using a spritesheet, this should be empty.
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
   * \brief Set the spritesheet resource name for this frame.
   * \note When set, the frame texture will be read from the spritesheet.
   */
  inline void SetSpritesheetResourceName(const gd::String& resourceName) {
    spritesheetResourceName = resourceName;
  }

  /**
   * \brief Get the spritesheet resource name for this frame.
   * \return The spritesheet resource name, or empty string if not using a spritesheet.
   */
  inline const gd::String& GetSpritesheetResourceName() const {
    return spritesheetResourceName;
  }

  /**
   * \brief Set the frame name within the spritesheet.
   * \note This corresponds to a key in the "frames" object of the spritesheet JSON.
   */
  inline void SetSpritesheetFrameName(const gd::String& frameName) {
    spritesheetFrameName = frameName;
  }

  /**
   * \brief Get the frame name within the spritesheet.
   * \return The frame name within the spritesheet, or empty string if not using a spritesheet.
   */
  inline const gd::String& GetSpritesheetFrameName() const {
    return spritesheetFrameName;
  }

  /**
   * \brief Check if this sprite uses a spritesheet frame.
   * \return true if using a spritesheet frame, false if using a standalone image.
   */
  inline bool UsesSpritesheetFrame() const {
    return !spritesheetResourceName.empty() && !spritesheetFrameName.empty();
  }

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

  gd::String spritesheetResourceName;  ///< Name of the spritesheet resource (optional).
  gd::String spritesheetFrameName;     ///< Frame name within the spritesheet (key in "frames" object inside the spritesheet JSON).

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
