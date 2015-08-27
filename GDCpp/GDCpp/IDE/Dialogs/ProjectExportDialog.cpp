/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
//(*InternalHeaders(ProjectExportDialog)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/textctrl.h>
#include <wx/icon.h>
#include <wx/image.h>
#include <wx/bitmap.h>
#include <wx/filefn.h>
#include "GDCore/Tools/Log.h"
#include <wx/msgdlg.h>
#include <wx/dir.h>
#include <wx/help.h>
#include <wx/config.h>
#include <wx/dirdlg.h>
#include <wx/filedlg.h>
#include <wx/msgdlg.h>
#include <wx/filename.h>
#include <string>
#include <vector>
#include <iostream>
#include <fstream>

#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/wxTools/ShowFolder.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"
#include "GDCpp/IDE/FullProjectCompiler.h"
#include "GDCpp/DatFile.h"
#include "ProjectExportDialog.h"
#include "CompilationErrorDialog.h"

using namespace std;
using namespace gd;

//(*IdInit(ProjectExportDialog)
const long ProjectExportDialog::ID_GAUGE1 = wxNewId();
const long ProjectExportDialog::ID_BUTTON1 = wxNewId();
const long ProjectExportDialog::ID_STATICTEXT2 = wxNewId();
const long ProjectExportDialog::ID_STATICTEXT1 = wxNewId();
const long ProjectExportDialog::ID_TEXTCTRL1 = wxNewId();
const long ProjectExportDialog::ID_BUTTON5 = wxNewId();
const long ProjectExportDialog::ID_STATICLINE2 = wxNewId();
const long ProjectExportDialog::ID_STATICBITMAP2 = wxNewId();
const long ProjectExportDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long ProjectExportDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE( ProjectExportDialog, wxDialog )
    //(*EventTable(ProjectExportDialog)
    //*)
END_EVENT_TABLE()

