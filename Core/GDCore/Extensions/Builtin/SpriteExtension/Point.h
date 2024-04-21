/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_POINT_H
#define GDCORE_POINT_H
#include "GDCore/String.h"

/**
 * \brief Named point used by Sprite.
 *
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Point {
 public:
  Point(const gd::String& name_);
  virtual ~Point(){};

  /**
   * Change point name
   */
  void SetName(const gd::String& name_) { name = name_; }

  /**
   * Get point name
   */
  const gd::String& GetName() const { return name; }

  /**
   * Change point position.
   */
  void SetXY(double x_, double y_) {
    x = x_;
    y = y_;
  }

  /**
   * Change point X position.
   */
  void SetX(double x_) { x = x_; }

  /**
   * Change point Y position.
   */
  void SetY(double y_) { y = y_; }

  /**
   * Get point X position.
   */
  double GetX() const { return x; }

  /**
   * Get point Y position.
   */
  double GetY() const { return y; }

 private:
  gd::String name;
  double x;
  double y;
};

#endif  // GDCORE_POINT_H
