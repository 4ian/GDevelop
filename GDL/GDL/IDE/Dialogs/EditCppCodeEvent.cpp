#if defined(GD_IDE_ONLY)
#include "EditCppCodeEvent.h"

//(*InternalHeaders(EditCppCodeEvent)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/textfile.h>
#include <wx/filename.h>
#include <fstream>
#include "GDL/Game.h"
#include "GDL/SourceFile.h"
#include "GDL/Scene.h"
#include "GDL/CppCodeEvent.h"
#include "GDL/CommonTools.h"
#include "GDL/IDE/CodeCompiler.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"

//(*IdInit(EditCppCodeEvent)
const long EditCppCodeEvent::ID_STATICBITMAP3 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT3 = wxNewId();
const long EditCppCodeEvent::ID_PANEL1 = wxNewId();
const long EditCppCodeEvent::ID_STATICLINE2 = wxNewId();
const long EditCppCodeEvent::ID_CHECKBOX2 = wxNewId();
const long EditCppCodeEvent::ID_CHECKBOX1 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL3 = wxNewId();
const long EditCppCodeEvent::ID_BITMAPBUTTON1 = wxNewId();
const long EditCppCodeEvent::ID_CHECKLISTBOX1 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT1 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL1 = wxNewId();
const long EditCppCodeEvent::ID_CHECKBOX3 = wxNewId();
const long EditCppCodeEvent::ID_TEXTCTRL2 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT5 = wxNewId();
const long EditCppCodeEvent::ID_CUSTOM1 = wxNewId();
const long EditCppCodeEvent::ID_STATICTEXT4 = wxNewId();
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
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer14;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;
	wxFlexGridSizer* FlexGridSizer17;
	wxStaticBoxSizer* StaticBoxSizer5;

	Create(parent, wxID_ANY, _("Code C++"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/source_cpp64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Les évènements code C++ permettent de faire appel à une fonction\ncodée en C++, en lui passant au besoin des objets ou une référence\nvers la scène. Vous pouvez également spécifier les fichiers annexes\nà compiler en même temps que la fonction si vous faites appel à des\nfonctionnalités declarées dans ces fichiers."), wxDefaultPosition, wxSize(760,75), 0, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	FlexGridSizer9->AddGrowableRow(0);
	FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer11->AddGrowableCol(0);
	FlexGridSizer11->AddGrowableRow(0);
	FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer12->AddGrowableCol(0);
	FlexGridSizer12->AddGrowableRow(1);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Appel à la fonction"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	sceneRefCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Passer une réfèrence vers la scène"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	sceneRefCheck->SetValue(true);
	FlexGridSizer7->Add(sceneRefCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	objectsListCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Passer une liste de pointeurs vers les objets :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	objectsListCheck->SetValue(false);
	FlexGridSizer8->Add(objectsListCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer13->AddGrowableCol(1);
	FlexGridSizer13->Add(15,15,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectPassedAsParameterEdit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(111,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer13->Add(objectPassedAsParameterEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectBt = new wxBitmapButton(this, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/objeticon.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	objectBt->SetDefault();
	FlexGridSizer13->Add(objectBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Dépendances"));
	FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer14->AddGrowableCol(0);
	FlexGridSizer14->AddGrowableRow(0);
	dependenciesList = new wxCheckListBox(this, ID_CHECKLISTBOX1, wxDefaultPosition, wxSize(224,129), 0, 0, 0, wxDefaultValidator, _T("ID_CHECKLISTBOX1"));
	FlexGridSizer14->Add(dependenciesList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer4->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Affichage de l\'éditeur d\'évènements"));
	FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer15->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Nom/Commentaire affiché pour l\'évènement :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer15->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	displayedNameEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(209,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer15->Add(displayedNameEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	displayCodeCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Afficher le code dans l\'éditeur d\'évènements"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	displayCodeCheck->SetValue(false);
	FlexGridSizer15->Add(displayCodeCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer5->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer12->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer10->AddGrowableCol(0);
	FlexGridSizer10->AddGrowableRow(1);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Fichiers d\'entête"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	includeTextCtrl = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer1->Add(includeTextCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer10->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(1);
	functionPrototypeTxt = new wxStaticText(this, ID_STATICTEXT5, _("void Function()\n{"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer4->Add(functionPrototypeTxt, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	codeEdit = new wxStyledTextCtrl(this,ID_CUSTOM1,wxDefaultPosition,wxSize(460,40),0,_T("ID_CUSTOM1"));
	FlexGridSizer4->Add(codeEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("}"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxBOTTOM|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer10->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer9->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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

	Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnsceneRefCheckClick);
	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnobjectsListCheckClick);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnobjectBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditCppCodeEvent::OncancelBtClick);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&EditCppCodeEvent::UpdateTextCtrl);

	codeEdit->SetLexer(wxSTC_LEX_CPP);
	codeEdit->StyleSetForeground(4, *wxBLACK); //Numbers
	codeEdit->StyleSetForeground(10, *wxRED); //Operators
	codeEdit->StyleSetForeground(6, *wxBLUE); //String
	codeEdit->StyleSetForeground(5, wxColour(0,28,158)); //(Key)Word
	codeEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	codeEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace

    //Load values from the event
    codeEdit->SetText(editedEvent.GetInlineCode());
    for (unsigned int i = 0;i<editedEvent.GetIncludeFiles().size();++i)
    {
        includeTextCtrl->AppendText(editedEvent.GetIncludeFiles()[i]+"\n");
    }
    sceneRefCheck->SetValue(editedEvent.GetPassSceneAsParameter());
    objectsListCheck->SetValue(editedEvent.GetPassObjectListAsParameter());
    objectPassedAsParameterEdit->SetValue(editedEvent.GetObjectToPassAsParameter());
    displayedNameEdit->SetValue(editedEvent.GetDisplayedName());
    displayCodeCheck->SetValue(editedEvent.IsCodeDisplayedInEditor());

    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        if ( game.externalSourceFiles[i]->IsGDManaged() ) continue;

        dependenciesList->Append(game.externalSourceFiles[i]->GetFileName());

        if ( std::find(editedEvent.GetDependencies().begin(), editedEvent.GetDependencies().end(), game.externalSourceFiles[i]->GetFileName() ) != editedEvent.GetDependencies().end() )
            dependenciesList->Check(dependenciesList->GetCount()-1, true);
    }

    UpdateFunctionPrototype();
}

EditCppCodeEvent::~EditCppCodeEvent()
{
	//(*Destroy(EditCppCodeEvent)
	//*)
}


void EditCppCodeEvent::OnokBtClick(wxCommandEvent& event)
{
    editedEvent.SetInlineCode(ToString(codeEdit->GetText()));
    editedEvent.SetFunctionToCall("GDCppCode"+ToString(&editedEvent));
    editedEvent.SetIncludeFiles( SplitString<std::string>(ToString(includeTextCtrl->GetValue()), '\n') );
    editedEvent.SetPassSceneAsParameter( sceneRefCheck->GetValue() );
    editedEvent.SetPassObjectListAsParameter( objectsListCheck->GetValue() );
    editedEvent.SetObjectToPassAsParameter(ToString(objectPassedAsParameterEdit->GetValue()));
    editedEvent.SetDisplayedName(ToString(displayedNameEdit->GetValue()));
    editedEvent.EnableCodeDisplayedInEditor(displayCodeCheck->GetValue());

    std::vector<std::string> dependencies;
    unsigned int listIndex = 0;
    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        if ( game.externalSourceFiles[i]->IsGDManaged() ) continue;

        if ( dependenciesList->IsChecked(listIndex) ) dependencies.push_back(game.externalSourceFiles[i]->GetFileName());
        listIndex++;
    }
    editedEvent.SetDependencies(dependencies);

    //Create a (hidden gd managed) source filed if needed
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

    EndModal(1);
}

void EditCppCodeEvent::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditCppCodeEvent::OnobjectBtClick(wxCommandEvent& event)
{
    gd::ChooseObjectDialog dialog(this, game, scene, true);
    if ( dialog.ShowModal() == 1 )
        objectPassedAsParameterEdit->ChangeValue(dialog.GetChosenObject());

    return;
}

void EditCppCodeEvent::UpdateFunctionPrototype()
{
    functionPrototypeTxt->SetLabel(std::string("void Function(")+ (sceneRefCheck->GetValue() ? std::string("RuntimeScene & scene") :std::string("")) + ((sceneRefCheck->GetValue()&&objectsListCheck->GetValue()) ? ", ":"")+ (objectsListCheck->GetValue() ? std::string("std::vector<Object*> objectsList") :"") + ")\n{");
}

void EditCppCodeEvent::OnobjectsListCheckClick(wxCommandEvent& event)
{
    UpdateFunctionPrototype();
}

void EditCppCodeEvent::OnsceneRefCheckClick(wxCommandEvent& event)
{
    UpdateFunctionPrototype();
}
/**
 * Syntax highlighting
 */
void EditCppCodeEvent::UpdateTextCtrl(wxStyledTextEvent& event)
{
    char currentChar = codeEdit->GetCharAt(codeEdit->GetCurrentPos());
    if ( currentChar != '(' && currentChar != ')')
    {
        codeEdit->BraceHighlight(wxSTC_INVALID_POSITION, wxSTC_INVALID_POSITION);
        return;
    }

    int otherBrace = codeEdit->BraceMatch(codeEdit->GetCurrentPos());

    if ( otherBrace != wxSTC_INVALID_POSITION)
        codeEdit->BraceHighlight(codeEdit->GetCurrentPos(), otherBrace);
    else
        codeEdit->BraceBadLight(codeEdit->GetCurrentPos());
}
#endif

