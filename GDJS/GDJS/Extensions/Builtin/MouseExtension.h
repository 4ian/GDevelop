/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef MOUSEEXTENSION_H
#define MOUSEEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing functions related the mouse
 *
 * \ingroup BuiltinExtensions
 */
class MouseExtension : public gd::PlatformExtension {
 public:
  MouseExtension();
  virtual ~MouseExtension(){};
};

}  // namespace gdjs
#endif  // MOUSEEXTENSION_H
