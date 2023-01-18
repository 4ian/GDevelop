/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EXPORTER_H
#define EXPORTER_H
#include <map>
#include <set>
#include <string>
#include <vector>

#include "GDCore/String.h"
namespace gd {
class Project;
class Layout;
class ExternalLayout;
class AbstractFileSystem;
}  // namespace gd
namespace gdjs {
struct PreviewExportOptions;
struct ExportOptions;
}

namespace gdjs {

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based
 * game.
 */
class Exporter {
 public:
  Exporter(gd::AbstractFileSystem& fileSystem,
           gd::String gdjsRoot_ = "./JsPlatform");
  virtual ~Exporter();

  /**
   * \brief Create a preview for the specified options.
   * \note The preview is not launched, it is the caller responsibility to open
   * a browser pointing to the preview.
   *
   * \param options The options to generate the preview.
   */
  bool ExportProjectForPixiPreview(const PreviewExportOptions& options);

  /**
   * \brief Export the specified project, using Pixi.js.
   *
   * Called by ShowProjectExportDialog if the user clicked on Ok.
   */
  bool ExportWholePixiProject(const ExportOptions& options);

  /**
   * \brief Return the error that occurred during the last export.
   */
  const gd::String& GetLastError() const { return lastError; };

  /**
   * \brief Change the directory where code files are generated.
   *
   * By default, this is set to a temporary directory.
   */
  void SetCodeOutputDirectory(gd::String codeOutputDir_) {
    codeOutputDir = codeOutputDir_;
  }

 private:
  gd::AbstractFileSystem&
      fs;  ///< The abstract file system to be used for exportation.
  gd::String lastError;  ///< The last error that occurred.
  gd::String
      gdjsRoot;  ///< The root directory of GDJS, used to copy runtime files.
  gd::String codeOutputDir;  ///< The directory where JS code is outputted. Will
                             ///< be then copied to the final output directory.
};

}  // namespace gdjs
#endif  // EXPORTER_H
