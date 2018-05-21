/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef NETWORKEXTENSION_H
#define NETWORKEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing functions related to networking.
 *
 * \ingroup BuiltinExtensions
 */
class NetworkExtension : public gd::PlatformExtension {
 public:
  NetworkExtension();
  virtual ~NetworkExtension(){};
};

}  // namespace gdjs
#endif  // NETWORKEXTENSION_H
