#include "InitialVariablesDialog.h"

//(*InternalHeaders(InitialVariablesDialog)
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
#include "GDL/VariableList.h"
#include "GDL/IDE/HelpFileAccess.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(InitialVariablesDialog)
const long InitialVariablesDialog::ID_STATICBITMAP1 = wxNewId();
const long InitialVariablesDialog::ID_STATICTEXT6 = wxNewId();
const long InitialVariablesDialog::ID_PANEL2 = wxNewId();
const long InitialVariablesDialog::ID_STATICLINE1 = wxNewId();
const long InitialVariablesDialog::ID_AUITOOLBAR1 = wxNewId();
const long InitialVariablesDialog::ID_PANEL1 = wxNewId();
const long InitialVariablesDialog::ID_LISTCTRL1 = wxNewId();
const long InitialVariablesDialog::ID_STATICLINE2 = wxNewId();
const long InitialVariablesDialog::ID_BUTTON1 = wxNewId();
const long InitialVariablesDialog::ID_BUTTON3 = wxNewId();
const long InitialVariablesDialog::ID_BUTTON2 = wxNewId();
//*)
const long InitialVariablesDialog::idAddVar = wxNewId();
const long InitialVariablesDialog::idEditVar = wxNewId();
const long InitialVariablesDialog::idDelVar = wxNewId();
const long InitialVariablesDialog::idMoveUpVar = wxNewId();
const long InitialVariablesDialog::idMoveDownVar = wxNewId();
const long InitialVariablesDialog::idRenameVar = wxNewId();
const long InitialVariablesDialog::ID_Help = wxNewId();

BEGIN_EVENT_TABLE(InitialVariablesDialog,wxDialog)
	//(*EventTable(InitialVariablesDialog)
	//*)
END_EVENT_TABLE()

