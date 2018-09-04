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
#if !defined(GD_NO_WX_GUI)
#include <wx/config.h>
#include <wx/dir.h>
#include <wx/filename.h>
#include <wx/msgdlg.h>
#include <wx/progdlg.h>
#include <wx/wfstream.h>
#include <wx/zipstrm.h>
#endif
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/IDE/wxTools/ShowFolder.h"
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

// Nice tools functions
static void InsertUnique(std::vector<gd::String> &container, gd::String str) {
  if (std::find(container.begin(), container.end(), str) == container.end())
    container.push_back(str);
}

static void GenerateFontsDeclaration(gd::AbstractFileSystem &fs,
                                     const gd::String &outputDir,
                                     gd::String &css,
                                     gd::String &html,
                                     gd::String urlPrefix = "") {
  std::vector<gd::String> ttfFiles = fs.ReadDir(outputDir, ".TTF");
  for (std::size_t i = 0; i < ttfFiles.size(); ++i) {
    gd::String relativeFile = ttfFiles[i];
    fs.MakeRelative(relativeFile, outputDir);
    css += "@font-face{ font-family : \"gdjs_font_";
    css += relativeFile;
    css += "\"; src : url('";
    css += urlPrefix + relativeFile;
    css += "') format('truetype'); }";

    // Use the font for a dummy text to trigger immediate load of the font at
    // game startup
    html += "<div style=\"font-family: 'gdjs_font_";
    html += relativeFile;
    html += "'; color: black;\">.</div>";
  }
}

ExporterHelper::ExporterHelper(gd::AbstractFileSystem &fileSystem,
                               gd::String gdjsRoot_,
                               gd::String codeOutputDir_)
    : fs(fileSystem), gdjsRoot(gdjsRoot_), codeOutputDir(codeOutputDir_){};

bool ExporterHelper::ExportLayoutForPixiPreview(gd::Project &project,
                                                gd::Layout &layout,
                                                gd::String exportDir,
                                                gd::String additionalSpec) {
  fs.MkDir(exportDir);
  fs.ClearDir(exportDir);
  std::vector<gd::String> includesFiles;

  gd::Project exportedProject = project;

  // Always disable the splash for preview
  exportedProject.GetLoadingScreen().ShowGDevelopSplash(false);

  // Export resources (*before* generating events as some resources filenames
  // may be updated)
  ExportResources(fs, exportedProject, exportDir);

  // Export engine libraries
  AddLibsInclude(true, false, true, includesFiles);

  // Generate events code
  if (!ExportEventsCode(exportedProject, codeOutputDir, includesFiles, true))
    return false;

  // Export source files
  if (!ExportExternalSourceFiles(
          exportedProject, codeOutputDir, includesFiles)) {
    gd::LogError(_("Error during exporting! Unable to export source files:\n") +
                 lastError);
    return false;
  }

  // Strip the project (*after* generating events as the events may use stripped
  // things (objects groups...))
  gd::ProjectStripper::StripProjectForExport(exportedProject);
  exportedProject.SetFirstLayout(layout.GetName());

  // Export the project
  ExportToJSON(
      fs, exportedProject, codeOutputDir + "/data.js", "gdjs.projectData");
  includesFiles.push_back(codeOutputDir + "/data.js");

  // Copy all the dependencies
  RemoveIncludes(false, true, includesFiles);
  ExportIncludesAndLibs(includesFiles, exportDir, false);

  // Create the index file
  if (!ExportPixiIndexFile(gdjsRoot + "/Runtime/index.html",
                           exportDir,
                           includesFiles,
                           additionalSpec))
    return false;

  return true;
}

gd::String ExporterHelper::ExportToJSON(gd::AbstractFileSystem &fs,
                                        const gd::Project &project,
                                        gd::String filename,
                                        gd::String wrapIntoVariable) {
  fs.MkDir(fs.DirNameFrom(filename));

  // Save the project to JSON
  gd::SerializerElement rootElement;
  project.SerializeTo(rootElement);

  gd::String output = gd::Serializer::ToJSON(rootElement);
  if (!wrapIntoVariable.empty())
    output = wrapIntoVariable + " = " + output + ";";

  if (!fs.WriteToFile(filename, output)) return "Unable to write " + filename;

  return "";
}

