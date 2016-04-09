#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef COMPILATION_H
#define COMPILATION_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
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
#include "GDCore/Project/Project.h"
#include <string>
#include <vector>
#include <wx/process.h>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "GDCpp/Runtime/String.h"

using namespace std;

/**
 * \brief Dialog used to export a project to a native executable.
 * \ingroup IDE
 */
class ProjectExportDialog: public wxDialog
{
public:

    ProjectExportDialog(wxWindow* parent, gd::Project & gameToCompile_);
    virtual ~ProjectExportDialog();

    //(*Declarations(ProjectExportDialog)
    wxStaticText* statusTxt;
    wxButton* FermerBt;
    wxStaticBitmap* StaticBitmap1;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxStaticText* status2Txt;
    wxStaticLine* StaticLine2;
    wxGauge* AvancementGauge;
    wxButton* browseBt;
    wxStaticText* StaticText4;
    wxTextCtrl* dirEdit;
    wxButton* CompilBt;
    //*)

protected:

    //(*Identifiers(ProjectExportDialog)
    static const long ID_GAUGE1;
    static const long ID_BUTTON1;
    static const long ID_STATICTEXT2;
    static const long ID_STATICTEXT1;
    static const long ID_TEXTCTRL1;
    static const long ID_BUTTON5;
    static const long ID_STATICLINE2;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ProjectExportDialog)
    void OnFermerBtClick(wxCommandEvent& event);
    void OnCompilBtClick(wxCommandEvent& event);
    void OnOuvrirBtClick(wxCommandEvent& event);
    void OnAideBtClick(wxCommandEvent& event);
    void OnNext1Click(wxCommandEvent& event);
    void OnNext2Click(wxCommandEvent& event);
    void OnCGShareBtClick(wxCommandEvent& event);
    void OnDistribuerBtClick(wxCommandEvent& event);
    void OnbrowseBtClick(wxCommandEvent& event);
    //*)
    wxString DeleteInvalidCharacters(const wxString & directoryName) const;

    gd::Project & gameToCompile;

    DECLARE_EVENT_TABLE()
};

#endif
#endif
