/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EXPORTER_HELPER_H
#define EXPORTER_HELPER_H
#include <map>
#include <set>
#include <string>
#include <vector>

#include "GDCore/String.h"
namespace gd {
class Project;
class Layout;
class ExternalLayout;
class SerializerElement;
class AbstractFileSystem;
class ResourcesManager;
}  // namespace gd
class wxProgressDialog;

namespace gdjs {

/**
 * \brief The options used to export a project for a preview.
 */
struct PreviewExportOptions {
  /**
   * \param project_ The project to export
   * \param exportPath_ The path in the filesystem where to export the files
   */
  PreviewExportOptions(gd::Project &project_, const gd::String &exportPath_)
      : project(project_),
        exportPath(exportPath_),
        projectDataOnlyExport(false),
        fullLoadingScreen(false),
        nonRuntimeScriptsCacheBurst(0){};

  /**
   * \brief Set the address of the debugger server that the game should reach
   * out to, using WebSockets.
   */
  PreviewExportOptions &SetDebuggerServerAddress(const gd::String &address,
                                                 const gd::String &port) {
    debuggerServerAddress = address;
    debuggerServerPort = port;
    return *this;
  }

  /**
   * \brief Set the layout to be run first in the previewed game
   */
  PreviewExportOptions &SetLayoutName(const gd::String &layoutName_) {
    layoutName = layoutName_;
    return *this;
  }

  /**
   * \brief Set the (optional) external layout to be instanciated in the scene
   * at the beginning of the previewed game.
   */
  PreviewExportOptions &SetExternalLayoutName(
      const gd::String &externalLayoutName_) {
    externalLayoutName = externalLayoutName_;
    return *this;
  }

  /**
   * \brief Set the hash associated to an include file. Useful for the preview
   * hot-reload, to know if a file changed.
   */
  PreviewExportOptions &SetIncludeFileHash(const gd::String &includeFile,
                                           int hash) {
    includeFileHashes[includeFile] = hash;
    return *this;
  }

  /**
   * \brief Set if the export should only export the project data, not
   * exporting events code.
   */
  PreviewExportOptions &SetProjectDataOnlyExport(bool enable) {
    projectDataOnlyExport = enable;
    return *this;
  }

  /**
   * \brief Set if the export should show the full loading screen (false
   * by default, skipping the minimum duration and GDevelop logo).
   */
  PreviewExportOptions &SetFullLoadingScreen(bool enable) {
    fullLoadingScreen = enable;
    return *this;
  }

  /**
   * \brief If set to a non zero value, the exported script URLs will have an
   * extra search parameter added (with the given value) to ensure browser cache
   * is bypassed when they are loaded.
   */
  PreviewExportOptions &SetNonRuntimeScriptsCacheBurst(unsigned int value) {
    nonRuntimeScriptsCacheBurst = value;
    return *this;
  }

  gd::Project &project;
  gd::String exportPath;
  gd::String debuggerServerAddress;
  gd::String debuggerServerPort;
  gd::String layoutName;
  gd::String externalLayoutName;
  std::map<gd::String, int> includeFileHashes;
  bool projectDataOnlyExport;
  bool fullLoadingScreen;
  unsigned int nonRuntimeScriptsCacheBurst;
};

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based
 * game.
 */
class ExporterHelper {
 public:
  ExporterHelper(gd::AbstractFileSystem &fileSystem,
                 gd::String gdjsRoot_,
                 gd::String codeOutputDir);
  virtual ~ExporterHelper(){};

  /**
   * \brief Return the error that occurred during the last export.
   */
  const gd::String &GetLastError() const { return lastError; };

  /**
   * \brief Export a project to JSON
   *
   * \param fs The abstract file system to use to write the file
   * \param project The project to be exported.
   * \param filename The filename where export the project
   * \param runtimeGameOptions The content of the extra configuration to store
   * in gdjs.runtimeGameOptions \return Empty string if everthing is ok,
   * description of the error otherwise.
   */
  static gd::String ExportProjectData(
      gd::AbstractFileSystem &fs,
      const gd::Project &project,
      gd::String filename,
      const gd::SerializerElement &runtimeGameOptions);

  /**
   * \brief Copy all the resources of the project to to the export directory,
   * updating the resources filenames.
   *
   * \param fs The abstract file system to use
   * \param project The project with resources to be exported.
   * \param exportDir The directory where the preview must be created.
   * \param progressDlg Optional wxProgressDialog which will be updated with the
   * progress.
   */
  static void ExportResources(gd::AbstractFileSystem &fs,
                              gd::Project &project,
                              gd::String exportDir);

  /**
   * \brief Add libraries files from Pixi.js to the list of includes.
   */
  void AddLibsInclude(bool pixiRenderers,
                      bool websocketDebuggerClient,
                      gd::String gdevelopLogoStyle,
                      std::vector<gd::String> &includesFiles);

  /**
   * \brief Remove include files that are Pixi renderers.
   */
  void RemoveIncludes(bool pixiRenderers,
                      std::vector<gd::String> &includesFiles);

  /**
   * \brief Copy all the specified files to the
   * export directory. Relative files are copied from "<GDJS root>/Runtime"
   * directory.
   *
   * \param includesFiles A vector with filenames to be copied.
   * \param exportDir The directory where the files must be copied.
   * \param exportSourceMaps Should the source maps be copied? Should be true on
   * previews only.
   */
  bool ExportIncludesAndLibs(const std::vector<gd::String> &includesFiles,
                             gd::String exportDir,
                             bool exportSourceMaps);

