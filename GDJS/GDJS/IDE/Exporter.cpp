/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/IDE/Exporter.h"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <streambuf>
#include <string>

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/IDE/ExporterHelper.h"

#undef CopyFile  // Disable an annoying macro

namespace gdjs {

Exporter::Exporter(gd::AbstractFileSystem &fileSystem, gd::String gdjsRoot_)
    : fs(fileSystem), gdjsRoot(gdjsRoot_) {
  SetCodeOutputDirectory(fs.GetTempDir() + "/GDTemporaries/JSCodeTemp");
}

Exporter::~Exporter() {}

bool Exporter::ExportProjectForPixiPreview(
    const PreviewExportOptions &options) {
  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
  return helper.ExportProjectForPixiPreview(options);
}

bool Exporter::ExportWholePixiProject(
    gd::Project &project,
    gd::String exportDir,
    std::map<gd::String, bool> &exportOptions) {
  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
  gd::Project exportedProject = project;

  auto usedExtensions = gd::UsedExtensionsFinder::ScanProject(project);

  auto exportProject = [this, &exportedProject, &exportOptions, &helper](
                           gd::String exportDir) {
    bool exportForCordova = exportOptions["exportForCordova"];
    bool exportForFacebookInstantGames =
        exportOptions["exportForFacebookInstantGames"];

    // Always disable the splash for Facebook Instant Games
    if (exportForFacebookInstantGames)
      exportedProject.GetLoadingScreen().ShowGDevelopSplash(false);

    // Prepare the export directory
    fs.MkDir(exportDir);
    std::vector<gd::String> includesFiles;

    // Export the resources (before generating events as some resources
    // filenames may be updated)
    const auto resourcesNames = helper.ExportResources(fs, exportedProject, exportDir);

    // Compatibility with GD <= 5.0-beta56
    // Stay compatible with text objects declaring their font as just a filename
    // without a font resource - by manually adding these resources.
    helper.AddDeprecatedFontFilesToFontResources(
        fs, exportedProject.GetResourcesManager(), exportDir);
    // end of compatibility code

    // Export engine libraries
    helper.AddLibsInclude(
        /*pixiRenderers=*/true,
        /*includeWebsocketDebuggerClient=*/false,
        /*includeWindowMessageDebuggerClient=*/false,
        exportedProject.GetLoadingScreen().GetGDevelopLogoStyle(),
        includesFiles);

    // Export files for object and behaviors
    helper.ExportObjectAndBehaviorsIncludes(exportedProject, includesFiles);

    // Export effects (after engine libraries as they auto-register themselves
    // to the engine)
    helper.ExportEffectIncludes(exportedProject, includesFiles);

    // Export events
    if (!helper.ExportEventsCode(
            exportedProject, codeOutputDir, includesFiles, false)) {
      gd::LogError(_("Error during exporting! Unable to export events:\n") +
                   lastError);
      return false;
    }

    // Export source files
    if (!helper.ExportExternalSourceFiles(
            exportedProject, codeOutputDir, includesFiles)) {
      gd::LogError(
          _("Error during exporting! Unable to export source files:\n") +
          lastError);
      return false;
    }

    // Strip the project (*after* generating events as the events may use
    // stripped things like objects groups...)...
    gd::ProjectStripper::StripProjectForExport(exportedProject);

    //...and export it
    gd::SerializerElement noRuntimeGameOptions;
    helper.ExportProjectData(
        fs, exportedProject, codeOutputDir + "/data.js", noRuntimeGameOptions);
    includesFiles.push_back(codeOutputDir + "/data.js");

    // Export a ServiceWorker for caching
    if (!fs.WriteToFile(exportDir + "/sw.js",
                        helper.GenerateServiceWorker(includesFiles, resourcesNames)))
      gd::LogError("Unable to export Service Worker.");
    
    // Export a WebManifest with project metadata
    if (!fs.WriteToFile(exportDir + "/manifest.webmanifest",
                        helper.GenerateWebManifest(exportedProject)))
      gd::LogError("Unable to export WebManifest.");

    helper.ExportIncludesAndLibs(includesFiles, exportDir, false);

    gd::String source = gdjsRoot + "/Runtime/index.html";
    if (exportForCordova)
      source = gdjsRoot + "/Runtime/Cordova/www/index.html";
    else if (exportForFacebookInstantGames)
      source = gdjsRoot + "/Runtime/FacebookInstantGames/index.html";

    if (!helper.ExportPixiIndexFile(exportedProject,
                                    source,
                                    exportDir,
                                    includesFiles,
                                    /*nonRuntimeScriptsCacheBurst=*/0,
                                    "")) {
      gd::LogError(_("Error during export:\n") + lastError);
      return false;
    }

    return true;
  };

  if (exportOptions["exportForCordova"]) {
    fs.MkDir(exportDir);
    fs.MkDir(exportDir + "/www");

    if (!exportProject(exportDir + "/www")) return false;

    if (!helper.ExportCordovaFiles(exportedProject, exportDir, usedExtensions))
      return false;
  } else if (exportOptions["exportForElectron"]) {
    fs.MkDir(exportDir);

    if (!exportProject(exportDir + "/app")) return false;

    if (!helper.ExportElectronFiles(exportedProject, exportDir, usedExtensions))
      return false;
  } else if (exportOptions["exportForFacebookInstantGames"]) {
    if (!exportProject(exportDir)) return false;

    if (!helper.ExportFacebookInstantGamesFiles(exportedProject, exportDir))
      return false;
  } else {
    if (!exportProject(exportDir)) return false;
  }

  return true;
}

}  // namespace gdjs
