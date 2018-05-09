/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef FILEEXTENSION_H
#define FILEEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs {

/**
 * \brief Built-in extension providing functions for storing data.
 *
 * \ingroup BuiltinExtensions
 */
class FileExtension : public gd::PlatformExtension {
 public:
  FileExtension();
  virtual ~FileExtension(){};
};

}  // namespace gdjs
#endif  // FILEEXTENSION_H
