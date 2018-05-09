/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef STRINGINSTRUCTIONSEXTENSION_H
#define STRINGINSTRUCTIONSEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing common functions for strings.
 *
 * \ingroup BuiltinExtensions
 */
class StringInstructionsExtension : public gd::PlatformExtension {
 public:
  StringInstructionsExtension();
  virtual ~StringInstructionsExtension(){};
};

}  // namespace gdjs
#endif  // STRINGINSTRUCTIONSEXTENSION_H
