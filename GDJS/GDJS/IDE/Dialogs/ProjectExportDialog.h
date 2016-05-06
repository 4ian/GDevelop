/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef PROJECTEXPORTDIALOG_H
#define PROJECTEXPORTDIALOG_H
#include "GDJSDialogs.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"
namespace gd { class Project; }

namespace gdjs
{

/**
 * \brief Dialogs shown to setup the export of a project.
 * \note The real work is done in Exporter.
 *
 * \see Exporter
 */
class ProjectExportDialog : public BaseProjectExportDialog
{
public:
    ProjectExportDialog(wxWindow* parent, gd::Project & project);
    virtual ~ProjectExportDialog();

    enum ExportType
    {
        Pixi,
        PixiCordova,
        Cocos2d
    };

    /**
     * \brief Get the type of the export to be done.
     */
    ExportType GetExportType();

    /**
     * \brief Get the directory where project must be exported.
     */
    gd::String GetExportDir();

    /**
     * \brief Check if the user wants to minify the JS files.
     */
    bool RequestMinify();

    /**
     * \brief Check if the export must be done with debug mode activated.
     */
    bool IsDebugMode();

protected:
    virtual void OnCocosExportBrowseBtClick(wxCommandEvent& event);
    virtual void OnBrowseBtClick(wxCommandEvent& event);
    virtual void OnCloseBtClicked(wxCommandEvent& event);
    virtual void OnExportBtClicked(wxCommandEvent& event);

    wxString DeleteInvalidCharacters(const wxString & directoryName) const;
    gd::Project & project;
    bool hasNode;
};

}
#endif // PROJECTEXPORTDIALOG_H
#endif