InitialVariablesDialog::InitialVariablesDialog(wxWindow* parent, ListVariable variables_) :
variables(variables_)
{
	//(*Initialize(InitialVariablesDialog)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edition des variables initiales"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(3);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	Panel2 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	Panel2->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/var64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer12->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT6, _("Modifiez ici les variables initiales.\nNotez qu\'il n\'est pas obligatoire de déclarer une variable\ndans le tableau pour l\'utiliser. Déclarer une variable dans\nle tableau permet de lui affecter une valeur initiale, et de\npouvoir la retrouver facilement."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT6"));
	FlexGridSizer12->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer12);
	FlexGridSizer12->Fit(Panel2);
	FlexGridSizer12->SetSizeHints(Panel2);
	FlexGridSizer3->Add(Panel2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	toolbarPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(-1,26), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	AuiManager1 = new wxAuiManager(toolbarPanel, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(toolbarPanel, ID_AUITOOLBAR1, wxPoint(10,11), wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	variablesList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(374,149), wxLC_REPORT|wxLC_EDIT_LABELS|wxLC_SINGLE_SEL, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(variablesList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxButton(this, ID_BUTTON2, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&InitialVariablesDialog::OntoolbarPanelResize,0,this);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnvariablesListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&InitialVariablesDialog::OnvariablesListItemActivated);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_KEY_DOWN,(wxObjectEventFunction)&InitialVariablesDialog::OnvariablesListKeyDown);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InitialVariablesDialog::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InitialVariablesDialog::OncancelBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&InitialVariablesDialog::OnhelpBtClick);
	//*)
	Connect(idAddVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnAddVarSelected);
	Connect(idDelVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnDelVarSelected);
	Connect(idEditVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnEditVarSelected);
	Connect(idRenameVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnRenameVarSelected);
	Connect(idMoveUpVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnMoveUpVarSelected);
	Connect(idMoveDownVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnMoveDownVarSelected);
	Connect(ID_Help,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&InitialVariablesDialog::OnhelpBtClick);

	variablesList->InsertColumn(0, _("Variable"));
	variablesList->InsertColumn(1, _("Valeur initiale"));;
	variablesList->SetColumnWidth(0, 150);
	variablesList->SetColumnWidth(1, 130);

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idAddVar, wxT( "Ajouter une variable" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter une variable") );
    toolbar->AddTool( idEditVar, wxT( "Editer la valeur initiale de la variable" ), wxBitmap( wxImage( "res/editicon.png" ) ), _("Editer la valeur initiale de la variable") );
    toolbar->AddTool( idRenameVar, wxT( "Renommer la variable" ), wxBitmap( wxImage( "res/editnom.png" ) ), _("Renommer la variable") );
    toolbar->AddTool( idDelVar, wxT( "Supprimer la variable selectionnée" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer la variable selectionnée") );
    toolbar->AddSeparator();
    toolbar->AddTool( idMoveUpVar, wxT( "Déplacer vers le haut" ), wxBitmap( wxImage( "res/up.png" ) ), _("Déplacer vers le haut") );
    toolbar->AddTool( idMoveDownVar, wxT( "Déplacer vers le bas" ), wxBitmap( wxImage( "res/down.png" ) ), _("Déplacer vers le bas") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, wxT( "Aide sur les variables initiales" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide sur les variables initiales") );
    toolbar->Realize();

    Refresh();
}

InitialVariablesDialog::~InitialVariablesDialog()
{
	//(*Destroy(InitialVariablesDialog)
	//*)
    AuiManager1->UnInit();
}

/**
 * Resize toolbar according to the panel size.
 */
void InitialVariablesDialog::OntoolbarPanelResize(wxSizeEvent& event)
{
    toolbar->SetSize(toolbarPanel->GetSize().x, -1);
}

/**
 * Refresh the list with variables.
 */
void InitialVariablesDialog::Refresh()
{
    variablesList->DeleteAllItems();
    const std::vector<Variable> & variablesVector = variables.GetVariablesVector();

    for (unsigned int i = 0;i<variablesVector.size();++i)
    {
    	variablesList->InsertItem(i, variablesVector[i].GetName());
    	variablesList->SetItem(i, 1, variablesVector[i].GetString());
    }

    //Resize columns with a little margin
    variablesList->SetColumnWidth(0, variablesList->GetSize().GetWidth()/2-10);
    variablesList->SetColumnWidth(1, variablesList->GetSize().GetWidth()/2-10);

    int bestHeight = 200+variablesVector.size()*10;
    bestHeight = (bestHeight < 200) ? 350 : bestHeight;
    bestHeight = (bestHeight > 500) ? 500 : bestHeight;

    SetSize(GetSize().GetWidth(), bestHeight);
}

void InitialVariablesDialog::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void InitialVariablesDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

/**
 * Add an initial variable
 */
void InitialVariablesDialog::OnAddVarSelected(wxCommandEvent& event)
{
    std::string variableName = std::string(wxGetTextFromUser("Entrez le nom de la nouvelle variable", "Insertion d'une variable initiale").mb_str());

    if ( variableName == "" )
        return;

    if ( variables.HasVariable(variableName) )
    {
        wxLogMessage(_("Une variable portant ce nom existe déjà."));
        return;
    }

    variables.ObtainVariable(variableName); //Automatically create variable
    variablesList->InsertItem(variablesList->GetItemCount(), variableName);
}

/**
 * Delete an initial variable
 */
void InitialVariablesDialog::OnDelVarSelected(wxCommandEvent& event)
{
    if ( !variables.HasVariable(selectedVariable) )
        return;

    variablesList->DeleteItem(variablesList->FindItem(-1, selectedVariable));
    variables.RemoveVariable(selectedVariable);
}

/**
 * Rename an initial variable
 */
void InitialVariablesDialog::OnRenameVarSelected(wxCommandEvent& event)
{
    if ( !variables.HasVariable(selectedVariable) )
        return;

    std::string newName = std::string(wxGetTextFromUser("Entrez le nouveau nom de la variable", "Nom de la variable", variables.ObtainVariable(selectedVariable).GetName()).mb_str());

    if ( variables.HasVariable(newName) )
    {
        wxLogMessage(_("Une variable porte déjà ce nom."));
        return;
    }

    variablesList->SetItem(variablesList->FindItem(-1, selectedVariable), 0, newName);
    variables.ObtainVariable(selectedVariable).SetName(newName);
}

/**
 * Move up a variable
 */
void InitialVariablesDialog::OnMoveUpVarSelected(wxCommandEvent& event)
{
    std::vector < Variable > & variablesVector = variables.GetVariablesVector();

    for (unsigned int i = 1;i<variablesVector.size();++i)
    {
        if ( variablesVector[i].GetName() == selectedVariable)
        {
            Variable variable = variablesVector[i];

            variablesVector.erase(variablesVector.begin()+i);
            variablesVector.insert(variablesVector.begin()+i-1, variable);

            long variableIdInList = variablesList->FindItem(-1, selectedVariable);
            variablesList->DeleteItem(variableIdInList);
            variablesList->InsertItem(variableIdInList-1, variable.GetName());
            variablesList->SetItem(variableIdInList-1, 1, variable.GetString());

            return;
        }
    }
}

/**
 * Move down a variable
 */
void InitialVariablesDialog::OnMoveDownVarSelected(wxCommandEvent& event)
{
    std::vector < Variable > & variablesVector = variables.GetVariablesVector();

    for (unsigned int i = 0;i<variablesVector.size()-1;++i)
    {
        if ( variablesVector[i].GetName() == selectedVariable)
        {
            Variable variable = variablesVector[i];

            variablesVector.erase(variablesVector.begin()+i);
            variablesVector.insert(variablesVector.begin()+i+1, variable);

            long variableIdInList = variablesList->FindItem(-1, selectedVariable);
            variablesList->DeleteItem(variableIdInList);
            variablesList->InsertItem(variableIdInList+1, variable.GetName());
            variablesList->SetItem(variableIdInList+1, 1, variable.GetString());

            return;
        }
    }
}

/**
 * Modify the initial value of a variable
 */
void InitialVariablesDialog::OnEditVarSelected(wxCommandEvent& event)
{
    if ( !variables.HasVariable(selectedVariable) )
        return;

    std::string value = std::string(wxGetTextFromUser("Entrez la valeur initiale de la variable", "Valeur initiale", variables.GetVariableString(selectedVariable)).mb_str());

    variables.ObtainVariable(selectedVariable).SetString(value);
    variablesList->SetItem(variablesList->FindItem(-1, selectedVariable), 1, value);
}

/**
 * Modify the initial value of a variable
 */
void InitialVariablesDialog::OnvariablesListItemActivated(wxListEvent& event)
{
    selectedVariable = event.GetText();

    wxCommandEvent uselessEvent;
    OnEditVarSelected(uselessEvent);
}

void InitialVariablesDialog::OnhelpBtClick(wxCommandEvent& event)
{
    HelpFileAccess::GetInstance()->DisplaySection(242);
}


void InitialVariablesDialog::OnvariablesListItemSelect(wxListEvent& event)
{
    selectedVariable = event.GetText();
}

/**
 * Handles accelerators
 */
void InitialVariablesDialog::OnvariablesListKeyDown(wxListEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OnDelVarSelected( unusedEvent );
    }
    else if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnAddVarSelected( unusedEvent );
    }
}
