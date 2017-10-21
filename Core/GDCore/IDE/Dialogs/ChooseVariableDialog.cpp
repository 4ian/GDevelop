/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ChooseVariableDialog.h"

//(*InternalHeaders(ChooseVariableDialog)
#include <wx/bitmap.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/bitmap.h>
#include <wx/image.h>
#include <wx/settings.h>
#include "GDCore/Tools/Log.h"
#include <wx/textdlg.h>
#include <wx/choicdlg.h>
#include <wx/msgdlg.h>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/Events/EventsVariablesFinder.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/CommonTools.h"

namespace gd
{

//(*IdInit(ChooseVariableDialog)
const long ChooseVariableDialog::ID_AUITOOLBAR1 = wxNewId();
const long ChooseVariableDialog::ID_PANEL1 = wxNewId();
const long ChooseVariableDialog::ID_TREELISTCTRL1 = wxNewId();
const long ChooseVariableDialog::ID_STATICLINE2 = wxNewId();
const long ChooseVariableDialog::ID_STATICBITMAP2 = wxNewId();
const long ChooseVariableDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long ChooseVariableDialog::ID_BUTTON1 = wxNewId();
const long ChooseVariableDialog::ID_BUTTON3 = wxNewId();
const long ChooseVariableDialog::ID_MENUITEM1 = wxNewId();
const long ChooseVariableDialog::ID_MENUITEM2 = wxNewId();
const long ChooseVariableDialog::ID_MENUITEM3 = wxNewId();
const long ChooseVariableDialog::ID_MENUITEM4 = wxNewId();
//*)
const long ChooseVariableDialog::idAddVar = wxNewId();
const long ChooseVariableDialog::idEditVar = wxNewId();
const long ChooseVariableDialog::idDelVar = wxNewId();
const long ChooseVariableDialog::ID_Help = wxNewId();
const long ChooseVariableDialog::idMoveUpVar = wxNewId();
const long ChooseVariableDialog::idRenameVar = wxNewId();
const long ChooseVariableDialog::idMoveDownVar = wxNewId();
const long ChooseVariableDialog::idFindUndeclared = wxNewId();

BEGIN_EVENT_TABLE(ChooseVariableDialog,wxDialog)
	//(*EventTable(ChooseVariableDialog)
	//*)
END_EVENT_TABLE()

ChooseVariableDialog::ChooseVariableDialog(wxWindow* parent, gd::VariablesContainer & variablesContainer_, bool editingOnly_) :
    variablesContainer(variablesContainer_),
    temporaryContainer(new gd::VariablesContainer(variablesContainer_)),
    editingOnly(editingOnly_),
    associatedProject(NULL),
    associatedLayout(NULL),
    associatedObject(NULL),
    modificationCount(0)
{
	//(*Initialize(ChooseVariableDialog)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose a variable"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	toolbarPanel = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(-1,26), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	AuiManager1 = new wxAuiManager(toolbarPanel, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(toolbarPanel, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND, 0);
	variablesList = new wxTreeListCtrl(this,ID_TREELISTCTRL1,wxDefaultPosition,wxDefaultSize,0,_T("ID_TREELISTCTRL1"));
    variablesList->SetMinSize(wxSize(300, 200));
	FlexGridSizer1->Add(variablesList, 1, wxALL|wxEXPAND, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(HyperlinkCtrl1, 1, wxALL, 5);
	FlexGridSizer2->Add(FlexGridSizer17, 1, wxALL|wxALIGN_LEFT, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Choose"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&contextMenu), ID_MENUITEM1, _("Edit initial value"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem1);
	MenuItem2 = new wxMenuItem((&contextMenu), ID_MENUITEM2, _("Rename"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem2);
	contextMenu.AppendSeparator();
	MenuItem3 = new wxMenuItem((&contextMenu), ID_MENUITEM3, _("Add a child variable"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem3);
	MenuItem4 = new wxMenuItem((&contextMenu), ID_MENUITEM4, _("Remove"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem4);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	variablesList->Connect(wxEVT_KEY_DOWN,(wxObjectEventFunction)&ChooseVariableDialog::OnvariablesListKeyDown1,0,this);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChooseVariableDialog::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseVariableDialog::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseVariableDialog::OncancelBtClick);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnEditValueSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnRenameSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnAddChildSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnRemoveSelected);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&ChooseVariableDialog::OnResize);
	//*)
    Connect(ID_TREELISTCTRL1,wxEVT_COMMAND_TREELIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseVariableDialog::OnItemActivated);
    Connect(ID_TREELISTCTRL1,wxEVT_COMMAND_TREELIST_ITEM_CONTEXT_MENU,(wxObjectEventFunction)&ChooseVariableDialog::OnRightClick);
    Connect(ID_TREELISTCTRL1,wxEVT_COMMAND_TREELIST_SELECTION_CHANGED,(wxObjectEventFunction)&ChooseVariableDialog::OnItemSelectionChanged);
	Connect(idAddVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnAddVarSelected);
	Connect(idDelVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnRemoveSelected);
	Connect(idEditVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnEditValueSelected);
	Connect(idRenameVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnRenameSelected);
	Connect(idMoveUpVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnMoveUpVarSelected);
	Connect(idMoveDownVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnMoveDownVarSelected);
	Connect(ID_Help,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnhelpBtClick);
	Connect(idFindUndeclared,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseVariableDialog::OnFindUndeclaredSelected);

	variablesList->AppendColumn(_("Variable"), 150);
	variablesList->AppendColumn(_("Initial value"), 130);

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idAddVar, _( "Add a variable" ), gd::SkinHelper::GetIcon("add", 16), _("Add a variable") );
    toolbar->AddTool( idEditVar, _( "Edit the initial value of the variable" ), gd::SkinHelper::GetIcon("edit", 16), _("Edit the initial value of the variable") );
    toolbar->AddTool( idRenameVar, _( "Rename the variable" ), gd::SkinHelper::GetIcon("editname", 16), _("Rename the variable") );
    toolbar->AddTool( idDelVar, _( "Delete the selected variable" ), gd::SkinHelper::GetIcon("delete", 16), _("Delete the selected variable") );
    toolbar->AddSeparator();
    toolbar->AddTool( idMoveUpVar, _( "Move up" ), gd::SkinHelper::GetIcon("up", 16), _("Move up") );
    toolbar->AddTool( idMoveDownVar, _( "Move down" ), gd::SkinHelper::GetIcon("down", 16), _("Move down") );
    toolbar->AddSeparator();
    toolbar->AddTool( idFindUndeclared, _( "Search for undeclared variables" ), gd::SkinHelper::GetIcon("find", 16), _("Search for undeclared variables inside the project") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, _( "Help about variables" ), gd::SkinHelper::GetIcon("help", 16), _("Help about variables") );
    toolbar->EnableTool(idFindUndeclared, false);
    toolbar->Realize();

    //Offer nice background color to toolbar area.
    AuiManager1->GetArtProvider()->SetColour(wxAUI_DOCKART_BACKGROUND_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));
    gd::SkinHelper::ApplyCurrentSkin(*toolbar);

    UpdateTitle();
    RefreshAll();

    //Give a convenient size
    std::size_t itemCount = 0;
    for ( wxTreeListItem item = variablesList->GetFirstItem();
        item.IsOk();
        item = variablesList->GetNextItem(item) )
    {
        itemCount++;
    }

    int bestHeight = 300+itemCount*10;
    bestHeight = (bestHeight < 300) ? 350 : bestHeight;
    bestHeight = (bestHeight > 500) ? 500 : bestHeight;

    SetSize(500, bestHeight);
}

void ChooseVariableDialog::UpdateTitle()
{
    if ( editingOnly )
    {
        wxString context = "";
        if ( associatedProject != NULL && associatedLayout == NULL ) context = _("Global variables");
        else if ( associatedProject != NULL && associatedLayout != NULL && associatedObject == NULL  ) context = wxString::Format(_("\"%s\" scene variables").ToWxString(), associatedLayout->GetName().ToWxString());
        else if ( associatedProject != NULL && associatedLayout != NULL && associatedObject != NULL ) context = wxString::Format(_("\"%s\" object variables").ToWxString(), associatedObject->GetName().ToWxString());
        else context = "Instance variables";

        SetTitle(wxString::Format(wxString(_("Edit the variables (%s)")),
            context));
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
void ChooseVariableDialog::RefreshVariable(wxTreeListItem item, const gd::String & name, const gd::Variable & variable)
{
    //Update the name and remove children
    variablesList->SetItemText(item, 0, name);
    bool wasExpanded = variablesList->IsExpanded(item);

    if ( !variable.IsStructure() ) {
        while ( variablesList->GetFirstChild(item).IsOk() )
            variablesList->DeleteItem(variablesList->GetFirstChild(item));

        variablesList->SetItemText(item, 1, variable.GetString());
    }
    else
    {
        variablesList->SetItemText(item, 1, "(Structure)");

        //Add/update children
        const std::map<gd::String, gd::Variable> & children = variable.GetAllChildren();
        wxTreeListItem currentChildItem = variablesList->GetFirstChild(item);
        wxTreeListItem lastChildItem;
        for(std::map<gd::String, gd::Variable>::const_iterator it = children.begin();it != children.end();++it)
        {
            if ( !currentChildItem.IsOk() ) currentChildItem = variablesList->AppendItem(item, it->first);
            RefreshVariable(currentChildItem, it->first, it->second);
            lastChildItem = currentChildItem;

            currentChildItem = variablesList->GetNextSibling(currentChildItem);
        }

        //Remove no more needed children.
        while ( lastChildItem.IsOk() && variablesList->GetNextSibling(lastChildItem) )
            variablesList->DeleteItem(variablesList->GetNextSibling(lastChildItem));

        if ( wasExpanded ) variablesList->Expand(item); //Go back to the old state.
    }

}

/**
 * Refresh the list with variables.
 */
void ChooseVariableDialog::RefreshAll()
{
    variablesList->DeleteAllItems();

    for (std::size_t i = 0;i<temporaryContainer->Count();++i)
    {
        const std::pair<gd::String, gd::Variable> & variable = temporaryContainer->Get(i);

    	wxTreeListItem item = variablesList->AppendItem(variablesList->GetRootItem(), variable.first);
        RefreshVariable(item, variable.first, variable.second);
        variablesList->Expand(item);
    }

    //Resize columns with a little margin
    variablesList->SetColumnWidth(0, variablesList->GetSize().GetWidth()/2-5);
    variablesList->SetColumnWidth(1, variablesList->GetSize().GetWidth()/2-5);
}

/**
 * Close dialog applying changes
 */
void ChooseVariableDialog::OnokBtClick(wxCommandEvent& event)
{
    variablesContainer = *temporaryContainer;
    EndModal(1);
}

/**
 * Close dialog canceling changes
 */
void ChooseVariableDialog::OncancelBtClick(wxCommandEvent& event)
{
    if ( modificationCount > 4 )
    {
        wxMessageDialog msgDlg(this, _("You made ")+gd::String::From(modificationCount)+_(" changes. Are you sure you want to cancel all changes\?"), _("Lot's of changes made."), wxYES_NO | wxICON_QUESTION);
        if ( msgDlg.ShowModal() == wxID_NO )
            return;
    }

    EndModal(0);
}

/**
 * Add an initial variable
 */
void ChooseVariableDialog::OnAddVarSelected(wxCommandEvent& event)
{
    //Find a new unique name
    gd::String newName = _("NewVariable");
    unsigned int tries = 2;
    while ( temporaryContainer->Has(newName) )
    {
        newName = _("NewVariable")+gd::String::From(tries);
        tries++;
    }

    newName = wxGetTextFromUser(_("Please choose a new name for the new variable"), _("New variable name"), newName);
    if ( newName.empty() ) return;

    if ( temporaryContainer->Has(newName) )
    {
        gd::LogMessage(_("A variable with this name already exists!"));
        return;
    }

    //Insert the new variable in the list
    temporaryContainer->InsertNew(newName, -1);
    wxTreeListItem item = variablesList->AppendItem(variablesList->GetRootItem(), newName);
    RefreshVariable(item, newName, temporaryContainer->Get(newName));
    variablesList->Select(item);

    modificationCount++;
}


/**
 * Move up a variable
 */
void ChooseVariableDialog::OnMoveUpVarSelected(wxCommandEvent& event)
{
    UpdateSelectedAndParentVariable();
    for (std::size_t i = 1;i<temporaryContainer->Count();++i)
    {
        const std::pair<gd::String, gd::Variable> & currentVar = temporaryContainer->Get(i);
        if ( currentVar.first == selectedVariableName)
        {
            const std::pair<gd::String, gd::Variable> & prevVar = temporaryContainer->Get(i-1);
            temporaryContainer->Swap(i, i-1);
            RefreshAll();

            modificationCount++;
            return;
        }
    }

}

/**
 * Move down a variable
 */
void ChooseVariableDialog::OnMoveDownVarSelected(wxCommandEvent& event)
{
    UpdateSelectedAndParentVariable();
    for (std::size_t i = 0;i<temporaryContainer->Count()-1;++i)
    {
        const std::pair<gd::String, gd::Variable> & currentVar = temporaryContainer->Get(i);
        if ( currentVar.first == selectedVariableName)
        {
            const std::pair<gd::String, gd::Variable> & nextVar = temporaryContainer->Get(i+1);

            temporaryContainer->Swap(i, i+1);
            RefreshAll();

            modificationCount++;
            return;
        }
    }

}

/**
 * Choose/Edit a variable
 */
void ChooseVariableDialog::OnItemActivated(wxTreeListEvent& event)
{
    wxCommandEvent uselessEvent;
    if ( editingOnly )
        OnEditValueSelected(uselessEvent);
    else
        OnokBtClick(uselessEvent);
}

void ChooseVariableDialog::OnRightClick(wxTreeListEvent& event)
{
    PopupMenu(&contextMenu);
}

/**
 * Display help
 */
void ChooseVariableDialog::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/global_variables");
}

/**
 * Handles accelerators
 */
void ChooseVariableDialog::OnvariablesListKeyDown1(wxKeyEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE || event.GetKeyCode() == WXK_BACK )
    {
        wxCommandEvent unusedEvent;
        OnRemoveSelected( unusedEvent );
    }
    else if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnAddVarSelected( unusedEvent );
    }
}