bool ExporterHelper::ExportPixiIndexFile(
    gd::String source,
    gd::String exportDir,
    const std::vector<gd::String> &includesFiles,
    gd::String additionalSpec) {
  gd::String str = fs.ReadFile(source);

  // Generate custom declarations for font resources
  gd::String customCss;
  gd::String customHtml;
  GenerateFontsDeclaration(fs, exportDir, customCss, customHtml);

  // Generate the file
  if (!CompleteIndexFile(
          str, customCss, customHtml, exportDir, includesFiles, additionalSpec))
    return false;

  // Write the index.html file
  if (!fs.WriteToFile(exportDir + "/index.html", str)) {
    lastError = "Unable to write index file.";
    return false;
  }

  return true;
}

bool ExporterHelper::ExportCordovaConfigFile(const gd::Project &project,
                                             gd::String exportDir) {
  auto &platformSpecificAssets = project.GetPlatformSpecificAssets();
  auto &resourceManager = project.GetResourcesManager();
  auto getIconFilename = [&resourceManager, &platformSpecificAssets](
                             const gd::String &platform,
                             const gd::String &name) {
    const gd::String &file =
        resourceManager.GetResource(platformSpecificAssets.Get(platform, name))
            .GetFile();
    return file.empty() ? "" : "www/" + file;
  };

  gd::String str =
      fs.ReadFile(gdjsRoot + "/Runtime/Cordova/config.xml")
          .FindAndReplace("GDJS_PROJECTNAME", project.GetName())
          .FindAndReplace("GDJS_PACKAGENAME", project.GetPackageName())
          .FindAndReplace("GDJS_ORIENTATION", project.GetOrientation())
          // Android icons
          .FindAndReplace("GDJS_ICON_ANDROID_36",
                          getIconFilename("android", "icon-36"))
          .FindAndReplace("GDJS_ICON_ANDROID_48",
                          getIconFilename("android", "icon-48"))
          .FindAndReplace("GDJS_ICON_ANDROID_72",
                          getIconFilename("android", "icon-72"))
          .FindAndReplace("GDJS_ICON_ANDROID_96",
                          getIconFilename("android", "icon-96"))
          .FindAndReplace("GDJS_ICON_ANDROID_144",
                          getIconFilename("android", "icon-144"))
          .FindAndReplace("GDJS_ICON_ANDROID_192",
                          getIconFilename("android", "icon-192"))
          // iOS icons
          .FindAndReplace("GDJS_ICON_IOS_180",
                          getIconFilename("ios", "icon-180"))
          .FindAndReplace("GDJS_ICON_IOS_60", getIconFilename("ios", "icon-60"))
          .FindAndReplace("GDJS_ICON_IOS_120",
                          getIconFilename("ios", "icon-120"))
          .FindAndReplace("GDJS_ICON_IOS_76", getIconFilename("ios", "icon-76"))
          .FindAndReplace("GDJS_ICON_IOS_152",
                          getIconFilename("ios", "icon-152"))
          .FindAndReplace("GDJS_ICON_IOS_40", getIconFilename("ios", "icon-40"))
          .FindAndReplace("GDJS_ICON_IOS_80", getIconFilename("ios", "icon-80"))
          .FindAndReplace("GDJS_ICON_IOS_57", getIconFilename("ios", "icon-57"))
          .FindAndReplace("GDJS_ICON_IOS_114",
                          getIconFilename("ios", "icon-114"))
          .FindAndReplace("GDJS_ICON_IOS_72", getIconFilename("ios", "icon-72"))
          .FindAndReplace("GDJS_ICON_IOS_144",
                          getIconFilename("ios", "icon-144"))
          .FindAndReplace("GDJS_ICON_IOS_167",
                          getIconFilename("ios", "icon-167"))
          .FindAndReplace("GDJS_ICON_IOS_29", getIconFilename("ios", "icon-29"))
          .FindAndReplace("GDJS_ICON_IOS_58", getIconFilename("ios", "icon-58"))
          .FindAndReplace("GDJS_ICON_IOS_50", getIconFilename("ios", "icon-50"))
          .FindAndReplace("GDJS_ICON_IOS_100",
                          getIconFilename("ios", "icon-100"));

  if (!fs.WriteToFile(exportDir + "/config.xml", str)) {
    lastError = "Unable to write configuration file.";
    return false;
  }

  return true;
}

