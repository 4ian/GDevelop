/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EXPORTER_H
#define EXPORTER_H
#include <string>
#include <set>
#include "GDCore/IDE/ProjectExporter.h"
namespace gd { class Project; }
namespace gd { class Layout; }

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based game.
 */
class Exporter : public gd::ProjectExporter
{
public:
    Exporter() : project(NULL) {};
    Exporter(gd::Project * project_) : project(project_) {};
    virtual ~Exporter();


    /**
     * \brief Show a dialog that will enable the user to export the project.
     */
    virtual void ShowProjectExportDialog(gd::Project & project);

    /**
     * \brief Return the label that will be displayed on the button or menu item
     * allowing the user to export the project for the JS Platform.
     */
    virtual std::string GetProjectExportButtonLabel();

    /**
     * \brief Create a preview for the specified layout.
     * \note The preview is not launched, it is the caller responsibility to open a browser pointing to the preview.
     *
     * \param layout The layout to be previewed.
     * \param exportDir The directory where the preview must be created.
     * \return true if export was successful.
     */
    bool ExportLayoutForPreview(gd::Layout & layout, std::string exportDir);

    /**
     * \brief Return the error that occurred during the last export.
     */
    const std::string & GetLastError() const { return lastError; };

private:

    /**
     * \brief Create a stripped version of the project for export
     *
     * \param project The project to be stripped.
     * \param layout Optional layout name. If not empty, all layouts will be removed except this layout.
     */
    static gd::Project StripProject(const gd::Project & project, std::string layout = "");

    /**
     * \brief Copy all the resources of the project to to the export directory, updating the resources filenames.
     *
     * \param project The project with resources to be exported.
     * \param exportDir The directory where the preview must be created.
     */
    static void ExportResources(gd::Project & project, std::string exportDir);

    /**
     * \brief Copy all the includes files and the standard libraries files to the export directory.
     *
     * \param includesFiles A set with filenames to be copied.
     * \param exportDir The directory where the preview must be created.
     */
    static void ExportIncludesAndLibs(const std::set<std::string> & includesFiles, std::string exportDir);

    /**
     * \brief Generate the events JS code, and save them to the export directory.
     *
     * Files are named "codeX.js", X being the number of the layout in the project.
     * \param exportDir The directory where the preview must be created.
     * \param includesFiles A reference to a set that will be filled with files to be exported along with the project.
     */
    bool ExportEventsCode(std::string exportDir, std::set<std::string> & includesFiles);

    /**
     * \brief Generate the index file and save it to the export directory.
     *
     * \param project The project with layouts to be exported.
     * \param exportDir The directory where the preview must be created.
     */
    bool ExportIndexFile(gd::Project & project, std::string exportDir);

    gd::Project * project; ///< The project being exported. Can be NULL if no project was set.
    std::string lastError; ///< The last error that occurred.
};

#endif // EXPORTER_H
