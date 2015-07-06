/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/KeyboardExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/KeyboardExtension.cpp"
#endif

KeyboardExtension::KeyboardExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsKeyboardExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["KeyPressed"].SetFunctionName("IsKeyPressed").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");
    GetAllConditions()["KeyReleased"].SetFunctionName("WasKeyReleased").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");
    GetAllConditions()["KeyFromTextPressed"].SetFunctionName("IsKeyPressed").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");
    GetAllConditions()["KeyFromTextReleased"].SetFunctionName("WasKeyReleased").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");
    GetAllConditions()["AnyKeyPressed"].SetFunctionName("AnyKeyIsPressed").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");
    GetAllStrExpressions()["LastPressedKey"].SetFunctionName("LastPressedKey").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");
    #endif
}

