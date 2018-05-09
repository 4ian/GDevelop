/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef CAMERAEXTENSION_H
#define CAMERAEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class CameraExtension : public gd::PlatformExtension {
 public:
  CameraExtension();
  virtual ~CameraExtension(){};
};

}  // namespace gdjs
#endif  // CAMERAEXTENSION_H
