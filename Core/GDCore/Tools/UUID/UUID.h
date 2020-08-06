/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_TOOLS_UUID_UUID_H
#define GDCORE_TOOLS_UUID_UUID_H

#include "GDCore/String.h"
#include "sole.h"

namespace gd {
namespace UUID {

/**
 * Generate a random UUID v4
 */
inline gd::String MakeUuid4() { return gd::String::From(sole::uuid4()); }

}  // namespace UUID
}  // namespace gd

#endif
