/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Extensions/Builtin/JoystickExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/JoystickExtension.cpp"
#endif

JoystickExtension::JoystickExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsJoystickExtension(*this);


    #if defined(GD_IDE_ONLY)
    GetAllConditions()["JoystickButtonDown"].SetFunctionName("JoystickButtonDown").SetIncludeFile("GDCpp/Extensions/Builtin/JoystickTools.h");
    GetAllConditions()["JoystickAxis"].SetFunctionName("GetJoystickAxisValue").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/JoystickTools.h");

    GetAllActions()["GetJoystickAxis"].SetFunctionName("JoystickAxisValueToVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/JoystickTools.h");

    GetAllExpressions()["GetJoystickAxis"].SetFunctionName("GetJoystickAxisValue").SetIncludeFile("GDCpp/Extensions/Builtin/JoystickTools.h");
    #endif
}

