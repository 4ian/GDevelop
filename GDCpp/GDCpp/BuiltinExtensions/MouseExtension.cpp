/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/MouseExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/MouseExtension.cpp"
#endif

MouseExtension::MouseExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsMouseExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["CentreSourisX"].SetFunctionName("CenterCursorHorizontally").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["CentreSourisY"].SetFunctionName("CenterCursorVertically").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["CacheSouris"].SetFunctionName("HideCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["MontreSouris"].SetFunctionName("ShowCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["SetSourisXY"].SetFunctionName("SetCursorPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["CentreSouris"].SetFunctionName("CenterCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    GetAllConditions()["SourisX"].SetFunctionName("GetCursorXPosition").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllConditions()["SourisY"].SetFunctionName("GetCursorYPosition").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllConditions()["SourisBouton"].SetFunctionName("MouseButtonPressed").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    GetAllConditions()["SourisSurObjet"].SetFunctionName("CursorOnObject").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    GetAllExpressions()["MouseX"].SetFunctionName("GetCursorXPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["SourisX"].SetFunctionName("GetCursorXPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["MouseY"].SetFunctionName("GetCursorYPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["SourisY"].SetFunctionName("GetCursorYPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["MouseWheelDelta"].SetFunctionName("GetMouseWheelDelta").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    StripUnimplementedInstructionsAndExpressions(); //Touch support is not implemented
    #endif
}

