/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "GDCpp/BuiltinExtensions/JoystickExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/JoystickExtension.cpp"
#endif

JoystickExtension::JoystickExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsJoystickExtension(*this);


    #if defined(GD_IDE_ONLY)
    GetAllConditions()["JoystickButtonDown"].codeExtraInformation.SetFunctionName("JoystickButtonDown").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");
    GetAllConditions()["JoystickAxis"].codeExtraInformation.SetFunctionName("GetJoystickAxisValue").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");

    GetAllActions()["GetJoystickAxis"].codeExtraInformation.SetFunctionName("JoystickAxisValueToVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");

    GetAllExpressions()["GetJoystickAxis"].codeExtraInformation.SetFunctionName("GetJoystickAxisValue").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");
    #endif
}

