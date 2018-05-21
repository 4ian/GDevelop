/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef BASEOBJECTEXTENSION_H
#define BASEOBJECTEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing functions for all objects
 *
 * \ingroup BuiltinExtensions
 */
class BaseObjectExtension : public gd::PlatformExtension {
 public:
  BaseObjectExtension();
  virtual ~BaseObjectExtension(){};
};

}  // namespace gdjs
#endif  // BASEOBJECTEXTENSION_H
