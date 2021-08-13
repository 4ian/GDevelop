/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Tools/VersionPriv.h"

namespace gd {

int VersionWrapper::Major() {
  return gd::String(GD_VERSION_STRING).Split(U'-')[0].Split(U'.')[0].To<int>();
}
int VersionWrapper::Minor() {
  return gd::String(GD_VERSION_STRING).Split(U'-')[0].Split(U'.')[1].To<int>();
}
int VersionWrapper::Build() {
  return gd::String(GD_VERSION_STRING).Split(U'-')[0].Split(U'.')[2].To<int>();
}
int VersionWrapper::Revision() {
  return gd::String(GD_VERSION_STRING).Split(U'-').size() > 1
             ? gd::String(GD_VERSION_STRING).Split(U'-')[1].To<int>()
             : 0;
}
gd::String VersionWrapper::FullString() { return GD_VERSION_STRING; }
gd::String VersionWrapper::Date() {
  return gd::String(GD_DATE_STRING).substr(4, 2);
}
gd::String VersionWrapper::Month() {
  return gd::String(GD_DATE_STRING).substr(0, 3);
}
gd::String VersionWrapper::Year() {
  return gd::String(GD_DATE_STRING).substr(7, 4);
}
gd::String VersionWrapper::Status() {
  return Revision() == 0 ? "Release" : "Dev";
}

bool VersionWrapper::IsOlder(int major,
                             int minor,
                             int build,
                             int revision,
                             int major2,
                             int minor2,
                             int build2,
                             int revision2) {
  return (major < major2) || (major == major2 && minor < minor2) ||
         (major == major2 && minor == minor2 && build < build2) ||
         (major == major2 && minor == minor2 && build == build2 &&
          revision < revision2);
}

bool VersionWrapper::IsOlderOrEqual(int major,
                                    int minor,
                                    int build,
                                    int revision,
                                    int major2,
                                    int minor2,
                                    int build2,
                                    int revision2) {
  return (major == major2 && minor == minor2 && build == build2 &&
          revision == revision2) ||
         IsOlder(
             major, minor, build, revision, major2, minor2, build2, revision2);
}

}  // namespace gd
