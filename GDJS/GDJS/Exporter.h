/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
namespace gd { class AbstractFileSystem; }
class wxProgressDialog;

namespace gdjs
{

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based game.
 */
class Exporter : public gd::ProjectExporter
{
public:
    Exporter(gd::AbstractFileSystem & fileSystem) : fs(fileSystem) {};
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
    bool ExportLayoutForPreview(gd::Project & project, gd::Layout & layout, gd::String exportDir);

    /**
     * \brief Export the specified project.
     *
     * Called by ShowProjectExportDialog if the user clicked on Ok.
     */
    bool ExportWholeProject(gd::Project & project, gd::String exportDir,
        bool minify, bool exportForCocoonJS, bool exportForCordova);

    /**
     * \brief Return the error that occurred during the last export.
     */
    const gd::String & GetLastError() const { return lastError; };

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Try to locate the Node.js executable. (Node must be installed in a standard folder).
     * \return An empty string if not found, a full path to the node executable otherwise.
     */
    static gd::String GetNodeExecutablePath();
    #endif

private:

    /**
     * \brief Export a project to JSON
     *
     * \param fs The abstract file system to use to write the file
     * \param project The project to be exported.
     * \param filename The filename where export the project
     * \param wrapIntoVariable If not empty, the resulting json will be wrapped in this javascript
     * variable allowing to use it as a classical javascript object.
     * \return Empty string if everthing is ok, description of the error otherwise.
     */
    static gd::String ExportToJSON(gd::AbstractFileSystem &fs, const gd::Project &project, gd::String filename,
                                          gd::String wrapIntoVariable);

    /**
     * \brief Copy all the resources of the project to to the export directory, updating the resources filenames.
     *
     * \param fs The abstract file system to use
     * \param project The project with resources to be exported.
     * \param exportDir The directory where the preview must be created.
     * \param progressDlg Optional wxProgressDialog which will be updated with the progress.
     */
    static void ExportResources(gd::AbstractFileSystem & fs, gd::Project & project, gd::String exportDir,
        wxProgressDialog * progressDlg = NULL);

    /**
     * \brief Copy all the includes files and the standard libraries files to the export directory.
     *
     * The includes files are also modified so as to be relative to the export directory
     * ( Files with absolute filenames are copied into the export directory and their path are stripped ).
     *
     * \param includesFiles A vector with filenames to be copied.
     * \param exportDir The directory where the preview must be created.
     * \param minify If true, the includes files must be merged into one file using Google Closure Compiler.
     * ( includesFiles parameter will be updated with the new filename )
     */
    bool ExportIncludesAndLibs(std::vector<gd::String> & includesFiles, gd::String exportDir, bool minify);

    /**
     * \brief Generate the events JS code, and save them to the export directory.
     *
     * Files are named "codeX.js", X being the number of the layout in the project.
     * \param project The project with resources to be exported.
     * \param outputDir The directory where the events code must be generated.
     * \param includesFiles A reference to a vector that will be filled with JS files to be exported along with the project.
     * ( including "codeX.js" files ).
     */
    bool ExportEventsCode(gd::Project & project, gd::String outputDir, std::vector<gd::String> & includesFiles);

    /**
     * \brief Copy the external source files used by the game into the export directory, and add them into files
     * to be included.
     *
     * Files are named "ext-codeX.js", X being the index of the external source file in the project.
     * \param project The project with resources to be exported.
     * \param outputDir The directory where the events code must be generated.
     * \param includesFiles A reference to a vector that will be filled with JS files to be exported along with the project.
     * (including "ext-codeX.js" files).
     */
    bool ExportExternalSourceFiles(gd::Project & project, gd::String outputDir, std::vector<gd::String> & includesFiles);

    /**
     * \brief Generate the standard index file and save it to the export directory.
     *
     * The includes files must be relative to the export directory.
     *
     * \param project The project with layouts to be exported.
     * \param source The file to be used as a template for the final file.
     * \param exportDir The directory where the preview must be created.
     * \param includesFiles The JS files to be included in the HTML file. Order is important.
     * \param additionalSpec JSON string that will be passed to the gdjs.RuntimeGame object.
     */
    bool ExportIndexFile(gd::String source, gd::String exportDir, const std::vector<gd::String> & includesFiles, gd::String additionalSpec = "");

    /**
     * \brief Replace the annotations in a index.html file by the specified content.
     *
     * \param indexFileContent The source of the index.html file.
     * \param customCss "<!-- GDJS_CUSTOM_STYLE -->" will be replaced by the content of the string.
     * \param customHtml "<!-- GDJS_CUSTOM_HTML -->" will be replaced by the content of the string.
     * \param exportDir The directory where the project must be generated.
     * \param codeFilesIncludes "<!-- GDJS_CODE_FILES -->" will be replaced by HTML tags to include the filenames contained inside the vector.
     * \param additionalSpec The string "GDJS_ADDITIONAL_SPEC" surrounded by comments marks will be replaced by the content of the string.
     */
    bool CompleteIndexFile(gd::String & indexFileContent, gd::String customCss, gd::String customHtml, gd::String exportDir, const std::vector<gd::String> & includesFiles, gd::String additionalSpec);

    /**
     * \brief Generate the Cordova configuration file and save it to the export directory.
     *
     * \param project The project to be used to generate the configuration file.
     * \param exportDir The directory where the config.xml must be created.
     */
    bool ExportCordovaConfigFile(const gd::Project & project, gd::String exportDir);

    gd::AbstractFileSystem & fs; ///< The abstract file system to be used for exportation.
    gd::String lastError; ///< The last error that occurred.
};

}
#endif // EXPORTER_H
