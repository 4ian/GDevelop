/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef KEYBOARDTOOLS_H
#define KEYBOARDTOOLS_H

#include <map>
#include <string>
#include "GDCpp/String.h"

class RuntimeScene;

bool IsKeyPressed(RuntimeScene & scene, gd::String key);
bool WasKeyReleased(RuntimeScene & scene, gd::String key);
bool AnyKeyIsPressed(RuntimeScene & scene);
gd::String LastPressedKey(RuntimeScene & scene);

#endif // KEYBOARDTOOLS_H
