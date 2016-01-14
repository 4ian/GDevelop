/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_PROJECTEXPORTER_H
#define GDCORE_PROJECTEXPORTER_H
#include "GDCore/String.h"
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
    virtual gd::String GetProjectExportButtonLabel() { return ""; }
};

}

#endif // GDCORE_PROJECTEXPORTER_H