void ChooseVariableDialog::OnFindUndeclaredSelected(wxCommandEvent& event)
{
    std::set<gd::String> allVariables;
    if ( associatedProject != NULL && associatedLayout == NULL ) allVariables = EventsVariablesFinder::FindAllGlobalVariables(associatedProject->GetCurrentPlatform(), *associatedProject);
    else if ( associatedProject != NULL && associatedLayout != NULL && associatedObject == NULL  ) allVariables = EventsVariablesFinder::FindAllLayoutVariables(associatedProject->GetCurrentPlatform(), *associatedProject, *associatedLayout);
    else if ( associatedProject != NULL && associatedLayout != NULL && associatedObject != NULL ) allVariables = EventsVariablesFinder::FindAllObjectVariables(associatedProject->GetCurrentPlatform(), *associatedProject, *associatedLayout, *associatedObject);
    else return;

    //Construct a wxArrayString with not declared variables
    wxArrayString variablesNotDeclared;
    for (std::set<gd::String>::const_iterator it = allVariables.begin();it!=allVariables.end();++it)
    {
        if ( !temporaryContainer->Has(*it) )
            variablesNotDeclared.push_back(*it);
    }

    //Request the user to choose which variables to add.
    wxMultiChoiceDialog dialog(this, _("These variables are used but not declared:\nCheck the variables to be added to the list."), _("Adding undeclared variables"), variablesNotDeclared, wxDEFAULT_DIALOG_STYLE | wxRESIZE_BORDER | wxOK | wxCANCEL);
    dialog.ShowModal();

    //Add selection
    wxArrayInt selection = dialog.GetSelections();
    for (std::size_t i = 0;i<selection.size();++i)
    {
        temporaryContainer->InsertNew(variablesNotDeclared[selection[i]],temporaryContainer->Count());
        modificationCount++;
    }

    if ( !selection.empty() ) RefreshAll();
}

