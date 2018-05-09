/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EXTERNALLAYOUTSEXTENSION_H
#define EXTERNALLAYOUTSEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing features related to external layouts.
 *
 * \ingroup BuiltinExtensions
 */
class ExternalLayoutsExtension : public gd::PlatformExtension {
 public:
  ExternalLayoutsExtension();
  virtual ~ExternalLayoutsExtension(){};
};

}  // namespace gdjs
#endif  // EXTERNALLAYOUTSEXTENSION_H
