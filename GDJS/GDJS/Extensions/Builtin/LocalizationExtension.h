/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef LOCALIZATIONEXTENSION_H
#define LOCALIZATIONEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing functions related to the game locale.
 *
 * \ingroup BuiltinExtensions
 */
class LocalizationExtension : public gd::PlatformExtension {
 public:
  LocalizationExtension();
  virtual ~LocalizationExtension(){};
};

}  // namespace gdjs
#endif  // LOCALIZATIONEXTENSION_H