/**
 * End renaming an item
 */
 /*
void ChooseVariableDialog::OnvariablesListEndLabelEdit(wxListEvent& event)
{
    UpdateSelectedAndParentVariable();
    gd::String newName = ToString(event.GetLabel());
    if ( newName != oldName )
    {
        if ( !temporaryContainer->Has(newName))
            temporaryContainer->Rename(oldName, newName);
        else
        {
            gd::LogWarning(_("A variable with this name already exists."));
            event.Veto();
        }
    }
}*/

void ChooseVariableDialog::OnEditValueSelected(wxCommandEvent& event)
{
    UpdateSelectedAndParentVariable();
    if ( !selectedVariable || selectedVariable->IsStructure() ) return;

    wxTextEntryDialog editDialog(this,
    	_("Enter the initial value of the variable"), _("Initial value"),
    	selectedVariable->GetString(), wxTextEntryDialogStyle | wxTE_MULTILINE);

    if (editDialog.ShowModal() == wxID_OK)
    {
    	gd::String value = editDialog.GetValue();
    	selectedVariable->SetString(value);

    	RefreshVariable(variablesList->GetSelection(), selectedVariableName, *selectedVariable);
    	modificationCount++;
    }
}

void ChooseVariableDialog::OnRenameSelected(wxCommandEvent& event)
{
    UpdateSelectedAndParentVariable();
    if ( !selectedVariable ) return;

    gd::String newName = wxGetTextFromUser(_("Enter the new name of the variable"), _("New name"), selectedVariableName);
    if ( newName.empty() || newName == selectedVariableName ) return;


    if ( parentVariable )
    {
        if ( parentVariable->HasChild(newName) )
        {
            gd::LogMessage(_("A child variable with this name already exists!"));
            return;
        }

        RefreshVariable(variablesList->GetSelection(), newName, *selectedVariable);
        parentVariable->GetChild(newName) = *selectedVariable;
        parentVariable->RemoveChild(selectedVariableName);
    }
    else
    {
        if ( temporaryContainer->Has(newName) )
        {
            gd::LogMessage(_("A variable with this name already exists!"));
            return;
        }

        RefreshVariable(variablesList->GetSelection(), newName, *selectedVariable);
        temporaryContainer->Rename(selectedVariableName, newName);
    }
    UpdateSelectedAndParentVariable();

    modificationCount++;
}

