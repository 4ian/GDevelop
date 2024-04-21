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
#include "GDCore/IDE/Project/SceneResourcesFinder.h"
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

static void InsertUnique(std::vector<gd::String> &container, gd::String str) {
  if (std::find(container.begin(), container.end(), str) == container.end())
    container.push_back(str);
}

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

bool Exporter::ExportWholePixiProject(const ExportOptions &options) {
  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
  gd::Project exportedProject = options.project;

  auto usedExtensionsResult =
      gd::UsedExtensionsFinder::ScanProject(options.project);
  auto &usedExtensions = usedExtensionsResult.GetUsedExtensions();

  auto exportProject = [this,
                        &exportedProject,
                        &options,
                        &helper,
                        &usedExtensionsResult](gd::String exportDir) {
    // Use project properties fallback to set empty properties
    if (exportedProject.GetAuthorIds().empty() &&
        !options.fallbackAuthorId.empty()) {
      exportedProject.GetAuthorIds().push_back(options.fallbackAuthorId);
    }
    if (exportedProject.GetAuthorUsernames().empty() &&
        !options.fallbackAuthorUsername.empty()) {
      exportedProject.GetAuthorUsernames().push_back(
          options.fallbackAuthorUsername);
    }

    // Prepare the export directory
    fs.MkDir(exportDir);
    std::vector<gd::String> includesFiles;
    std::vector<gd::String> resourcesFiles;

    // Export the resources (before generating events as some resources
    // filenames may be updated)
    helper.ExportResources(fs, exportedProject, exportDir);

    // Compatibility with GD <= 5.0-beta56
    // Stay compatible with text objects declaring their font as just a filename
    // without a font resource - by manually adding these resources.
    helper.AddDeprecatedFontFilesToFontResources(
        fs, exportedProject.GetResourcesManager(), exportDir);
    // end of compatibility code

    // Export engine libraries
    helper.AddLibsInclude(
        /*pixiRenderers=*/true,
        usedExtensionsResult.Has3DObjects(),
        /*includeWebsocketDebuggerClient=*/false,
        /*includeWindowMessageDebuggerClient=*/false,
        exportedProject.GetLoadingScreen().GetGDevelopLogoStyle(),
        includesFiles);

    // Export files for free function, object and behaviors
    for (const auto &includeFile : usedExtensionsResult.GetUsedIncludeFiles()) {
      InsertUnique(includesFiles, includeFile);
    }
    for (const auto &requiredFile :
         usedExtensionsResult.GetUsedRequiredFiles()) {
      InsertUnique(resourcesFiles, requiredFile);
    }

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

    auto projectUsedResources =
        gd::SceneResourcesFinder::FindProjectResources(exportedProject);
    std::unordered_map<gd::String, std::set<gd::String>> scenesUsedResources;
    for (std::size_t layoutIndex = 0;
         layoutIndex < exportedProject.GetLayoutsCount(); layoutIndex++) {
      auto &layout = exportedProject.GetLayout(layoutIndex);
      scenesUsedResources[layout.GetName()] =
          gd::SceneResourcesFinder::FindSceneResources(exportedProject,
                                                            layout);
    }

    // Strip the project (*after* generating events as the events may use
    // stripped things like objects groups...)...
    gd::ProjectStripper::StripProjectForExport(exportedProject);

    //...and export it
    gd::SerializerElement noRuntimeGameOptions;
    helper.ExportProjectData(fs, exportedProject, codeOutputDir + "/data.js",
                             noRuntimeGameOptions, projectUsedResources,
                             scenesUsedResources);
    includesFiles.push_back(codeOutputDir + "/data.js");

    helper.ExportIncludesAndLibs(includesFiles, exportDir, false);
    helper.ExportIncludesAndLibs(resourcesFiles, exportDir, false);

    gd::String source = gdjsRoot + "/Runtime/index.html";
    if (options.target == "cordova")
      source = gdjsRoot + "/Runtime/Cordova/www/index.html";
    else if (options.target == "facebookInstantGames")
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

  if (options.target == "cordova") {
    fs.MkDir(options.exportPath);
    fs.MkDir(options.exportPath + "/www");

    if (!exportProject(options.exportPath + "/www")) return false;

    if (!helper.ExportCordovaFiles(
            exportedProject, options.exportPath, usedExtensions))
      return false;
  } else if (options.target == "electron") {
    fs.MkDir(options.exportPath);

    if (!exportProject(options.exportPath + "/app")) return false;

    if (!helper.ExportElectronFiles(
            exportedProject, options.exportPath, usedExtensions))
      return false;
  } else if (options.target == "facebookInstantGames") {
    if (!exportProject(options.exportPath)) return false;

    if (!helper.ExportFacebookInstantGamesFiles(exportedProject,
                                                options.exportPath))
      return false;
  } else {
    if (!exportProject(options.exportPath)) return false;

    if (!helper.ExportHtml5Files(exportedProject, options.exportPath))
      return false;
  }

  return true;
}

}  // namespace gdjs
