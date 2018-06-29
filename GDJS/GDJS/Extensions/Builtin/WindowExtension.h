/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef WINDOWEXTENSION_H
#define WINDOWEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing common functions related to the
 * window/canvas.
 *
 * \ingroup BuiltinExtensions
 */
class WindowExtension : public gd::PlatformExtension {
 public:
  WindowExtension();
  virtual ~WindowExtension(){};
};

}  // namespace gdjs
#endif  // WINDOWEXTENSION_H
