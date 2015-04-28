/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCpp/BuiltinExtensions/AdvancedExtension.h"
#include "GDCpp/ExtensionBase.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/AdvancedExtension.cpp"
#endif

AdvancedExtension::AdvancedExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsAdvancedExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["Toujours"].SetFunctionName("GDpriv::CommonInstructions::LogicalNegation").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    #endif
}

