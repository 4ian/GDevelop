/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"

#include <iostream>

#include "GDCore/Extensions/Builtin/SpriteExtension/Polygon2d.h"

using namespace std;

namespace gd {

Point Sprite::badPoint("");

Sprite::Sprite()
    : hasCustomSourceRect(false),
      sourceRectX(0),
      sourceRectY(0),
      sourceRectWidth(0),
      sourceRectHeight(0),
      fullImageCollisionMask(false),
      origine("origine"),
      centre("centre"),
      automaticCentre(true) {}

Sprite::~Sprite(){};

void Sprite::AddPoint(const Point& point) {
  if (!HasPoint(point.GetName())) points.push_back(point);
}

void Sprite::DelPoint(const gd::String& name) {
  for (std::size_t i = 0; i < points.size(); ++i) {
    if (name == points[i].GetName()) points.erase(points.begin() + i);
  }
}

bool Sprite::HasPoint(const gd::String& name) const {
  if (name == "Origin") return true;
  if (name == "Centre" || name == "Center") return true;

  for (std::size_t i = 0; i < points.size(); ++i) {
    if (name == points[i].GetName()) return true;
  }

  return false;
}

const Point& Sprite::GetPoint(const gd::String& name) const {
  if (name == "Origin") return origine;
  if (name == "Centre" || name == "Center") return centre;

  for (std::size_t i = 0; i < points.size(); ++i) {
    if (name == points[i].GetName()) return points[i];
  }

  return badPoint;
}

Point& Sprite::GetPoint(const gd::String& name) {
  if (name == "Origin") return origine;
  if (name == "Centre" || name == "Center") return centre;

  for (std::size_t i = 0; i < points.size(); ++i) {
    if (name == points[i].GetName()) return points[i];
  }

  return badPoint;
}

bool Sprite::SetDefaultCenterPoint(bool enabled) {
  automaticCentre = enabled;
  return true;
}

void Sprite::SetCustomSourceRect(double x,
                                 double y,
                                 double width,
                                 double height) {
  hasCustomSourceRect = true;
  sourceRectX = x;
  sourceRectY = y;
  sourceRectWidth = width;
  sourceRectHeight = height;
}

void Sprite::ClearCustomSourceRect() {
  hasCustomSourceRect = false;
  sourceRectX = 0;
  sourceRectY = 0;
  sourceRectWidth = 0;
  sourceRectHeight = 0;
}

std::vector<Polygon2d> Sprite::GetCollisionMask() const {
  return customCollisionMask;
}

void Sprite::SetCustomCollisionMask(
    const std::vector<Polygon2d>& collisionMask) {
  customCollisionMask = collisionMask;
}

}  // namespace gd
