/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef SCENEEXTENSION_H
#define SCENEEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing common functions.
 *
 * \ingroup BuiltinExtensions
 */
class SceneExtension : public gd::PlatformExtension {
 public:
  SceneExtension();
  virtual ~SceneExtension(){};
};

}  // namespace gdjs
#endif  // SCENEEXTENSION_H
