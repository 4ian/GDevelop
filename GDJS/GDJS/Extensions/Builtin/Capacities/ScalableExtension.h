/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing Scalable object capacity.
 *
 * \ingroup BuiltinExtensions
 */
class ScalableExtension : public gd::PlatformExtension {
 public:
  ScalableExtension();
  virtual ~ScalableExtension(){};
};

}  // namespace gdjs
