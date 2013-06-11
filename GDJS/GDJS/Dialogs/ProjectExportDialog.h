/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef PROJECTEXPORTDIALOG_H
#define PROJECTEXPORTDIALOG_H

//(*Headers(ProjectExportDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/gauge.h>
//*)
#include "GDCore/CommonTools.h"
namespace gd { class Project; }

/**
 * \brief Dialogs shown to setup the export of a project.
 * \note The real work is done in Exporter.
 *
 * \see Exporter
 */
class ProjectExportDialog: public wxDialog
{
public:

    ProjectExportDialog(wxWindow* parent, gd::Project & project);
    virtual ~ProjectExportDialog();

    /**
     * \brief Get the wxWidgets control used to show the export progress.
     */
    wxGauge * GetProgressGauge() { return progressGauge; };

    /**
     * \brief Get the directory where project must be exported.
     */
    std::string GetExportDir();

protected:

    //(*Declarations(ProjectExportDialog)
    wxStaticText* statusTxt;
    wxStaticBitmap* StaticBitmap1;
    wxStaticText* status2Txt;
    wxStaticLine* StaticLine2;
    wxButton* exportBt;
    wxButton* closeBt;
    wxGauge* progressGauge;
    wxButton* browseBt;
    wxHyperlinkCtrl* helpBt;
    wxStaticText* StaticText4;
    wxTextCtrl* dirEdit;
    //*)

    //(*Identifiers(ProjectExportDialog)
    static const long ID_GAUGE1;
    static const long ID_BUTTON1;
    static const long ID_STATICTEXT2;
    static const long ID_STATICTEXT1;
    static const long ID_STATICTEXT4;
    static const long ID_TEXTCTRL1;
    static const long ID_BUTTON5;
    static const long ID_STATICLINE2;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ProjectExportDialog)
    void OnexportBtClick(wxCommandEvent& event);
    void OncloseBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OnbrowseBtClick(wxCommandEvent& event);
    //*)
    wxString DeleteInvalidCharacters(const wxString & directoryName) const;

    DECLARE_EVENT_TABLE()
};

#endif
