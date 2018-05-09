#if !defined(EMSCRIPTEN)
#if defined(GD_IDE_ONLY)
#include "Exporter.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCpp/IDE/Dialogs/ProjectExportDialog.h"

void Exporter::ShowProjectExportDialog(gd::Project& project) {
#if !defined(GD_NO_WX_GUI)
#if defined(MACOS)
  wxString error =
      _("GDevelop for Mac OS X does not support creating native games "
        ":/\n\nInstead, please use the HTML5 platform for your game: you can "
        "activate it from the Extensions in the project manager.");
  wxLogWarning(error);
#else
  ProjectExportDialog dialog(NULL, project);
  dialog.ShowModal();
#endif
#else
  gd::LogError(
      "BAD USE: Tried to call Exporter::ShowProjectExportDialog with support "
      "for wxWidgets disabled!");
#endif
}

gd::String Exporter::GetProjectExportButtonLabel() {
  return _("Compile to a native executable");
}

Exporter::~Exporter() {
  // dtor
}
#endif
#endif
