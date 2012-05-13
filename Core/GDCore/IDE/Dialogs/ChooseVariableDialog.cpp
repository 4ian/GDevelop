/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ChooseVariableDialog.h"

//(*InternalHeaders(ChooseVariableDialog)
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
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/Tools/HelpFileAccess.h"

//(*IdInit(ChooseVariableDialog)
const long ChooseVariableDialog::ID_STATICBITMAP1 = wxNewId();
const long ChooseVariableDialog::ID_STATICTEXT6 = wxNewId();
const long ChooseVariableDialog::ID_PANEL2 = wxNewId();
const long ChooseVariableDialog::ID_STATICLINE1 = wxNewId();
const long ChooseVariableDialog::ID_AUITOOLBAR1 = wxNewId();
const long ChooseVariableDialog::ID_PANEL1 = wxNewId();
const long ChooseVariableDialog::ID_LISTCTRL1 = wxNewId();
const long ChooseVariableDialog::ID_STATICLINE2 = wxNewId();
const long ChooseVariableDialog::ID_BUTTON1 = wxNewId();
const long ChooseVariableDialog::ID_BUTTON3 = wxNewId();
const long ChooseVariableDialog::ID_BUTTON2 = wxNewId();
//*)
const long ChooseVariableDialog::idAddVar = wxNewId();
const long ChooseVariableDialog::idEditVar = wxNewId();
const long ChooseVariableDialog::idDelVar = wxNewId();
const long ChooseVariableDialog::ID_Help = wxNewId();
const long ChooseVariableDialog::idMoveUpVar = wxNewId();
const long ChooseVariableDialog::idRenameVar = wxNewId();
const long ChooseVariableDialog::idMoveDownVar = wxNewId();

BEGIN_EVENT_TABLE(ChooseVariableDialog,wxDialog)
	//(*EventTable(ChooseVariableDialog)
	//*)
END_EVENT_TABLE()

ChooseVariableDialog::ChooseVariableDialog(wxWindow* parent, gd::VariablesContainer & variablesContainer_, bool editingOnly_) :
variablesContainer(variablesContainer_),
temporaryContainer(variablesContainer_.Clone()),
editingOnly(editingOnly_)
{
	//(*Initialize(ChooseVariableDialog)
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
	StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/var64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
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
	AuiManager1 = new wxAuiManager(toolbarPanel, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(toolbarPanel, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	variablesList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(374,149), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
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

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnvariablesListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseVariableDialog::OnvariablesListItemActivated);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseVariableDialog::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseVariableDialog::OncancelBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseVariableDialog::OnhelpBtClick);
	//*)
	Connect(idAddVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnAddVarSelected);
	Connect(idDelVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnDelVarSelected);
	Connect(idEditVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnEditVarSelected);
	Connect(idRenameVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnRenameVarSelected);
	Connect(idMoveUpVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnMoveUpVarSelected);
	Connect(idMoveDownVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnMoveDownVarSelected);
	Connect(ID_Help,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnhelpBtClick);

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

    if ( editingOnly )
    {
        SetTitle(_("Edition des variables"));
        okBt->SetLabel(_("Ok"));
    }
}

ChooseVariableDialog::~ChooseVariableDialog()
{
	//(*Destroy(ChooseVariableDialog)
	//*)

    AuiManager1->UnInit();
}

/**
 * Refresh the list with variables.
 */
void ChooseVariableDialog::Refresh()
{
    variablesList->DeleteAllItems();

    for (unsigned int i = 0;i<temporaryContainer->GetVariableCount();++i)
    {
    	variablesList->InsertItem(i, temporaryContainer->GetVariable(i).GetName());
    	variablesList->SetItem(i, 1, temporaryContainer->GetVariable(i).GetString());
    }

    //Resize columns with a little margin
    variablesList->SetColumnWidth(0, variablesList->GetSize().GetWidth()/2-10);
    variablesList->SetColumnWidth(1, variablesList->GetSize().GetWidth()/2-10);

    int bestHeight = 200+temporaryContainer->GetVariableCount()*10;
    bestHeight = (bestHeight < 200) ? 350 : bestHeight;
    bestHeight = (bestHeight > 500) ? 500 : bestHeight;

    SetSize(GetSize().GetWidth(), bestHeight);
}

/**
 * Close dialog applying changes
 */
void ChooseVariableDialog::OnokBtClick(wxCommandEvent& event)
{
    variablesContainer.Create(*temporaryContainer);
    EndModal(1);
}

/**
 * Close dialog canceling changes
 */
void ChooseVariableDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

/**
 * Add an initial variable
 */
