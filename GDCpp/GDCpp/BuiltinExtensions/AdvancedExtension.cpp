/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
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
    GetAllConditions()["Toujours"].codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::LogicalNegation").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    #endif
}