void ChooseVariableDialog::OnAddChildSelected(wxCommandEvent& event)
{
    UpdateSelectedAndParentVariable();
    if(!selectedVariable) return;

    gd::String newChildName = _("NewChild");
    for(unsigned int i = 2;selectedVariable->HasChild(newChildName);++i )
        newChildName = _("NewChild")+gd::String::From(i);

    selectedVariable->GetChild(newChildName);
    UpdateSelectedAndParentVariable();
    RefreshVariable(variablesList->GetSelection(), selectedVariableName, *selectedVariable);
    variablesList->Expand(variablesList->GetSelection());
    modificationCount++;
}

void ChooseVariableDialog::OnRemoveSelected(wxCommandEvent& event)
{
    UpdateSelectedAndParentVariable();

    if (parentVariable)
        parentVariable->RemoveChild(selectedVariableName);
    else
        temporaryContainer->Remove(selectedVariableName);

    variablesList->DeleteItem(variablesList->GetSelection());
    UpdateSelectedAndParentVariable();
    modificationCount++;
}

void ChooseVariableDialog::OnItemSelectionChanged(wxTreeListEvent& event)
{
    UpdateSelectedAndParentVariable();
    toolbar->EnableTool(idMoveUpVar, parentVariable == NULL);
    toolbar->EnableTool(idMoveDownVar, parentVariable == NULL);
    toolbar->Update();
    toolbar->Refresh();
}