  /**
   * \brief Generate the events JS code, and save them to the export directory.
   *
   * Files are named "codeX.js", X being the number of the layout in the
   * project. \param project The project with resources to be exported. \param
   * outputDir The directory where the events code must be generated. \param
   * includesFiles A reference to a vector that will be filled with JS files to
   * be exported along with the project. ( including "codeX.js" files ).
   */
  bool ExportEventsCode(gd::Project &project,
                        gd::String outputDir,
                        std::vector<gd::String> &includesFiles,
                        bool exportForPreview);

  /**
   * \brief Add the project effects include files.
   */
  bool ExportEffectIncludes(gd::Project &project,
                            std::vector<gd::String> &includesFiles);

  /**
   * \brief Add the include files for all the objects of the project
   * and their behaviors.
   */
  void ExportObjectAndBehaviorsIncludes(gd::Project &project,
                                        std::vector<gd::String> &includesFiles);

  /**
   * \brief Copy the external source files used by the game into the export
   * directory, and add them into files to be included.
   *
   * Files are named "ext-codeX.js", X being the index of the external source
   * file in the project. \param project The project with resources to be
   * exported. \param outputDir The directory where the events code must be
   * generated. \param includesFiles A reference to a vector that will be filled
   * with JS files to be exported along with the project. (including
   * "ext-codeX.js" files).
   */
  bool ExportExternalSourceFiles(gd::Project &project,
                                 gd::String outputDir,
                                 std::vector<gd::String> &includesFiles);

  /**
   * \brief Generate the standard index file and save it to the export
   * directory.
   *
   * The includes files must be relative to the export directory.
   *
   * \param project The project with layouts to be exported.
   * \param source The file to be used as a template for the final file.
   * \param exportDir The directory where the preview must be created.
   * \param includesFiles The JS files to be included in the HTML file. Order is
   * important.
   * \param nonRuntimeScriptsCacheBurst If non zero, add an additional cache
   * bursting parameter to scripts, that are not part of the runtime/extensions,
   * to force the browser to reload them.
   * \param additionalSpec JSON string that will be passed to the
   * gdjs.RuntimeGame object.
   */
  bool ExportPixiIndexFile(const gd::Project &project,
                           gd::String source,
                           gd::String exportDir,
                           const std::vector<gd::String> &includesFiles,
                           unsigned int nonRuntimeScriptsCacheBurst,
                           gd::String additionalSpec = "");

  /**
   * \brief Replace the annotations in a index.html file by the specified
   * content.
   *
   * \param indexFileContent The source of the index.html file.
   * \param exportDir The directory where the project must be generated.
   * \param includesFiles "<!--GDJS_CODE_FILES -->" will be
   * replaced by HTML tags to include the filenames
   * contained inside the vector.
   * \param nonRuntimeScriptsCacheBurst If non zero, add an additional cache
   * bursting parameter to scripts, that are not part of the runtime/extensions,
   * to force the browser to reload them.
   * \param additionalSpec The string "GDJS_ADDITIONAL_SPEC"
   * surrounded by comments marks will be replaced by the
   * content of this string.
   */
  bool CompleteIndexFile(gd::String &indexFileContent,
                         gd::String exportDir,
                         const std::vector<gd::String> &includesFiles,
                         unsigned int nonRuntimeScriptsCacheBurst,
                         gd::String additionalSpec);

  /**
   * \brief Generate the Cordova configuration file and save it to the export
   * directory.
   *
   * \param project The project to be used to generate the configuration file.
   * \param exportDir The directory where the config.xml must be created.
   */
  bool ExportCordovaFiles(const gd::Project &project,
                          gd::String exportDir,
                          std::set<gd::String> usedExtensions);

  /**
   * \brief Generate the Electron files for packaging and save it to the export
   * directory.
   *
   * \param project The project to be used to generate the files.
   * \param exportDir The directory where the files must be created.
   */
  bool ExportElectronFiles(const gd::Project &project,
                           gd::String exportDir,
                           std::set<gd::String> usedExtensions);

  /**
   * \brief Generate the Facebook Instant Games files for packaging and save it
   * to the export directory.
   *
   * \param project The project to be used to generate the files.
   * \param exportDir The directory where the files must be created.
   */
  bool ExportFacebookInstantGamesFiles(const gd::Project &project,
                                       gd::String exportDir);

  /**
   * \brief Create a preview for the specified options.
   * \note The preview is not launched, it is the caller responsibility to open
   * a browser pointing to the preview.
   *
   * \param options The options to generate the preview.
   */
  bool ExportProjectForPixiPreview(const PreviewExportOptions &options);

  /**
   * \brief Given an include file, returns the name of the file to reference
   * in the exported game.
   */
  gd::String GetExportedIncludeFilename(
      const gd::String &include, unsigned int nonRuntimeScriptsCacheBurst = 0);

  /**
   * \brief Change the directory where code files are generated.
   *
   * By default, this is set to a temporary directory.
   */
  void SetCodeOutputDirectory(gd::String codeOutputDir_) {
    codeOutputDir = codeOutputDir_;
  }

  static void AddDeprecatedFontFilesToFontResources(
      gd::AbstractFileSystem &fs,
      gd::ResourcesManager &resourcesManager,
      const gd::String &exportDir,
      gd::String urlPrefix = "");

  gd::AbstractFileSystem
      &fs;  ///< The abstract file system to be used for exportation.
  gd::String lastError;  ///< The last error that occurred.
  gd::String
      gdjsRoot;  ///< The root directory of GDJS, used to copy runtime files.
  gd::String codeOutputDir;  ///< The directory where JS code is outputted. Will
                             ///< be then copied to the final output directory.
};

}  // namespace gdjs
#endif  // EXPORTER_HELPER_H
