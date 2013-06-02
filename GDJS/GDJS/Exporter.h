/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EXPORTER_H
#define EXPORTER_H
namespace gd { class Project; }
namespace gd { class Layout; }

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based game.
 */
class Exporter
{
public:
    Exporter(gd::Project & project_) : project(project_) {};
    virtual ~Exporter();

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
    static gd::Project StripProject(const gd::Project & project, std::string layout);

    /**
     * \brief Copy all the resources of the project to to the export directory, updating the resources filenames.
     *
     * \param project The project with resources to be exported.
     * \param exportDir The directory where the preview must be created.
     */
    static void ExportResources(gd::Project & project, std::string exportDir);

    gd::Project & project; ///< The project being exported.
    std::string lastError; ///< The last error that occurred.
};

#endif // EXPORTER_H
