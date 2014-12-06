/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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

    GetAllActions()["CentreSourisX"].codeExtraInformation.SetFunctionName("CenterCursorHorizontally").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["CentreSourisY"].codeExtraInformation.SetFunctionName("CenterCursorVertically").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["CacheSouris"].codeExtraInformation.SetFunctionName("HideCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["MontreSouris"].codeExtraInformation.SetFunctionName("ShowCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["SetSourisXY"].codeExtraInformation.SetFunctionName("SetCursorPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllActions()["CentreSouris"].codeExtraInformation.SetFunctionName("CenterCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    GetAllConditions()["SourisX"].codeExtraInformation.SetFunctionName("GetCursorXPosition").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllConditions()["SourisY"].codeExtraInformation.SetFunctionName("GetCursorYPosition").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllConditions()["SourisBouton"].codeExtraInformation.SetFunctionName("MouseButtonPressed").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    GetAllExpressions()["MouseX"].codeExtraInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["SourisX"].codeExtraInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["MouseY"].codeExtraInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["SourisY"].codeExtraInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    GetAllExpressions()["MouseWheelDelta"].codeExtraInformation.SetFunctionName("GetMouseWheelDelta").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
    #endif
}

