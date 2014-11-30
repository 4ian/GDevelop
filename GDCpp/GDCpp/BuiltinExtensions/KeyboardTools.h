/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef KEYBOARDTOOLS_H
#define KEYBOARDTOOLS_H
#include <string>

class RuntimeScene;

bool IsKeyPressed(RuntimeScene & scene, std::string key);
bool AnyKeyIsPressed(RuntimeScene & scene);

#endif // KEYBOARDTOOLS_H