void ChooseVariableDialog::UpdateSelectedAndParentVariable()
{
    wxTreeListItem selectedItem = variablesList->GetSelection();
    if (!selectedItem.IsOk())
    {
        selectedVariableName = "";
        selectedVariableFullName = "";
        selectedVariable = NULL;
        parentVariable = NULL;
    }

    selectedVariableName = variablesList->GetItemText(selectedItem);
    wxTreeListItem parent = variablesList->GetItemParent(selectedItem);
    if ( parent == variablesList->GetRootItem()  )
    {
        selectedVariable = &temporaryContainer->Get(selectedVariableName);
        selectedVariableFullName = selectedVariableName;
        parentVariable = NULL;
    }
    else
    {
        selectedVariableFullName.clear();
        selectedVariable = NULL;
        parentVariable = NULL;
        //Create a list containing the parents.
        std::vector<gd::String> parents;
        while(parent != variablesList->GetRootItem() && parent.IsOk() )
        {
            parents.insert(parents.begin(), variablesList->GetItemText(parent));
            parent = variablesList->GetItemParent(parent);
        }

        for(std::size_t i = 0;i<parents.size();++i)
        {
            //Generate the full name
            selectedVariableFullName += parents[i]+".";

            //Update parent variable and selected variable
            if (i==0)
                parentVariable = &temporaryContainer->Get(parents[i]);
            else
                parentVariable = &parentVariable->GetChild(parents[i]);
        }
        if ( parentVariable ) selectedVariable = &parentVariable->GetChild(selectedVariableName);
        selectedVariableFullName += selectedVariableName;
    }
}

