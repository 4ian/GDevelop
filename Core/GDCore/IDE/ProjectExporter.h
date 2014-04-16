/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#ifndef GDCORE_PROJECTEXPORTER_H
#define GDCORE_PROJECTEXPORTER_H
#include <string>
namespace gd { class Project; }

namespace gd
{

/**
 * \brief Base class allowing platform to expose their functions used to
 * export a project.
 */
class ProjectExporter
{
public:
    ProjectExporter() {};
    virtual ~ProjectExporter() {};

    /**
     * \brief Must show a dialog that will enable the user to export the project.
     *
     * \note Default implementation does nothing.
     */
    virtual void ShowProjectExportDialog(gd::Project & project) {};

    /**
     * \brief Must return the label that will be displayed on the button or menu item
     * allowing the user to export the project for a platform.
     *
     * \note If nothing is returned ( Default implementation ), no button will be shown.
     */
    virtual std::string GetProjectExportButtonLabel() { return ""; }
};

}

#endif // GDCORE_PROJECTEXPORTER_H
#endif