bool ExporterHelper::ExportCocos2dFiles(
    const gd::Project &project,
    gd::String exportDir,
    bool debugMode,
    const std::vector<gd::String> &includesFiles) {
  if (!fs.CopyFile(gdjsRoot + "/Runtime/Cocos2d/main.js",
                   exportDir + "/main.js")) {
    lastError = "Unable to write Cocos2d main.js file.";
    return false;
  }

  if (!fs.CopyFile(gdjsRoot + "/Runtime/Cocos2d/cocos2d-js-v3.10.js",
                   exportDir + "/cocos2d-js-v3.10.js")) {
    lastError = "Unable to write Cocos2d cocos2d-js-v3.10.js file.";
    return false;
  }

  {
    gd::String str = fs.ReadFile(gdjsRoot + "/Runtime/Cocos2d/index.html");

    // Generate custom declarations for font resources
    gd::String customCss;
    gd::String customHtml;
    GenerateFontsDeclaration(
        fs, exportDir + "/res", customCss, customHtml, "res/");

    // Generate the file
    std::vector<gd::String> noIncludesInThisFile;
    if (!CompleteIndexFile(
            str, customCss, customHtml, exportDir, noIncludesInThisFile, "")) {
      lastError = "Unable to complete Cocos2d-JS index.html file.";
      return false;
    }

    // Write the index.html file
    if (!fs.WriteToFile(exportDir + "/index.html", str)) {
      lastError = "Unable to write Cocos2d-JS index.html file.";
      return false;
    }
  }

  {
    gd::String includeFilesStr = "";
    bool first = true;
    for (auto &file : includesFiles) {
      if (!fs.FileExists(exportDir + "/src/" + file)) {
        std::cout << "Warning: Unable to find " << exportDir + "/" + file << "."
                  << std::endl;
        continue;
      }

      includeFilesStr +=
          gd::String(first ? "" : ", ") + "\"src/" + file + "\"\n";
      first = false;
    }

    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Cocos2d/project.json")
            .FindAndReplace("// GDJS_INCLUDE_FILES", includeFilesStr)
            .FindAndReplace("/*GDJS_SHOW_FPS*/", debugMode ? "true" : "false");

    if (!fs.WriteToFile(exportDir + "/project.json", str)) {
      lastError = "Unable to write Cocos2d-JS project.json file.";
      return false;
    }
  }

  return true;
}

bool ExporterHelper::ExportElectronFiles(const gd::Project &project,
                                         gd::String exportDir) {
  gd::String jsonName =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetName()));
  gd::String jsonAuthor =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetAuthor()));
  gd::String jsonVersion =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetVersion()));
  gd::String jsonMangledName = gd::Serializer::ToJSON(gd::SerializerElement(
      gd::SceneNameMangler::GetMangledSceneName(project.GetName())
          .LowerCase()
          .FindAndReplace(" ", "-")));

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Electron/package.json")
            .FindAndReplace("\"GDJS_GAME_NAME\"", jsonName)
            .FindAndReplace("\"GDJS_GAME_AUTHOR\"", jsonAuthor)
            .FindAndReplace("\"GDJS_GAME_VERSION\"", jsonVersion)
            .FindAndReplace("\"GDJS_GAME_MANGLED_NAME\"", jsonMangledName);

    if (!fs.WriteToFile(exportDir + "/package.json", str)) {
      lastError = "Unable to write Electron package.json file.";
      return false;
    }
  }

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Electron/main.js")
            .FindAndReplace(
                "800 /*GDJS_WINDOW_WIDTH*/",
                gd::String::From<int>(project.GetMainWindowDefaultWidth()))
            .FindAndReplace(
                "600 /*GDJS_WINDOW_HEIGHT*/",
                gd::String::From<int>(project.GetMainWindowDefaultHeight()))
            .FindAndReplace("\"GDJS_GAME_NAME\"", jsonName);

    if (!fs.WriteToFile(exportDir + "/main.js", str)) {
      lastError = "Unable to write Electron main.js file.";
      return false;
    }
  }

  auto &platformSpecificAssets = project.GetPlatformSpecificAssets();
  auto &resourceManager = project.GetResourcesManager();

  gd::String iconFilename =
      resourceManager
          .GetResource(platformSpecificAssets.Get("desktop", "icon-512"))
          .GetFile();
  auto projectDirectory = gd::AbstractFileSystem::NormalizeSeparator(
      fs.DirNameFrom(project.GetProjectFile()));
  fs.MakeAbsolute(iconFilename, projectDirectory);
  fs.MkDir(exportDir + "/buildResources");
  if (fs.FileExists(iconFilename)) {
    fs.CopyFile(iconFilename, exportDir + "/buildResources/icon.png");
  }

  return true;
}

