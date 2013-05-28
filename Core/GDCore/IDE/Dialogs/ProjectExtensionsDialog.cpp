/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ProjectExtensionsDialog.h"

//(*InternalHeaders(ProjectExtensionsDialog)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <stdio.h>
#include <fstream>
#include <sys/types.h>
#include <dirent.h>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <wx/clntdata.h>

#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/Tools/HelpFileAccess.h"

using namespace std;

namespace gd
{

//(*IdInit(ProjectExtensionsDialog)
const long ProjectExtensionsDialog::ID_STATICBITMAP3 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT1 = wxNewId();
const long ProjectExtensionsDialog::ID_PANEL1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICLINE1 = wxNewId();
const long ProjectExtensionsDialog::ID_CHECKLISTBOX1 = wxNewId();
const long ProjectExtensionsDialog::ID_TEXTCTRL2 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT5 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT3 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT6 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT4 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT7 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP2 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP4 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT8 = wxNewId();
const long ProjectExtensionsDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICBITMAP5 = wxNewId();
const long ProjectExtensionsDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long ProjectExtensionsDialog::ID_STATICTEXT2 = wxNewId();
const long ProjectExtensionsDialog::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectExtensionsDialog,wxDialog)
	//(*EventTable(ProjectExtensionsDialog)
	//*)
END_EVENT_TABLE()

