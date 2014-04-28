#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "ExternalLayoutsExtension.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/ExternalLayoutsExtension.cpp"
#endif


ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["BuiltinExternalLayouts::CreateObjectsFromExternalLayout"].codeExtraInformation.SetFunctionName("ExternalLayoutsTools::CreateObjectsFromExternalLayout").SetIncludeFile("GDCpp/BuiltinExtensions/ExternalLayoutsTools.h");
    #endif
}