bool ExporterHelper::CompleteIndexFile(
    gd::String &str,
    gd::String customCss,
    gd::String customHtml,
    gd::String exportDir,
    const std::vector<gd::String> &includesFiles,
    gd::String additionalSpec) {
  if (additionalSpec.empty()) additionalSpec = "{}";

  gd::String codeFilesIncludes;
  for (std::vector<gd::String>::const_iterator it = includesFiles.begin();
       it != includesFiles.end();
       ++it) {
    gd::String scriptSrc = "";
    if (fs.IsAbsolute(*it)) {
      // Most of the time, script source are file paths relative to GDJS root or
      // have been copied in the output directory, so they are relative. It's
      // still useful to test here for absolute files as the exporter could be
      // configured with a file system dealing with URL.
      scriptSrc = *it;
    } else {
      if (!fs.FileExists(exportDir + "/" + *it)) {
        std::cout << "Warning: Unable to find " << exportDir + "/" + *it << "."
                  << std::endl;
        continue;
      }

      scriptSrc = exportDir + "/" + *it;
      fs.MakeRelative(scriptSrc, exportDir);
    }

    codeFilesIncludes += "\t<script src=\"" + scriptSrc + "\"></script>\n";
  }

  str = str.FindAndReplace("/* GDJS_CUSTOM_STYLE */", customCss)
            .FindAndReplace("<!-- GDJS_CUSTOM_HTML -->", customHtml)
            .FindAndReplace("<!-- GDJS_CODE_FILES -->", codeFilesIncludes)
            .FindAndReplace("{}/*GDJS_ADDITIONAL_SPEC*/", additionalSpec);

  return true;
}

void ExporterHelper::AddLibsInclude(bool pixiRenderers,
                                    bool cocosRenderers,
                                    bool websocketDebuggerClient,
                                    std::vector<gd::String> &includesFiles) {
  // First, do not forget common includes (they must be included before events
  // generated code files).
  InsertUnique(includesFiles, "libs/jshashtable.js");
  InsertUnique(includesFiles, "gd.js");
  InsertUnique(includesFiles, "gd-splash-image.js");
  InsertUnique(includesFiles, "libs/hshg.js");
  InsertUnique(includesFiles, "libs/rbush.js");
  InsertUnique(includesFiles, "inputmanager.js");
  InsertUnique(includesFiles, "timemanager.js");
  InsertUnique(includesFiles, "runtimeobject.js");
  InsertUnique(includesFiles, "profiler.js");
  InsertUnique(includesFiles, "runtimescene.js");
  InsertUnique(includesFiles, "scenestack.js");
  InsertUnique(includesFiles, "polygon.js");
  InsertUnique(includesFiles, "force.js");
  InsertUnique(includesFiles, "layer.js");
  InsertUnique(includesFiles, "timer.js");
  InsertUnique(includesFiles, "runtimegame.js");
  InsertUnique(includesFiles, "variable.js");
  InsertUnique(includesFiles, "variablescontainer.js");
  InsertUnique(includesFiles, "oncetriggers.js");
  InsertUnique(includesFiles, "runtimebehavior.js");
  InsertUnique(includesFiles, "spriteruntimeobject.js");

  // Common includes for events only.
  InsertUnique(includesFiles, "events-tools/commontools.js");
  InsertUnique(includesFiles, "events-tools/runtimescenetools.js");
  InsertUnique(includesFiles, "events-tools/inputtools.js");
  InsertUnique(includesFiles, "events-tools/objecttools.js");
  InsertUnique(includesFiles, "events-tools/cameratools.js");
  InsertUnique(includesFiles, "events-tools/soundtools.js");
  InsertUnique(includesFiles, "events-tools/storagetools.js");
  InsertUnique(includesFiles, "events-tools/stringtools.js");
  InsertUnique(includesFiles, "events-tools/windowtools.js");
  InsertUnique(includesFiles, "events-tools/networktools.js");

  if (websocketDebuggerClient) {
    InsertUnique(includesFiles,
                 "websocket-debugger-client/websocket-debugger-client.js");
  }

  if (pixiRenderers) {
    InsertUnique(includesFiles, "pixi-renderers/pixi.js");
    InsertUnique(includesFiles, "pixi-renderers/pixi-filters-tools.js");
    InsertUnique(includesFiles, "pixi-renderers/runtimegame-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/runtimescene-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/layer-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/pixi-image-manager.js");
    InsertUnique(includesFiles,
                 "pixi-renderers/spriteruntimeobject-pixi-renderer.js");
    InsertUnique(includesFiles,
                 "pixi-renderers/loadingscreen-pixi-renderer.js");
    InsertUnique(includesFiles, "howler-sound-manager/howler.min.js");
    InsertUnique(includesFiles, "howler-sound-manager/howler-sound-manager.js");
  }

  if (cocosRenderers) {
    InsertUnique(includesFiles, "cocos-renderers/cocos-director-manager.js");
    InsertUnique(includesFiles, "cocos-renderers/cocos-image-manager.js");
    InsertUnique(includesFiles, "cocos-renderers/cocos-tools.js");
    InsertUnique(includesFiles, "cocos-renderers/layer-cocos-renderer.js");
    InsertUnique(includesFiles,
                 "cocos-renderers/loadingscreen-cocos-renderer.js");
    InsertUnique(includesFiles,
                 "cocos-renderers/runtimegame-cocos-renderer.js");
    InsertUnique(includesFiles,
                 "cocos-renderers/runtimescene-cocos-renderer.js");
    InsertUnique(includesFiles,
                 "cocos-renderers/spriteruntimeobject-cocos-renderer.js");
    InsertUnique(includesFiles, "cocos-sound-manager/cocos-sound-manager.js");
  }
}

