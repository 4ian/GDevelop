/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef PARAMETEROPTIONS_H
#define PARAMETEROPTIONS_H
#include "GDCore/String.h"
#include "ParameterMetadata.h"

namespace gd {}  // namespace gd

namespace gd {
struct GD_CORE_API ParameterOptions {
  gd::String description;
  gd::String typeExtraInfo;

  ParameterOptions &SetDescription(const gd::String &description_) {
    description = description_;
    return *this;
  }
  ParameterOptions &SetTypeExtraInfo(const gd::String &typeExtraInfo_) {
    typeExtraInfo = typeExtraInfo_;
    return *this;
  }

  static ParameterOptions MakeNewOptions() {
    ParameterOptions emptyOptions;
    return emptyOptions;
  }
};
}

#endif  // PARAMETEROPTIONS_H
