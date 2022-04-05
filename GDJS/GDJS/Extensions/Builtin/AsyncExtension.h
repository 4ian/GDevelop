/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef ASYNCEXTENSION_H
#define ASYNCEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing async functionality.
 *
 * \ingroup BuiltinExtensions
 */
class AsyncExtension : public gd::PlatformExtension {
public:
  AsyncExtension();
  virtual ~AsyncExtension(){};
};

} // namespace gdjs
#endif // ASYNCEXTENSION_H
