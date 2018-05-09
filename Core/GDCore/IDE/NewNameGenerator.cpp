/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "NewNameGenerator.h"
#include "GDCore/String.h"

namespace gd {

gd::String NewNameGenerator::Generate(
    const gd::String &name,
    const gd::String &prefix,
    std::function<bool(const gd::String &)> exists) {
  if (!exists(name)) return name;

  gd::String potentialName = prefix + name;
  for (unsigned int i = 2; exists(potentialName); ++i) {
    potentialName = prefix + name + gd::String::From(i);
  }

  return potentialName;
}

gd::String NewNameGenerator::Generate(
    const gd::String &name, std::function<bool(const gd::String &)> exists) {
  return NewNameGenerator::Generate(name, "", exists);
}

}  // namespace gd
