/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef COMMONCONVERSIONSEXTENSION_H
#define COMMONCONVERSIONSEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing common functions for conversion between
 * types.
 *
 * \ingroup BuiltinExtensions
 */
class CommonConversionsExtension : public gd::PlatformExtension {
 public:
  CommonConversionsExtension();
  virtual ~CommonConversionsExtension(){};
};

}  // namespace gdjs
#endif  // COMMONCONVERSIONSEXTENSION_H
