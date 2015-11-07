/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/KeyboardExtension.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/KeyboardExtension.cpp"
#endif

KeyboardExtension::KeyboardExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsKeyboardExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["KeyPressed"].SetFunctionName("IsKeyPressed").SetIncludeFile("GDCpp/Extensions/Builtin/KeyboardTools.h");
    GetAllConditions()["KeyReleased"].SetFunctionName("WasKeyReleased").SetIncludeFile("GDCpp/Extensions/Builtin/KeyboardTools.h");
    GetAllConditions()["KeyFromTextPressed"].SetFunctionName("IsKeyPressed").SetIncludeFile("GDCpp/Extensions/Builtin/KeyboardTools.h");
    GetAllConditions()["KeyFromTextReleased"].SetFunctionName("WasKeyReleased").SetIncludeFile("GDCpp/Extensions/Builtin/KeyboardTools.h");
    GetAllConditions()["AnyKeyPressed"].SetFunctionName("AnyKeyIsPressed").SetIncludeFile("GDCpp/Extensions/Builtin/KeyboardTools.h");
    GetAllStrExpressions()["LastPressedKey"].SetFunctionName("LastPressedKey").SetIncludeFile("GDCpp/Extensions/Builtin/KeyboardTools.h");
    #endif
}