void ExporterHelper::RemoveIncludes(bool pixiRenderers,
                                    bool cocosRenderers,
                                    std::vector<gd::String> &includesFiles) {
  if (pixiRenderers) {
    for (auto it = includesFiles.begin(); it != includesFiles.end();) {
      if (it->find("pixi-renderer") != gd::String::npos)
        includesFiles.erase(it++);
      else
        ++it;
    }
  }
  if (cocosRenderers) {
    for (auto it = includesFiles.begin(); it != includesFiles.end();) {
      if (it->find("cocos-renderer") != gd::String::npos)
        includesFiles.erase(it++);
      else
        ++it;
    }
  }
}

bool ExporterHelper::ExportEventsCode(gd::Project &project,
                                      gd::String outputDir,
                                      std::vector<gd::String> &includesFiles,
                                      bool exportForPreview) {
  fs.MkDir(outputDir);

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    std::set<gd::String> eventsIncludes;
    gd::Layout &exportedLayout = project.GetLayout(i);
    gd::String eventsOutput =
        EventsCodeGenerator::GenerateSceneEventsCompleteCode(
            project,
            exportedLayout,
            exportedLayout.GetEvents(),
            eventsIncludes,
            !exportForPreview);
    gd::String filename =
        outputDir + "/" + "code" + gd::String::From(i) + ".js";

    // Export the code
    if (fs.WriteToFile(filename, eventsOutput)) {
      for (std::set<gd::String>::iterator include = eventsIncludes.begin();
           include != eventsIncludes.end();
           ++include)
        InsertUnique(includesFiles, *include);

      InsertUnique(includesFiles, filename);
    } else {
      lastError = _("Unable to write ") + filename;
      return false;
    }
  }

  return true;
}

bool ExporterHelper::ExportExternalSourceFiles(
    gd::Project &project,
    gd::String outputDir,
    std::vector<gd::String> &includesFiles) {
  const auto &allFiles = project.GetAllSourceFiles();
  for (std::size_t i = 0; i < allFiles.size(); ++i) {
    if (!allFiles[i]) continue;
    if (allFiles[i]->GetLanguage() != "Javascript") continue;

    gd::SourceFile &file = *allFiles[i];

    gd::String filename = file.GetFileName();
    fs.MakeAbsolute(filename, fs.DirNameFrom(project.GetProjectFile()));
    gd::String outFilename = "ext-code" + gd::String::From(i) + ".js";
    if (!fs.CopyFile(filename, outputDir + outFilename))
      gd::LogWarning(_("Could not copy external file") + filename);

    InsertUnique(includesFiles, outputDir + outFilename);
  }

  return true;
}

