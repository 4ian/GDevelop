/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <iostream>
#include "GDCore/String.h"

namespace gd {

void GD_CORE_API LogWarning(const gd::String& msg) {
  std::cout << "WARNING: " << msg << std::endl;
}

void GD_CORE_API LogError(const gd::String& msg) {
  std::cout << "ERROR: " << msg << std::endl;
}

void GD_CORE_API LogFatalError(const gd::String& msg) {
  std::cout << "FATAL ERROR: " << msg << std::endl;
}

void GD_CORE_API LogMessage(const gd::String& msg) {
  std::cout << "MESSAGE: " << msg << std::endl;
}

void GD_CORE_API LogStatus(const gd::String& msg) {
  std::cout << "STATUS: " << msg << std::endl;
}

}  // namespace gd
