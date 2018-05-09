/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef ADVANCEDEXTENSION_H
#define ADVANCEDEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing "Always" condition.
 *
 * \ingroup BuiltinExtensions
 */
class AdvancedExtension : public gd::PlatformExtension {
 public:
  AdvancedExtension();
  virtual ~AdvancedExtension(){};
};

}  // namespace gdjs
#endif  // ADVANCEDEXTENSION_H
