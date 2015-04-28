#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCpp/BuiltinExtensions/CommonConversionsExtension.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/CommonConversionsExtension.cpp"
#endif

CommonConversionsExtension::CommonConversionsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsCommonConversionsExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllExpressions()["ToNumber"].SetFunctionName("GDpriv::CommonInstructions::ToDouble").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    GetAllStrExpressions()["ToString"].SetFunctionName("GDpriv::CommonInstructions::ToString").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    GetAllStrExpressions()["LargeNumberToString"].SetFunctionName("GDpriv::CommonInstructions::LargeNumberToString").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    GetAllExpressions()["ToRad"].SetFunctionName("GDpriv::CommonInstructions::ToRad").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    GetAllExpressions()["ToDeg"].SetFunctionName("GDpriv::CommonInstructions::ToDeg").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    #endif
}

