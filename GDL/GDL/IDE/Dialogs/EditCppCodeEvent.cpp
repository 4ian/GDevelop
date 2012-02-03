#include "EditCppCodeEvent.h"

//(*InternalHeaders(EditCppCodeEvent)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/textfile.h>
#include "GDL/Game.h"
#include "GDL/SourceFile.h"
#include "GDL/Scene.h"
#include "GDL/CppCodeEvent.h"
#include "GDL/CommonTools.h"

//(*IdInit(EditCppCodeEvent)
const long EditCppCodeEvent::ID_STATICBITMAP3 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT3 = wxNewId();
const long EditCppCodeEvent::ID_PANEL1 = wxNewId();
const long EditCppCodeEvent::ID_STATICLINE2 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT1 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL1 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT2 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL2 = wxNewId();
const long EditCppCodeEvent::ID_STATICLINE1 = wxNewId();
const long EditCppCodeEvent::ID_BUTTON1 = wxNewId();
const long EditCppCodeEvent::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditCppCodeEvent,wxDialog)
	//(*EventTable(EditCppCodeEvent)
	//*)
END_EVENT_TABLE()

EditCppCodeEvent::EditCppCodeEvent(wxWindow* parent, CppCodeEvent & event_, Game & game_, Scene & scene_) :
    editedEvent(event_),
    game(game_),
    scene(scene_)
{
	//(*Initialize(EditCppCodeEvent)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/foreach48.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("C++ code description"), wxDefaultPosition, wxSize(253,60), wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Code"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	codeEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(279,95), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer4->Add(codeEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Label"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer1->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Includes :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer1->Add(StaticText2, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	TextCtrl1 = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer1->Add(TextCtrl1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer5->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(this);
	FlexGridSizer2->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OncancelBtClick);
	//*)

    if ( !editedEvent.GetAssociatedGDManagedSourceFile().empty() )
    {
        wxTextFile file(editedEvent.GetAssociatedGDManagedSourceFile());
        file.Open();
        wxString str;
        for ( str = file.GetFirstLine(); !file.Eof(); str += file.GetNextLine()+"\n" )
            ;

        codeEdit->SetValue(str);
    }
}

EditCppCodeEvent::~EditCppCodeEvent()
{
	//(*Destroy(EditCppCodeEvent)
	//*)
}


void EditCppCodeEvent::OnokBtClick(wxCommandEvent& event)
{
    if ( editedEvent.GetAssociatedGDManagedSourceFile().empty() )
    {
        boost::shared_ptr<GDpriv::SourceFile> associatedSourceFile(new GDpriv::SourceFile);
        associatedSourceFile->SetGDManaged(true);

        //Find a cool and not already used name for our source file.
        unsigned int tries = 0;
        while(find_if(game.externalSourceFiles.begin(), game.externalSourceFiles.end(), bind2nd(GDpriv::ExternalSourceFileHasName(), "GDpriv_userCode_"+ToString(tries)+".cpp"))
              != game.externalSourceFiles.end())
        {
            tries++;
        }

        associatedSourceFile->SetFileName("GDpriv_userCode_"+ToString(tries)+".cpp");
        game.externalSourceFiles.push_back(associatedSourceFile);

        editedEvent.SetAssociatedGDManagedSourceFile(associatedSourceFile->GetFileName());
    }

    wxFile file(editedEvent.GetAssociatedGDManagedSourceFile(), wxFile::write);
    file.Write(codeEdit->GetValue());

    EndModal(1);
}

void EditCppCodeEvent::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}