bool ExporterHelper::ExportIncludesAndLibs(
    std::vector<gd::String> &includesFiles, gd::String exportDir, bool minify) {
#if !defined(GD_NO_WX_GUI)
  // Includes files :
  if (minify) {
    gd::String nodeExec = GetNodeExecutablePath();
    if (nodeExec.empty() || !fs.FileExists(nodeExec)) {
      std::cout << "Node.js executable not found." << std::endl;
      gd::LogWarning(
          _("The exported script could not be minified: Please check that you "
            "installed Node.js on your system."));
      minify = false;
    } else {
      gd::String jsPlatformDir = wxGetCwd() + "/JsPlatform/";
      gd::String cmd =
          nodeExec + " \"" + jsPlatformDir + "Tools/uglify-js/bin/uglifyjs\" ";

      gd::String allJsFiles;
      for (std::vector<gd::String>::iterator include = includesFiles.begin();
           include != includesFiles.end();
           ++include) {
        if (!fs.IsAbsolute(*include)) {
          gd::String source = gdjsRoot + "/Runtime/" + *include;
          if (fs.FileExists(source)) allJsFiles += "\"" + source + "\" ";
        } else {
          if (fs.FileExists(*include)) allJsFiles += "\"" + *include + "\" ";
        }
      }

      cmd += allJsFiles;
      cmd += "-o \"" + exportDir + "/code.js\"";

      wxArrayString output;
      wxArrayString errors;
      long res = wxExecute(cmd, output, errors);
      if (res != 0) {
        std::cout << "Execution of \"UglifyJS\" failed (Command line : " << cmd
                  << ")." << std::endl;
        std::cout << "Output: ";
        for (size_t i = 0; i < output.size(); ++i)
          std::cout << output[i] << std::endl;
        for (size_t i = 0; i < errors.size(); ++i)
          std::cout << errors[i] << std::endl;

        gd::LogWarning(
            _("The exported script could not be minified.\n\nMay be an "
              "extension is triggering this error: Try to contact the "
              "developer if you think it is the case."));
        minify = false;
      } else {
        includesFiles.clear();
        InsertUnique(includesFiles, "code.js");
        return true;
      }
    }
  }
#else
  minify = false;
#endif

  // If the closure compiler failed or was not request, simply copy all the
  // include files.
  if (!minify) {
    for (std::vector<gd::String>::iterator include = includesFiles.begin();
         include != includesFiles.end();
         ++include) {
      if (!fs.IsAbsolute(*include)) {
        gd::String source = gdjsRoot + "/Runtime/" + *include;
        if (fs.FileExists(source)) {
          gd::String path = fs.DirNameFrom(exportDir + "/" + *include);
          if (!fs.DirExists(path)) fs.MkDir(path);

          fs.CopyFile(source, exportDir + "/" + *include);

          gd::String relativeInclude = source;
          fs.MakeRelative(relativeInclude, gdjsRoot + "/Runtime/");
          *include = relativeInclude;
        } else {
          std::cout << "Could not find GDJS include file " << *include
                    << std::endl;
        }
      } else {
        // Note: all the code generated from events are generated in another
        // folder and fall in this case:

        if (fs.FileExists(*include)) {
          fs.CopyFile(*include, exportDir + "/" + fs.FileNameFrom(*include));
          *include = fs.FileNameFrom(
              *include);  // Ensure filename is relative to the export dir.
        } else {
          std::cout << "Could not find include file " << *include << std::endl;
        }
      }
    }
  }

  return true;
}

void ExporterHelper::ExportResources(gd::AbstractFileSystem &fs,
                                     gd::Project &project,
                                     gd::String exportDir,
                                     wxProgressDialog *progressDialog) {
  gd::ProjectResourcesCopier::CopyAllResourcesTo(
      project, fs, exportDir, true, progressDialog, false, false);
}

#if !defined(GD_NO_WX_GUI)
gd::String ExporterHelper::GetNodeExecutablePath() {
  std::vector<gd::String> guessPaths;
  wxString userPath;
  if (wxConfigBase::Get()->Read("Paths/Node", &userPath) && !userPath.empty())
    guessPaths.push_back(userPath);
  else {
// Try some common paths.
#if defined(WINDOWS)
    guessPaths.push_back("C:/Program Files/nodejs/node.exe");
    guessPaths.push_back("C:/Program Files (x86)/nodejs/node.exe");
#elif defined(LINUX) || defined(MACOS)
    guessPaths.push_back("/usr/bin/env/nodejs");
    guessPaths.push_back("/usr/bin/nodejs");
    guessPaths.push_back("/usr/local/bin/nodejs");
    guessPaths.push_back("/usr/bin/env/node");
    guessPaths.push_back("/usr/bin/node");
    guessPaths.push_back("/usr/local/bin/node");
#else
#warning Please complete this so as to return a path to the Node executable.
#endif
  }

  for (size_t i = 0; i < guessPaths.size(); ++i) {
    if (wxFileExists(guessPaths[i])) return guessPaths[i];
  }

  return "";
}
#endif

}  // namespace gdjs
