/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef EXPORTER_H
#define EXPORTER_H
#include <vector>
#include <string>
#include <set>
#include "GDCore/IDE/ProjectExporter.h"
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ExternalLayout; }
namespace gd { class AbstractFileSystem; }

namespace gdjs
{

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based game.
 */
class Exporter : public gd::ProjectExporter
{
public:
    Exporter(gd::AbstractFileSystem & fileSystem, gd::String gdjsRoot_ = "./JsPlatform");
    virtual ~Exporter();

    /**
     * \brief Show a dialog that will enable the user to export the project.
     */
    virtual void ShowProjectExportDialog(gd::Project & project);

    /**
     * \brief Return the label that will be displayed on the button or menu item
     * allowing the user to export the project for the JS Platform.
     */
    virtual gd::String GetProjectExportButtonLabel();

    /**
     * \brief Create a preview for the specified layout.
     * \note The preview is not launched, it is the caller responsibility to open a browser pointing to the preview.
     *
     * \param layout The layout to be previewed.
     * \param exportDir The directory where the preview must be created.
     * \return true if export was successful.
     */
    bool ExportLayoutForPixiPreview(gd::Project & project, gd::Layout & layout, gd::String exportDir);

    /**
     * \brief Create a preview for the specified external layout and layout.
     * \note The preview is not launched, it is the caller responsibility to open a browser pointing to the preview.
     *
     * \param layout The layout to be previewed.
     * \param externalLayout The external layout with objects to be created at scene startup.
     * \param exportDir The directory where the preview must be created.
     * \return true if export was successful.
     */
    bool ExportExternalLayoutForPixiPreview(gd::Project & project, gd::Layout & layout,
        gd::ExternalLayout & externalLayout, gd::String exportDir);

    /**
     * \brief Export the specified project, using Pixi.js.
     *
     * Called by ShowProjectExportDialog if the user clicked on Ok.
     */
    bool ExportWholePixiProject(gd::Project & project, gd::String exportDir,
        bool minify, bool exportForCordova);

    /**
     * \brief Export the specified project, using Cocos2d.
     *
     * Called by ShowProjectExportDialog if the user clicked on Ok.
     */
    bool ExportWholeCocos2dProject(gd::Project & project, bool debugMode, gd::String exportDir);

    /**
     * \brief Return the error that occurred during the last export.
     */
    const gd::String & GetLastError() const { return lastError; };

    /**
     * \brief Change the directory where code files are generated.
     *
     * By default, this is set to a temporary directory.
     */
    void SetCodeOutputDirectory(gd::String codeOutputDir_) { codeOutputDir = codeOutputDir_; }

private:
    gd::AbstractFileSystem & fs; ///< The abstract file system to be used for exportation.
    gd::String lastError; ///< The last error that occurred.
    gd::String gdjsRoot; ///< The root directory of GDJS, used to copy runtime files.
    gd::String codeOutputDir; ///< The directory where JS code is outputted. Will be then copied to the final output directory.
};

}
#endif // EXPORTER_H
