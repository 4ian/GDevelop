/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
//(*InternalHeaders(MessagePlus)
#include <wx/artprov.h>
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <string>
#include <vector>
#include <iostream>

#ifdef DEBUG

#endif

#include "MessagePlus.h"

using namespace std;

//(*IdInit(MessagePlus)
const long MessagePlus::ID_STATICBITMAP1 = wxNewId();
const long MessagePlus::ID_STATICTEXT1 = wxNewId();
const long MessagePlus::ID_PANEL1 = wxNewId();
const long MessagePlus::ID_STATICLINE1 = wxNewId();
const long MessagePlus::ID_CHECKBOX1 = wxNewId();
const long MessagePlus::ID_BUTTON1 = wxNewId();
const long MessagePlus::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(MessagePlus,wxDialog)
	//(*EventTable(MessagePlus)
	//*)
END_EVENT_TABLE()

MessagePlus::MessagePlus(wxWindow* parent, wxString message, int type, string pcheminOptions) :
cheminOptions(pcheminOptions)
{
	//(*Initialize(MessagePlus)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Veuillez choisir"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_QUESTION")),wxART_MAKE_CLIENT_ID_FROM_STR(wxString(_T("wxART_MESSAGE_BOX")))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer2->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Message"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	CheckBox1 = new wxCheckBox(this, ID_CHECKBOX1, _("Ne plus poser cette question"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	CheckBox1->SetValue(false);
	FlexGridSizer3->Add(CheckBox1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Button1 = new wxButton(this, ID_BUTTON1, _("Oui"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(Button1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	Button2 = new wxButton(this, ID_BUTTON2, _("Non"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MessagePlus::OnButton1Click);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MessagePlus::OnButton2Click);
	//*)

	StaticText1->SetLabel(message);
	if ( type == 1 )
	{
	    StaticBitmap1->SetBitmap(wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_QUESTION"))));
    }

}

MessagePlus::~MessagePlus()
{
	//(*Destroy(MessagePlus)
	//*)
}


void MessagePlus::OnButton1Click(wxCommandEvent& event)
{
    //Si toujours est coché, on ajoute aux préférence O(UI)
    if ( CheckBox1->GetValue() )
    {
        wxConfigBase *pConfig = wxConfigBase::Get();
        wxString result;
        pConfig->Write( cheminOptions, "Y" );
    }


    EndModal(wxID_YES);
}

void MessagePlus::OnButton2Click(wxCommandEvent& event)
{
    //Si toujours est coché, on ajoute aux préférence N(ON)
    if ( CheckBox1->GetValue() )
    {
        wxConfigBase *pConfig = wxConfigBase::Get();
        wxString result;
        pConfig->Write( cheminOptions, "N" );
    }

    EndModal(wxID_NO);
}


////////////////////////////////////////////////////////////
/// Test si on doit faire toujours quelquechose
////////////////////////////////////////////////////////////
int MessagePlus::Check()
{
    //On vérifie si une valeur n'est pas déjà enregistrée
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;
    pConfig->Read( cheminOptions, &result );
    if ( result == "Y" )
    {
        return wxID_YES;
    }
    if ( result == "N" )
    {
        return wxID_NO;
    }

    return 0;
}
