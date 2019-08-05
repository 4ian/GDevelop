/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <algorithm>
#include <fstream>
#include <sstream>
#include <streambuf>
#include <string>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
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
#include "GDJS/IDE/Exporter.h"
#include "GDJS/IDE/ExporterHelper.h"
#undef CopyFile  // Disable an annoying macro

namespace gdjs {

Exporter::Exporter(gd::AbstractFileSystem& fileSystem, gd::String gdjsRoot_)
    : fs(fileSystem), gdjsRoot(gdjsRoot_) {
  SetCodeOutputDirectory(fs.GetTempDir() + "/GDTemporaries/JSCodeTemp");
}

Exporter::~Exporter() {}

bool Exporter::ExportLayoutForPixiPreview(gd::Project& project,
                                          gd::Layout& layout,
                                          gd::String exportDir) {
  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
  return helper.ExportLayoutForPixiPreview(project, layout, exportDir, "");
}

bool Exporter::ExportExternalLayoutForPixiPreview(
    gd::Project& project,
    gd::Layout& layout,
    gd::ExternalLayout& externalLayout,
    gd::String exportDir) {
  gd::SerializerElement options;
  options.AddChild("injectExternalLayout").SetValue(externalLayout.GetName());

  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
  return helper.ExportLayoutForPixiPreview(
      project, layout, exportDir, gd::Serializer::ToJSON(options));
}

bool Exporter::ExportWholePixiProject(
    gd::Project& project,
    gd::String exportDir,
    std::map<gd::String, bool>& exportOptions) {
  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
  gd::Project exportedProject = project;

  auto exportProject = [this, &exportedProject, &exportOptions, &helper](
                           gd::String exportDir) {
    bool minify = exportOptions["minify"];
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
    helper.ExportResources(fs, exportedProject, exportDir);

    // Export engine libraries
    helper.AddLibsInclude(true, false, false, includesFiles);

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
    helper.ExportToJSON(
        fs, exportedProject, codeOutputDir + "/data.js", "gdjs.projectData");
    includesFiles.push_back(codeOutputDir + "/data.js");

    // Copy all dependencies and the index (or metadata) file.
    helper.RemoveIncludes(false, true, includesFiles);
    helper.ExportIncludesAndLibs(includesFiles, exportDir, minify);

    gd::String source = gdjsRoot + "/Runtime/index.html";
    if (exportForCordova)
      source = gdjsRoot + "/Runtime/Cordova/www/index.html";
    else if (exportForFacebookInstantGames)
      source = gdjsRoot + "/Runtime/FacebookInstantGames/index.html";

    if (!helper.ExportPixiIndexFile(
            exportedProject, source, exportDir, includesFiles, "")) {
      gd::LogError(_("Error during export:\n") + lastError);
      return false;
    }

    return true;
  };

  if (exportOptions["exportForCordova"]) {
    fs.MkDir(exportDir);
    fs.MkDir(exportDir + "/www");

    if (!exportProject(exportDir + "/www")) return false;

    if (!helper.ExportCordovaConfigFile(exportedProject, exportDir))
      return false;
  } else if (exportOptions["exportForElectron"]) {
    fs.MkDir(exportDir);

    if (!exportProject(exportDir + "/app")) return false;

    if (!helper.ExportElectronFiles(exportedProject, exportDir)) return false;
  } else if (exportOptions["exportForFacebookInstantGames"]) {
    if (!exportProject(exportDir)) return false;

    if (!helper.ExportFacebookInstantGamesFiles(exportedProject, exportDir))
      return false;
  } else {
    if (!exportProject(exportDir)) return false;
  }

  return true;
}

bool Exporter::ExportWholeCocos2dProject(gd::Project& project,
                                         bool debugMode,
                                         gd::String exportDir) {
  ExporterHelper helper(fs, gdjsRoot, codeOutputDir);

  wxProgressDialog* progressDialogPtr = NULL;

  // Prepare the export directory
  fs.MkDir(exportDir);
  std::vector<gd::String> includesFiles;

  gd::Project exportedProject = project;

  // Export the resources (before generating events as some resources filenames
  // may be updated)
  helper.ExportResources(
      fs, exportedProject, exportDir + "/res");

  // Export engine libraries
  helper.AddLibsInclude(false, true, false, includesFiles);

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
    gd::LogError(_("Error during exporting! Unable to export source files:\n") +
                 lastError);
    return false;
  }

  // Strip the project (*after* generating events as the events may use stripped
  // things like objects groups...)...
  gd::ProjectStripper::StripProjectForExport(exportedProject);

  //...and export it
  helper.ExportToJSON(
      fs, exportedProject, codeOutputDir + "/data.js", "gdjs.projectData");
  includesFiles.push_back(codeOutputDir + "/data.js");

  // Copy all dependencies and the index (or metadata) file.
  helper.RemoveIncludes(true, false, includesFiles);
  helper.ExportIncludesAndLibs(includesFiles, exportDir + "/src", false);

  if (!helper.ExportCocos2dFiles(
          project, exportDir, debugMode, includesFiles)) {
    gd::LogError(_("Error during export:\n") + lastError);
    return false;
  }

  return true;
}

}  // namespace gdjs
