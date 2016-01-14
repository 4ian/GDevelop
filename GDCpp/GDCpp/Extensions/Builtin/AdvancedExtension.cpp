/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/Extensions/Builtin/AdvancedExtension.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/AdvancedExtension.cpp"
#endif

AdvancedExtension::AdvancedExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsAdvancedExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["Toujours"].SetFunctionName("GDpriv::CommonInstructions::LogicalNegation").SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
    #endif
}

