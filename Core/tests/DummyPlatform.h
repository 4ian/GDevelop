/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef DUMMY_PLATFORM
#define DUMMY_PLATFORM

namespace gd {
class Project;
class Platform;
}  // namespace gd

void SetupProjectWithDummyPlatform(gd::Project &project,
                                   gd::Platform &platform);

#endif