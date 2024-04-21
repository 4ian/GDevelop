/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing Animatable object capacity.
 *
 * \ingroup BuiltinExtensions
 */
class AnimatableExtension : public gd::PlatformExtension {
 public:
  AnimatableExtension();
  virtual ~AnimatableExtension(){};
};

}  // namespace gdjs
