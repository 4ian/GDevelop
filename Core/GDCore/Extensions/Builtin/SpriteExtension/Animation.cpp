/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include <vector>
#include "GDCore/String.h"

namespace gd {

Direction Animation::badDirection;

Animation::Animation() : useMultipleDirections(false) {}

Animation::~Animation() {}

std::size_t Animation::GetDirectionsCount() const { return directions.size(); };

bool Animation::HasNoDirections() const { return directions.empty(); };

void Animation::SetDirectionsCount(std::size_t nb) {
  while (directions.size() < nb) {
    Direction direction;
    directions.push_back(direction);
  }
  while (directions.size() > nb)
    directions.erase(directions.begin() + directions.size() - 1);
}

const Direction& Animation::GetDirection(std::size_t nb) const {
  if (!useMultipleDirections) nb = 0;

  if (nb < directions.size()) return directions[nb];

  return badDirection;
}

Direction& Animation::GetDirection(std::size_t nb) {
  if (!useMultipleDirections) nb = 0;

  if (nb < directions.size()) return directions[nb];

  return badDirection;
}

void Animation::SetDirection(const Direction& direction, std::size_t nb) {
  if (nb < directions.size()) directions[nb] = direction;

  return;
}

}  // namespace gd
