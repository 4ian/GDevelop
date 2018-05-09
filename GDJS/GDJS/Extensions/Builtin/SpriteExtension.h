/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef SPRITEEXTENSION_H
#define SPRITEEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class SpriteExtension : public gd::PlatformExtension {
 public:
  SpriteExtension();
  virtual ~SpriteExtension(){};
};

}  // namespace gdjs
#endif  // SPRITEEXTENSION_H
