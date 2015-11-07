#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "ExternalLayoutsExtension.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/ExternalLayoutsExtension.cpp"
#endif


ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["BuiltinExternalLayouts::CreateObjectsFromExternalLayout"].SetFunctionName("ExternalLayoutsTools::CreateObjectsFromExternalLayout").SetIncludeFile("GDCpp/Extensions/Builtin/ExternalLayoutsTools.h");
    #endif
}

