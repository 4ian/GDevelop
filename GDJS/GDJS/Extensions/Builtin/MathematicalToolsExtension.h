/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef MATHEMATICALTOOLSEXTENSION_H
#define MATHEMATICALTOOLSEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing common functions.
 *
 * \ingroup BuiltinExtensions
 */
class MathematicalToolsExtension : public gd::PlatformExtension {
 public:
  MathematicalToolsExtension();
  virtual ~MathematicalToolsExtension(){};
};

}  // namespace gdjs
#endif  // MATHEMATICALTOOLSEXTENSION_H