void ChooseVariableDialog::OnAddVarSelected(wxCommandEvent& event)
{
    std::string variableName = std::string(wxGetTextFromUser("Entrez le nom de la nouvelle variable", "Insertion d'une variable initiale").mb_str());

    if ( variableName == "" )
        return;

    if ( temporaryContainer->HasVariableNamed(variableName) )
    {
        wxLogMessage(_("Une variable portant ce nom existe déjà."));
        return;
    }

    unsigned int listInsertPosition = temporaryContainer->HasVariableNamed(selectedVariable) ? temporaryContainer->GetVariablePosition(selectedVariable) : 0;
    temporaryContainer->InsertNewVariable(variableName, listInsertPosition);
    variablesList->InsertItem(listInsertPosition, variableName);
}

/**
 * Delete an initial variable
 */
void ChooseVariableDialog::OnDelVarSelected(wxCommandEvent& event)
{
    if ( !temporaryContainer->HasVariableNamed(selectedVariable) )
        return;

    variablesList->DeleteItem(variablesList->FindItem(-1, selectedVariable));
    temporaryContainer->RemoveVariable(selectedVariable);
}

/**
 * Rename an initial variable
 */
void ChooseVariableDialog::OnRenameVarSelected(wxCommandEvent& event)
{
    if ( !temporaryContainer->HasVariableNamed(selectedVariable) )
        return;

    std::string newName = std::string(wxGetTextFromUser("Entrez le nouveau nom de la variable", "Nom de la variable", temporaryContainer->GetVariable(selectedVariable).GetName()).mb_str());

    if ( temporaryContainer->HasVariableNamed(newName) )
    {
        wxLogMessage(_("Une variable porte déjà ce nom."));
        return;
    }

    variablesList->SetItem(variablesList->FindItem(-1, selectedVariable), 0, newName);
    temporaryContainer->GetVariable(selectedVariable).SetName(newName);
}

/**
 * Move up a variable
 */
void ChooseVariableDialog::OnMoveUpVarSelected(wxCommandEvent& event)
{
    for (unsigned int i = 1;i<temporaryContainer->GetVariableCount();++i)
    {
        if ( temporaryContainer->GetVariable(i).GetName() == selectedVariable)
        {
            long variableIdInList = variablesList->FindItem(-1, selectedVariable);
            variablesList->DeleteItem(variableIdInList);
            variablesList->InsertItem(variableIdInList-1, temporaryContainer->GetVariable(i).GetName());
            variablesList->SetItem(variableIdInList-1, 1, temporaryContainer->GetVariable(i).GetString());

            temporaryContainer->SwapVariables(i, i-1);

            return;
        }
    }
}

/**
 * Move down a variable
 */
void ChooseVariableDialog::OnMoveDownVarSelected(wxCommandEvent& event)
{
    for (unsigned int i = 0;i<temporaryContainer->GetVariableCount()-1;++i)
    {
        if ( temporaryContainer->GetVariable(i).GetName() == selectedVariable)
        {
            long variableIdInList = variablesList->FindItem(-1, selectedVariable);
            variablesList->DeleteItem(variableIdInList);
            variablesList->InsertItem(variableIdInList+1, temporaryContainer->GetVariable(i).GetName());
            variablesList->SetItem(variableIdInList+1, 1, temporaryContainer->GetVariable(i).GetString());

            temporaryContainer->SwapVariables(i, i+1);

            return;
        }
    }
}

/**
 * Modify the initial value of a variable
 */
void ChooseVariableDialog::OnEditVarSelected(wxCommandEvent& event)
{
    if ( !temporaryContainer->HasVariableNamed(selectedVariable) )
        return;

    std::string value = std::string(wxGetTextFromUser("Entrez la valeur initiale de la variable", "Valeur initiale", temporaryContainer->GetVariable(selectedVariable).GetString()).mb_str());

    temporaryContainer->GetVariable(selectedVariable).SetString(value);
    variablesList->SetItem(variablesList->FindItem(-1, selectedVariable), 1, value);
}


/**
 * Choose/Edit a variable
 */
void ChooseVariableDialog::OnvariablesListItemActivated(wxListEvent& event)
{
    selectedVariable = event.GetText();

    wxCommandEvent uselessEvent;
    if ( editingOnly )
        OnEditVarSelected(uselessEvent);
    else
        OnokBtClick(uselessEvent);
}

/**
 * Display help
 */
void ChooseVariableDialog::OnhelpBtClick(wxCommandEvent& event)
{
    HelpFileAccess::GetInstance()->DisplaySection(242);
}

/**
 * Handles accelerators
 */
void ChooseVariableDialog::OnvariablesListKeyDown(wxListEvent& event)
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

void ChooseVariableDialog::OnvariablesListItemSelect(wxListEvent& event)
{
    selectedVariable = event.GetText();
}