void ChooseVariableDialog::SetAssociatedProject(const gd::Project * project)
{
    associatedProject = project;
    associatedLayout = NULL;
    associatedObject = NULL;
    toolbar->EnableTool(idFindUndeclared, true);
    UpdateTitle();
}

void ChooseVariableDialog::SetAssociatedLayout(const gd::Project * project, const gd::Layout * layout)
{
    associatedProject = project;
    associatedLayout = layout;
    associatedObject = NULL;
    toolbar->EnableTool(idFindUndeclared, true);
    UpdateTitle();
}

void ChooseVariableDialog::SetAssociatedObject(const gd::Project * project, const gd::Layout * layout, const gd::Object * object)
{
    associatedProject = project;
    associatedLayout = layout;
    associatedObject = object;
    toolbar->EnableTool(idFindUndeclared, true);
    UpdateTitle();
}

void ChooseVariableDialog::OnResize(wxSizeEvent& event)
{
    variablesList->SetColumnWidth(0, variablesList->GetSize().GetWidth()/2-5);
    variablesList->SetColumnWidth(1, variablesList->GetSize().GetWidth()/2-5);
    event.Skip();
}

wxTreeListItem ChooseVariableDialog::GetPreviousSibling(wxTreeListCtrl * ctrl, wxTreeListItem item)
{
    wxTreeListItem parent = ctrl->GetItemParent(item);
    wxTreeListItem previous;
    wxTreeListItem current = ctrl->GetFirstChild(parent);
    while (current.IsOk())
    {
        if ( current == item ) return previous;

        previous = current;
        current = variablesList->GetNextSibling(current);
    }

    wxTreeListItem invalid;
    return invalid;
}

}

#endif