ProjectExtensionsDialog::ProjectExtensionsDialog(wxWindow* parent, gd::Project & project_) :
project(project_)
{
	//(*Initialize(ProjectExtensionsDialog)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Use extension modules for Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/extension64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Game Develop can use extensions to increase or simplify the creation possibilities.\nCheck extensions you want to use in your game."), wxDefaultPosition, wxDefaultSize, wxALIGN_LEFT, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel1);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer12->AddGrowableRow(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Extensions available :"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	ExtensionsList = new wxCheckListBox(this, ID_CHECKLISTBOX1, wxDefaultPosition, wxSize(294,281), 0, 0, 0, wxDefaultValidator, _T("ID_CHECKLISTBOX1"));
	FlexGridSizer2->Add(ExtensionsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(1);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Information about the extension"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL2, _("No information about the extension."), wxDefaultPosition, wxSize(331,43), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer7->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	FlexGridSizer8->AddGrowableRow(0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT5, _("Author :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer8->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	authorTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont authorTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	authorTxt->SetFont(authorTxtFont);
	FlexGridSizer8->Add(authorTxt, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	FlexGridSizer9->AddGrowableRow(0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT6, _("License :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer9->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	licenseTxt = new wxStaticText(this, ID_STATICTEXT4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	wxFont licenseTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	licenseTxt->SetFont(licenseTxtFont);
	FlexGridSizer9->Add(licenseTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer10->AddGrowableRow(0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT7, _("Compatibility :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	wincompatibleBmp = new wxStaticBitmap(this, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/win-compatible.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer10->Add(wincompatibleBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	linuxcompatibleBmp = new wxStaticBitmap(this, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/linux-compatible.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
	FlexGridSizer10->Add(linuxcompatibleBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	maccompatibleBmp = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/mac-compatible.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer10->Add(maccompatibleBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("More extensions"));
	FlexGridSizer11 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(this, ID_STATICTEXT8, _("A list of extensions provided by others developers is available on the wiki :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer11->Add(StaticText6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Go to the wiki unofficial extensions page"), _("http://compilgames.net/wiki/doku.php/game_develop/extensions"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer11->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer12->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP5, wxBitmap(wxImage(_T("res/helpicon.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Close and reopen scene editors so as to take in account newly added extensions."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON3, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(FermerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_CHECKLISTBOX1,wxEVT_COMMAND_LISTBOX_SELECTED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnExtensionsListSelect);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ProjectExtensionsDialog::OnhelpBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ProjectExtensionsDialog::OnFermerBtClick);
	//*)

    FlexGridSizer10->Show(false); //Cross compilation is not available and so the bitmaps are not relevant.

	UpdateList();
}

ProjectExtensionsDialog::~ProjectExtensionsDialog()
{
	//(*Destroy(ProjectExtensionsDialog)
	//*)
}

void ProjectExtensionsDialog::UpdateList()
{
    ExtensionsList->Clear();

    const vector < boost::shared_ptr<PlatformExtension> > & extensionsInstalled = project.GetCurrentPlatform().GetAllPlatformExtensions();

    //Create the list of available extensions
    for (unsigned int i = 0;i<extensionsInstalled.size();++i)
    {
        wxStringClientData * associatedData = new wxStringClientData(extensionsInstalled[i]->GetName());

        if ( extensionsInstalled[i]->GetName().find("Builtin") < extensionsInstalled[i]->GetName().length() )
            ExtensionsList->Insert(extensionsInstalled[i]->GetFullName(), ExtensionsList->GetCount(), associatedData);
        else
            ExtensionsList->Insert(extensionsInstalled[i]->GetFullName(), 0, associatedData);

    }

    //Check used extensions
    for (unsigned int i =0;i<ExtensionsList->GetCount();++i)
    {
        wxStringClientData * associatedData = dynamic_cast<wxStringClientData*>(ExtensionsList->GetClientObject(i));
        if (associatedData)
        {
            if ( find(  project.GetUsedExtensions().begin(),
                        project.GetUsedExtensions().end(),
                        associatedData->GetData()) != project.GetUsedExtensions().end() )
            {
                ExtensionsList->Check(i, true);
            }
        }
    }
}

/**
 * Display information about an extension when selecting one.
 */
void ProjectExtensionsDialog::OnExtensionsListSelect(wxCommandEvent& event)
{
    int id = event.GetSelection();
    wxStringClientData * associatedData = dynamic_cast<wxStringClientData*>(ExtensionsList->GetClientObject(id));
    if (associatedData == NULL) return;

    const vector < boost::shared_ptr<PlatformExtension> > & extensionsInstalled = project.GetCurrentPlatform().GetAllPlatformExtensions();

    for (unsigned int i = 0;i<extensionsInstalled.size();++i)
    {
        if ( extensionsInstalled[i]->GetName() == associatedData->GetData() )
        {
            infoEdit->ChangeValue(extensionsInstalled[i]->GetDescription());
            authorTxt->SetLabel(extensionsInstalled[i]->GetAuthor());
            licenseTxt->SetLabel(extensionsInstalled[i]->GetLicense());

            {
                std::ifstream testFile( string("ProjectExtensionsDialog/"+extensionsInstalled[i]->GetName()+".xgdw").c_str() );
                if ( testFile || ( extensionsInstalled[i]->IsBuiltin() ) ) //Use namespace to check if it is a builtin extension
                    wincompatibleBmp->SetBitmap(wxBitmap(_T("res/win-compatible.png"), wxBITMAP_TYPE_ANY));
                else
                    wincompatibleBmp->SetBitmap(wxBitmap(_T("res/win-notcompatible.png"), wxBITMAP_TYPE_ANY));
            }

            {
                std::ifstream testFile( string("ProjectExtensionsDialog/"+extensionsInstalled[i]->GetName()+".xgdl").c_str() );
                if ( testFile || ( extensionsInstalled[i]->IsBuiltin() ) ) //Use namespace to check if it is a builtin extension
                    linuxcompatibleBmp->SetBitmap(wxBitmap(_T("res/linux-compatible.png"), wxBITMAP_TYPE_ANY));
                else
                    linuxcompatibleBmp->SetBitmap(wxBitmap(_T("res/linux-notcompatible.png"), wxBITMAP_TYPE_ANY));
            }

            {
                std::ifstream testFile( string("ProjectExtensionsDialog/"+extensionsInstalled[i]->GetName()+".xgdm").c_str() );
                if ( testFile || ( extensionsInstalled[i]->IsBuiltin() ) ) //Use namespace to check if it is a builtin extension
                    maccompatibleBmp->SetBitmap(wxBitmap(_T("res/mac-compatible.png"), wxBITMAP_TYPE_ANY));
                else
                    maccompatibleBmp->SetBitmap(wxBitmap(_T("res/mac-notcompatible.png"), wxBITMAP_TYPE_ANY));
            }

            return;
        }
    }
}

/**
 * Close dialog and save extensions used
 */
void ProjectExtensionsDialog::OnFermerBtClick(wxCommandEvent& event)
{
    project.GetUsedExtensions().clear();

    for (unsigned int i =0;i<ExtensionsList->GetCount();++i)
    {
    	if ( ExtensionsList->IsChecked(i) )
        {
            wxStringClientData * associatedData = dynamic_cast<wxStringClientData*>(ExtensionsList->GetClientObject(i));

            if (associatedData)
                project.GetUsedExtensions().push_back(string(associatedData->GetData().mb_str()));
        }
    }

    EndModal(0);
}

void ProjectExtensionsDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/extensions"));
}

}
