/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
#include "GDCpp/BuiltinExtensions/KeyboardTools.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/RuntimeScene.h"

using namespace std;

bool GD_API IsKeyPressed(RuntimeScene & scene, std::string key)
{
    return scene.GetInputManager().IsKeyPressed(key);
}

bool GD_API WasKeyReleased(RuntimeScene & scene, std::string key)
{
    return scene.GetInputManager().WasKeyReleased(key);
}

bool GD_API AnyKeyIsPressed(RuntimeScene & scene)
{
    return scene.GetInputManager().AnyKeyIsPressed();
}

std::string GD_API LastPressedKey(RuntimeScene & scene)
{
    return scene.GetInputManager().GetLastPressedKey();
}
