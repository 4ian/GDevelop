/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ProjectExportDialog.h"

//(*InternalHeaders(ProjectExportDialog)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/dirdlg.h>
#include <wx/filename.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/PlatformDefinition/Project.h"

//(*IdInit(ProjectExportDialog)
const long ProjectExportDialog::ID_GAUGE1 = wxNewId();
const long ProjectExportDialog::ID_BUTTON1 = wxNewId();
const long ProjectExportDialog::ID_STATICTEXT2 = wxNewId();
const long ProjectExportDialog::ID_STATICTEXT1 = wxNewId();
const long ProjectExportDialog::ID_STATICTEXT4 = wxNewId();
const long ProjectExportDialog::ID_TEXTCTRL1 = wxNewId();
const long ProjectExportDialog::ID_BUTTON5 = wxNewId();
const long ProjectExportDialog::ID_STATICLINE2 = wxNewId();
const long ProjectExportDialog::ID_STATICBITMAP2 = wxNewId();
const long ProjectExportDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long ProjectExportDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectExportDialog,wxDialog)
	//(*EventTable(ProjectExportDialog)
	//*)
END_EVENT_TABLE()

ProjectExportDialog::ProjectExportDialog(wxWindow* parent, gd::Project & project)
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

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(0);
	progressGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxSize(238,16), 0, wxDefaultValidator, _T("ID_GAUGE1"));
	FlexGridSizer10->Add(progressGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	exportBt = new wxButton(this, ID_BUTTON1, _("Export"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer10->Add(exportBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	statusTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer7->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	status2Txt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer7->Add(status2Txt, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Options"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer5->AddGrowableCol(1);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Export folder:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
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
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer2->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer2->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	closeBt = new wxButton(this, ID_BUTTON2, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(closeBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExportDialog::OnexportBtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExportDialog::OnbrowseBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ProjectExportDialog::OnhelpBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExportDialog::OncloseBtClick);
	//*)

    dirEdit->AutoCompleteDirectories();
    if ( wxDirExists(project.GetLastCompilationDirectory()) )
        dirEdit->SetValue(project.GetLastCompilationDirectory());
    else
    {
        dirEdit->SetValue(wxFileName::GetHomeDir()+wxFileName::GetPathSeparator()+DeleteInvalidCharacters(project.GetName()));
    }
}

ProjectExportDialog::~ProjectExportDialog()
{
	//(*Destroy(ProjectExportDialog)
	//*)
}


wxString ProjectExportDialog::DeleteInvalidCharacters(const wxString & directoryName) const
{
    wxString result = directoryName;
    for (unsigned int i =0;i<result.size();)
    {
        wxChar character = result[i];
        if ( character == '/' || character == '\\' || character == '"' || character == '*' || character == ':' || character == '|' || character == '<' || character == '>' || character == '?' )
            result.erase(result.begin()+i);
        else
            ++i;
    }

    return result;
}

void ProjectExportDialog::OnexportBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ProjectExportDialog::OncloseBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ProjectExportDialog::OnhelpBtClick(wxCommandEvent& event)
{
    //TODO
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/distribution/compilation"));
}

void ProjectExportDialog::OnbrowseBtClick(wxCommandEvent& event)
{
    wxDirDialog dialog(this, _("Choose a folder, empty if possible, where create your game."));
    if ( dialog.ShowModal() == wxID_OK )
        dirEdit->SetValue(dialog.GetPath());
}
std::string ProjectExportDialog::GetExportDir()
{
    return std::string(dirEdit->GetValue().mb_str());
}
