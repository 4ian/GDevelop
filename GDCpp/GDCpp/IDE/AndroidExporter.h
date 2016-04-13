#ifndef ANDROID_EXPORTER_H
#define ANDROID_EXPORTER_H
#if defined(GD_IDE_ONLY)
namespace gd { class AbstractFileSystem; }
#include "GDCore/IDE/ProjectExporter.h"
class wxProgressDialog;

/**
 * \brief Allow to export a game for Android
 * \todo Highly experimental
 *
 * To export a game for Android:
 * [Build SFML](https://github.com/SFML/SFML/wiki/Tutorial:-Building-SFML-for-Android)
 * for Android NDK. Finally, go in the exported folder and do:
 *
 * ~~~~~~~~~~~~~~~~~~~~~
 * ndk-build && ant debug #To build the APK.
 * adb install bin/NativeActivity-debug.apk #To run it on simulator/device.
 * ~~~~~~~~~~~~~~~~~~~~~
 */
class AndroidExporter : public gd::ProjectExporter
{
public:
    AndroidExporter(gd::AbstractFileSystem & fileSystem) : fs(fileSystem) {};

    void ShowProjectExportDialog(gd::Project & project);

    gd::String GetProjectExportButtonLabel() { return "Export for Android (experimental)"; }

    bool ExportWholeProject(gd::Project & project, gd::String exportDir);
private:

    bool ExportMainFile(gd::Project & project, gd::String outputDir);

    static void ExportResources(gd::AbstractFileSystem & fs, gd::Project & project, gd::String exportDir,
       wxProgressDialog * progressDlg = NULL);

    bool ExportEventsCode(gd::Project & project, gd::String outputDir);

    static gd::String GetSourcesPath() { return "./CppPlatform/Sources"; }
    static gd::String GetAndroidProjectPath() { return GetSourcesPath() + "/GDCpp/Runtime/Android"; }

    gd::AbstractFileSystem & fs; ///< The abstract file system to be used for exportation.
    gd::String lastError; ///< The last error that occurred.
};

#endif
#endif // ANDROID_EXPORTER_H
