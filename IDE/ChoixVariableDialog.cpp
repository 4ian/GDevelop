#include "ChoixVariableDialog.h"

//(*InternalHeaders(ChoixVariableDialog)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/bitmap.h>
#include <wx/image.h>
#include <wx/textdlg.h>
#include <wx/log.h>
#include "GDL/ListVariable.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(ChoixVariableDialog)
const long ChoixVariableDialog::ID_STATICBITMAP1 = wxNewId();
const long ChoixVariableDialog::ID_STATICTEXT6 = wxNewId();
const long ChoixVariableDialog::ID_PANEL2 = wxNewId();
const long ChoixVariableDialog::ID_STATICLINE1 = wxNewId();
const long ChoixVariableDialog::ID_PANEL1 = wxNewId();
const long ChoixVariableDialog::ID_LISTCTRL1 = wxNewId();
const long ChoixVariableDialog::ID_STATICLINE2 = wxNewId();
const long ChoixVariableDialog::ID_BUTTON1 = wxNewId();
const long ChoixVariableDialog::ID_BUTTON3 = wxNewId();
const long ChoixVariableDialog::ID_BUTTON2 = wxNewId();
//*)
const long ChoixVariableDialog::idAddVar = wxNewId();
const long ChoixVariableDialog::idEditVar = wxNewId();
const long ChoixVariableDialog::idDelVar = wxNewId();
const long ChoixVariableDialog::ID_Help = wxNewId();

BEGIN_EVENT_TABLE(ChoixVariableDialog,wxDialog)
	//(*EventTable(ChoixVariableDialog)
	//*)
END_EVENT_TABLE()

ChoixVariableDialog::ChoixVariableDialog(wxWindow* parent, ListVariable & variables_) :
variables(variables_)
{
	//(*Initialize(ChoixVariableDialog)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choisir une variable"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(3);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	Panel2 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	Panel2->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer12->AddGrowableCol(1);
	StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/var64.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer12->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT6, _("Choisissez la variable à utiliser.\nNotez qu\'il n\'est pas obligatoire de déclarer une variable\ndans le tableau pour l\'utiliser. Déclarer une variable dans\nle tableau permet de lui affecter une valeur initiale, et de\npouvoir la retrouver facilement."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT6"));
	FlexGridSizer12->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer12);
	FlexGridSizer12->Fit(Panel2);
	FlexGridSizer12->SetSizeHints(Panel2);
	FlexGridSizer3->Add(Panel2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	toolbarPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(-1,26), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	variablesList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(293,147), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(variablesList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	okBt = new wxButton(this, ID_BUTTON1, _("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxButton(this, ID_BUTTON2, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ChoixVariableDialog::OntoolbarPanelResize,0,this);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&ChoixVariableDialog::OnvariablesListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ChoixVariableDialog::OnvariablesListItemActivated);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixVariableDialog::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixVariableDialog::OncancelBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixVariableDialog::OnhelpBtClick);
	//*)
	Connect(idAddVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChoixVariableDialog::OnAddVarSelected);
	Connect(idDelVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChoixVariableDialog::OnDelVarSelected);
	Connect(idEditVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChoixVariableDialog::OnEditVarSelected);
	Connect(ID_Help,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChoixVariableDialog::OnhelpBtClick);

	variablesList->InsertColumn(0, _("Variable"));
	variablesList->InsertColumn(1, _("Valeur initiale"));;
	variablesList->SetColumnWidth(0, 150);
	variablesList->SetColumnWidth(1, 130);

    toolbar = new wxToolBar( toolbarPanel, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idAddVar, wxT( "Ajouter une variable" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter une variable") );
    toolbar->AddTool( idEditVar, wxT( "Editer la valeur initiale de la variable" ), wxBitmap( wxImage( "res/editicon.png" ) ), _("Editer la valeur initiale de la variable") );
    toolbar->AddTool( idDelVar, wxT( "Supprimer la variable selectionnée" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer la variable selectionnée") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, wxT( "Aide sur les variables initiales" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide sur les variables initiales") );
    toolbar->Realize();

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif

    Refresh();
}

ChoixVariableDialog::~ChoixVariableDialog()
{
	//(*Destroy(ChoixVariableDialog)
	//*)
}

/**
 * Resize toolbar according to the panel size.
 */
void ChoixVariableDialog::OntoolbarPanelResize(wxSizeEvent& event)
{
    toolbar->SetSize(toolbarPanel->GetSize().x, -1);
}

/**
 * Refresh the list with variables.
 */
void ChoixVariableDialog::Refresh()
{
    variablesList->DeleteAllItems();
    const vector<Variable> & variablesVector = variables.GetVariablesVector();

    for (unsigned int i = 0;i<variablesVector.size();++i)
    {
    	variablesList->InsertItem(i, variablesVector[i].GetName());
    	variablesList->SetItem(i, 1, variablesVector[i].Gettexte());
    }
}

void ChoixVariableDialog::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ChoixVariableDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

/**
 * Add an initial variable
 */
void ChoixVariableDialog::OnAddVarSelected(wxCommandEvent& event)
{
    string variableName = string(wxGetTextFromUser("Entrez le nom de la nouvelle variable", "Insertion d'une variable initiale").mb_str());

    if ( variableName == "" )
        return;

    if ( variables.HasVariable(variableName) )
    {
        wxLogMessage(_("Une variable portant ce nom existe déjà."));
        return;
    }

    variables.ObtainVariable(variableName);
    Refresh();
}

/**
 * Delete an initial variable
 */
void ChoixVariableDialog::OnDelVarSelected(wxCommandEvent& event)
{
    if ( !variables.HasVariable(selectedVariable) )
    {
        wxLogMessage(_("Impossible de trouver la variable à supprimer"));
        return;
    }

    variables.RemoveVariable(selectedVariable);
}

/**
 * Modify the initial value of a variable
 */
void ChoixVariableDialog::OnEditVarSelected(wxCommandEvent& event)
{
    if ( !variables.HasVariable(selectedVariable) )
    {
        wxLogMessage(_("Impossible de trouver la variable à éditer"));
        return;
    }

    string value = string(wxGetTextFromUser("Entrez la valeur initiale de la variable", "Valueur initiale").mb_str());
    variables.ObtainVariable(selectedVariable).Settexte(value);

    Refresh();
    return;
}

/**
 * Modify the initial value of a variable
 */
void ChoixVariableDialog::OnvariablesListItemActivated(wxListEvent& event)
{
    selectedVariable = event.GetText();

    wxCommandEvent uselessEvent;
    OnEditVarSelected(uselessEvent);
}

void ChoixVariableDialog::OnhelpBtClick(wxCommandEvent& event)
{
}


void ChoixVariableDialog::OnvariablesListItemSelect(wxListEvent& event)
{
    selectedVariable = event.GetText();
}
