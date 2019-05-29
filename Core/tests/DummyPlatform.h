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

/**
 * Setup the platform with:
 * - A base object
 * - An extension providing:
 *   - An action (MyExtension::DoSomething).
 *   - Some expressions (GetNumber, GetVariableAsNumber, ToString, MouseX,
 * GetGlobalVariableAsNumber, GetNumberWith2Params, GetNumberWith3Params),
 *   - A sprite object (MyExtension::BuiltinObject) with:
 *      - Expressions (GetObjectVariableAsNumber, GetObjectNumber,
 * GetObjectStringWith1Param, GetObjectStringWith3Param,
 * GetObjectStringWith2ObjectParam,)
 */
void SetupProjectWithDummyPlatform(gd::Project &project,
                                   gd::Platform &platform);

#endif
