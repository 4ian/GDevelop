/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef TIMEEXTENSION_H
#define TIMEEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing functions related to time management
 *
 * \ingroup BuiltinExtensions
 */
class TimeExtension : public gd::PlatformExtension {
 public:
  TimeExtension();
  virtual ~TimeExtension(){};
};

}  // namespace gdjs
#endif  // TIMEEXTENSION_H
