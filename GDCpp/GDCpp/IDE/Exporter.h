#if !defined(EMSCRIPTEN)
#ifndef EXPORTER_H
#define EXPORTER_H
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ProjectExporter.h"

/**
 * \brief The class exposing to the IDE the functions to export a game.
 */
class Exporter : public gd::ProjectExporter
{
public:
    Exporter() {};
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
};

#endif
#endif // EXPORTER_H
#endif