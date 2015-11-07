/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
#include "GDCpp/Extensions/Builtin/KeyboardTools.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/RuntimeScene.h"

using namespace std;

bool GD_API IsKeyPressed(RuntimeScene & scene, gd::String key)
{
    return scene.GetInputManager().IsKeyPressed(key);
}

bool GD_API WasKeyReleased(RuntimeScene & scene, gd::String key)
{
    return scene.GetInputManager().WasKeyReleased(key);
}

bool GD_API AnyKeyIsPressed(RuntimeScene & scene)
{
    return scene.GetInputManager().AnyKeyIsPressed();
}

gd::String GD_API LastPressedKey(RuntimeScene & scene)
{
    return scene.GetInputManager().GetLastPressedKey();
}
