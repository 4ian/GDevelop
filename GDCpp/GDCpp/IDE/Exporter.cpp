#if !defined(EMSCRIPTEN)
#if defined(GD_IDE_ONLY)
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "Exporter.h"
#include "GDCpp/IDE/Dialogs/ProjectExportDialog.h"

void Exporter::ShowProjectExportDialog(gd::Project & project)
{
#if !defined(GD_NO_WX_GUI)
    ProjectExportDialog dialog(NULL, project);
    dialog.ShowModal();
#else
    gd::LogError("BAD USE: Tried to call Exporter::ShowProjectExportDialog with support for wxWidgets disabled!");
#endif
}

std::string Exporter::GetProjectExportButtonLabel()
{
    return GD_T("Compile to a native executable");
}

Exporter::~Exporter()
{
    //dtor
}
#endif
#endif