ProjectExportDialog::ProjectExportDialog( wxWindow* parent, gd::Project & gameToCompile_ ) :
    gameToCompile(gameToCompile_)
{
    //(*Initialize(ProjectExportDialog)
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer7;
    wxFlexGridSizer* FlexGridSizer8;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("Game compilation"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/compilationicon.png"))));
    SetIcon(FrameIcon);
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(1);
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer10->AddGrowableCol(0);
    FlexGridSizer10->AddGrowableRow(0);
    AvancementGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxSize(238,16), 0, wxDefaultValidator, _T("ID_GAUGE1"));
    FlexGridSizer10->Add(AvancementGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CompilBt = new wxButton(this, ID_BUTTON1, _("Compile"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer10->Add(CompilBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    statusTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer7->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    status2Txt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer7->Add(status2Txt, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Options"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer5->AddGrowableCol(1);
    StaticText4 = new wxStaticText(this, wxID_ANY, _("Export folder:"), wxDefaultPosition, wxDefaultSize, 0, _T("wxID_ANY"));
    FlexGridSizer5->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer8->AddGrowableCol(0);
    FlexGridSizer8->AddGrowableRow(0);
    dirEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer8->Add(dirEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    browseBt = new wxButton(this, ID_BUTTON5, _("..."), wxDefaultPosition, wxSize(30,23), 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer8->Add(browseBt, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer2->AddGrowableRow(0);
    StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
    FlexGridSizer2->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
    HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
    FlexGridSizer2->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(FlexGridSizer2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    FermerBt = new wxButton(this, ID_BUTTON2, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer3->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExportDialog::OnCompilBtClick);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExportDialog::OnbrowseBtClick);
    Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ProjectExportDialog::OnAideBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExportDialog::OnFermerBtClick);
    //*)

    dirEdit->AutoCompleteDirectories();
    if ( wxDirExists(gameToCompile.GetLastCompilationDirectory()) )
        dirEdit->SetValue(gameToCompile.GetLastCompilationDirectory());
    else
    {
        dirEdit->SetValue(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(gameToCompile.GetName()));
    }

    if ( gameToCompile.GetLayoutsCount() == 0 )
    {
        CompilBt->Enable(false);
        statusTxt->SetLabel(_("The game is empty: add a scene using the project manager."));
    }
}

wxString ProjectExportDialog::DeleteInvalidCharacters(const wxString & directoryName) const
{
    wxString result = directoryName;
    for (std::size_t i =0;i<result.size();)
    {
        wxChar character = result[i];
        if ( character == '/' || character == '\\' || character == '"' || character == '*' || character == ':' || character == '|' || character == '<' || character == '>' || character == '?' )
            result.erase(result.begin()+i);
        else
            ++i;
    }

    return result;
}

ProjectExportDialog::~ProjectExportDialog()
{
    //(*Destroy(ProjectExportDialog)
    //*)
}

void ProjectExportDialog::OnFermerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

/**
 * Display messages of FullProjectCompiler in compilation dialog
 */
class FullProjectCompilerDialogDiagnosticManager : public GDpriv::FullProjectCompilerDiagnosticManager
{
public:
    FullProjectCompilerDialogDiagnosticManager(wxStaticText * staticText1_, wxStaticText * staticText2_,wxGauge * gauge_, wxString destinationDirectory_) : staticText1(staticText1_), staticText2(staticText2_), gauge(gauge_), destinationDirectory(destinationDirectory_) {}

    virtual void OnCompilationFailed()
    {
        CompilationErrorDialog dialog( NULL, GetErrors() );
        dialog.ShowModal();
    }

    virtual void OnCompilationSucceeded()
    {
        staticText1->SetLabel(_("Compilation finished")); staticText2->SetLabel(_("Compiled project is now available in the export folder."));
        if ( wxMessageBox(_("Compilation achieved. Do you want to open the folder where the project has been compiled\?"), _("Compilation finished"), wxYES_NO) == wxYES )
        {
            gd::ShowFolder(destinationDirectory);
        }
    }
    virtual void OnMessage(gd::String message, gd::String message2) { staticText1->SetLabel(message); staticText2->SetLabel(message2); };
    virtual void OnPercentUpdate(float percents) { gauge->SetValue(percents); };

    wxStaticText * staticText1;
    wxStaticText * staticText2;
    wxGauge * gauge;
    wxString destinationDirectory;
};


void ProjectExportDialog::OnCompilBtClick( wxCommandEvent& event )
{
    if ( dirEdit->GetValue().empty() )
    {
        wxMessageBox(_("You must choose a directory where the project must be exported."), _("Compilation canceled"));
        return;
    }
    if ( !wxDirExists( dirEdit->GetValue() ) && !wxMkdir( dirEdit->GetValue() ) )
    {
        wxMessageBox(_("Unable to create the folder where the project must be compiled. \nPlease ensure that you have sufficient rights to write in this folder."), _("Compilation canceled"), wxICON_ERROR);
        return;
    }

    gameToCompile.SetLastCompilationDirectory(dirEdit->GetValue());

    wxString tempDir;
    wxConfigBase::Get()->Read( _T( "/Dossier/Compilation" ), &tempDir );

    FullProjectCompilerDialogDiagnosticManager diagnosticManager(statusTxt, status2Txt, AvancementGauge, dirEdit->GetValue());
    GDpriv::FullProjectCompiler compilationManager(gameToCompile, diagnosticManager, dirEdit->GetValue());

    compilationManager.SetForcedTempDir(tempDir);
    compilationManager.LaunchProjectCompilation();

    return;
}

void ProjectExportDialog::OnAideBtClick( wxCommandEvent& event )
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/distribution/compilation"));
}

void ProjectExportDialog::OnbrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choose a folder, empty if possible, where create your game."));
    if ( dialog.ShowModal() == wxID_OK )
        dirEdit->SetValue(dialog.GetPath());
}
#endif
