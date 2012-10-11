/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

//(*InternalHeaders(ChooseObjectDialog)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/imaglist.h>
#include <wx/config.h>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDCore/IDE/CommonBitmapManager.h"

namespace gd
{

//(*IdInit(ChooseObjectDialog)
const long ChooseObjectDialog::ID_TREECTRL1 = wxNewId();
const long ChooseObjectDialog::ID_TREECTRL2 = wxNewId();
const long ChooseObjectDialog::ID_TREECTRL3 = wxNewId();
const long ChooseObjectDialog::ID_TREECTRL4 = wxNewId();
const long ChooseObjectDialog::ID_NOTEBOOK1 = wxNewId();
const long ChooseObjectDialog::ID_TEXTCTRL1 = wxNewId();
const long ChooseObjectDialog::ID_STATICLINE1 = wxNewId();
const long ChooseObjectDialog::ID_BUTTON1 = wxNewId();
const long ChooseObjectDialog::ID_BUTTON2 = wxNewId();
const long ChooseObjectDialog::ID_BUTTON3 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM2 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM1 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM3 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseObjectDialog,wxDialog)
	//(*EventTable(ChooseObjectDialog)
	//*)
END_EVENT_TABLE()

ChooseObjectDialog::ChooseObjectDialog(wxWindow* parent, Project & project_, gd::Layout & layout_, bool canSelectGroup_, std::string onlyObjectOfType_, bool allowMultipleSelection_) :
project(project_),
layout(layout_),
onlyObjectOfType(onlyObjectOfType_),
allowMultipleSelection(allowMultipleSelection_),
canSelectGroup(canSelectGroup_)
{
	//(*Initialize(ChooseObjectDialog)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choose an object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX|wxMINIMIZE_BOX, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/objeticon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	ObjetsList = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	ObjetsList->SetToolTip(_("Choose an object in the list"));
	GroupesList = new wxTreeCtrl(Notebook1, ID_TREECTRL2, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL2"));
	GroupesList->SetToolTip(_("Choose an object in the list"));
	globalObjectsList = new wxTreeCtrl(Notebook1, ID_TREECTRL3, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL3"));
	globalObjectsList->SetToolTip(_("Choose an object in the list"));
	globalObjectGroups = new wxTreeCtrl(Notebook1, ID_TREECTRL4, wxPoint(-71,-11), wxDefaultSize, wxTR_HIDE_ROOT|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL4"));
	globalObjectGroups->SetToolTip(_("Choose an object in the list"));
	Notebook1->AddPage(ObjetsList, _("Objects"), false);
	Notebook1->AddPage(GroupesList, _("Objects groups"), false);
	Notebook1->AddPage(globalObjectsList, _("Global objects"), false);
	Notebook1->AddPage(globalObjectGroups, _("Global groups"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	searchCtrl->SetFocus();
	FlexGridSizer1->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	ChoisirBt = new wxButton(this, ID_BUTTON1, _("Choose"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AucunBt = new wxButton(this, ID_BUTTON3, _("None"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(AucunBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuItem = new wxMenuItem((&Menu1), ID_MENUITEM2, _("Choose this object"), wxEmptyString, wxITEM_NORMAL);
	Menu1.Append(editMenuItem);
	#ifdef __WXMSW__
	    Menu1.Remove(editMenuItem);
	    wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	    editMenuItem->SetFont(boldFont);
	    Menu1.Append(editMenuItem);
	#endif
	Menu1.AppendSeparator();
	MenuItem1 = new wxMenuItem((&Menu1), ID_MENUITEM1, _("To add some objects, use the objects editor"), wxEmptyString, wxITEM_NORMAL);
	Menu1.Append(MenuItem1);
	editGroupMenuItem = new wxMenuItem((&Menu2), ID_MENUITEM3, _("Choose this group"), wxEmptyString, wxITEM_NORMAL);
	Menu2.Append(editGroupMenuItem);
	#ifdef __WXMSW__
	    Menu2.Remove(editGroupMenuItem);
	    wxFont boldFont2(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	    editGroupMenuItem->SetFont(boldFont2);
	    Menu2.Append(editGroupMenuItem);
	#endif
	Menu2.AppendSeparator();
	MenuItem4 = new wxMenuItem((&Menu2), ID_MENUITEM4, _("To add some groups, use the objects groups editor"), wxEmptyString, wxITEM_NORMAL);
	Menu2.Append(MenuItem4);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectDialog::OnObjetsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObjectDialog::OnObjetsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectDialog::OnObjetsListSelectionChanged);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectDialog::OnGroupesListItemActivated);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObjectDialog::OnGroupesListItemRightClick);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectDialog::OnGroupesListSelectionChanged);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectDialog::OnglobalObjectsListItemActivated);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObjectDialog::OnglobalObjectsListItemRightClick);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectDialog::OnglobalObjectsListSelectionChanged);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectDialog::OnglobalObjectGroupsItemActivated);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChooseObjectDialog::OnglobalObjectGroupsItemRightClick);
	Connect(ID_TREECTRL4,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectDialog::OnglobalObjectGroupsSelectionChanged);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChooseObjectDialog::OnsearchCtrlText);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectDialog::OnChoisirBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectDialog::OnAnnulerBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectDialog::OnAucunBtClick);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseObjectDialog::OnChoisirBtClick);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseObjectDialog::OnChoisirBtClick);
	//*)

    //Disable multiple selection if needed
	if (!allowMultipleSelection)
    {
        ObjetsList->SetWindowStyleFlag(ObjetsList->GetWindowStyleFlag() & ~wxTR_MULTIPLE);
        GroupesList->SetWindowStyleFlag(GroupesList->GetWindowStyleFlag() & ~wxTR_MULTIPLE);
        globalObjectsList->SetWindowStyleFlag(globalObjectsList->GetWindowStyleFlag() & ~wxTR_MULTIPLE);
        globalObjectGroups->SetWindowStyleFlag(globalObjectGroups->GetWindowStyleFlag() & ~wxTR_MULTIPLE);
    }

    //Assign icons
    imageList = new wxImageList( 16, 16 );
    imageList->Add( gd::CommonBitmapManager::GetInstance()->objectBt );
    imageList->Add( gd::CommonBitmapManager::GetInstance()->objectGroup16 );
    Notebook1->AssignImageList(imageList);
    Notebook1->SetPageImage(0,0);
    Notebook1->SetPageImage(1,1);
    Notebook1->SetPageImage(2,0);
    Notebook1->SetPageImage(3,1);

    //Remove pages if necessary
    if (!canSelectGroup)
    {
        Notebook1->RemovePage(3);
        Notebook1->RemovePage(1);
    }

    SetSize(400, 500);
	Refresh();
}

ChooseObjectDialog::~ChooseObjectDialog()
{
	//(*Destroy(ChooseObjectDialog)
	//*)
}

void ChooseObjectDialog::Refresh()
{
    ObjectListDialogsHelper objectListsHelper(project, layout);
    objectListsHelper.RefreshLists(ObjetsList, GroupesList, globalObjectsList, globalObjectGroups, onlyObjectOfType, ToString(searchCtrl->GetValue()));
}

void ChooseObjectDialog::OnChoisirBtClick(wxCommandEvent& event)
{
    int objectsListNotebookId = 0;
    int objectGroupsListNotebookId = canSelectGroup ? 1 : -1;
    int globalObjectsListNotebookId = canSelectGroup ? 2 : 1;
    int globalObjectGroupsListNotebookId = canSelectGroup ? 3 : -1;

    if ( Notebook1->GetSelection() == objectsListNotebookId && item.IsOk() && ObjetsList->GetRootItem() != item )
    {
        //Get selection and construct list of objects selected
        wxArrayTreeItemIds selectionIds; unsigned int count = ObjetsList->GetSelections(selectionIds);
        for (unsigned int i = 0;i<count;++i) objectsChosen.push_back(ToString(ObjetsList->GetItemText( selectionIds.Item(i) )));

        objectChosen = !objectsChosen.empty() ? objectsChosen[0] : "";
        EndModal(1);
    }
    else if (  Notebook1->GetSelection() == objectGroupsListNotebookId &&  GroupesList->IsEnabled() && itemGroups.IsOk() && GroupesList->GetRootItem() != itemGroups )
    {
        //Get selection and construct list of objects selected
        wxArrayTreeItemIds selectionIds; unsigned int count = GroupesList->GetSelections(selectionIds);
        for (unsigned int i = 0;i<count;++i) objectsChosen.push_back(ToString(GroupesList->GetItemText( selectionIds.Item(i) )));

        objectChosen = !objectsChosen.empty() ? objectsChosen[0] : "";
        EndModal(1);
    }
    else if ( Notebook1->GetSelection() == globalObjectsListNotebookId && itemGlobal.IsOk() && globalObjectsList->GetRootItem() != itemGlobal )
    {
        //Get selection and construct list of objects selected
        wxArrayTreeItemIds selectionIds; unsigned int count = globalObjectsList->GetSelections(selectionIds);
        for (unsigned int i = 0;i<count;++i) objectsChosen.push_back(ToString(globalObjectsList->GetItemText( selectionIds.Item(i) )));

        objectChosen = !objectsChosen.empty() ? objectsChosen[0] : "";
        EndModal(1);
    }
    else if ( Notebook1->GetSelection() == globalObjectGroupsListNotebookId && itemGlobalGroups.IsOk() && globalObjectGroups->GetRootItem() != itemGlobalGroups )
    {
        //Get selection and construct list of objects selected
        wxArrayTreeItemIds selectionIds; unsigned int count = globalObjectGroups->GetSelections(selectionIds);
        for (unsigned int i = 0;i<count;++i) objectsChosen.push_back(ToString(globalObjectGroups->GetItemText( selectionIds.Item(i) )));

        objectChosen = !objectsChosen.empty() ? objectsChosen[0] : "";
        EndModal(1);
    }
}

void ChooseObjectDialog::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChooseObjectDialog::OnAucunBtClick(wxCommandEvent& event)
{
    objectChosen.clear();
    EndModal(1);
}

void ChooseObjectDialog::OnObjetsListSelectionChanged(wxTreeEvent& event)
{
    item = event.GetItem();
}

void ChooseObjectDialog::OnObjetsListItemRightClick(wxTreeEvent& event)
{
    item = event.GetItem();
    PopupMenu(&Menu1);
}

void ChooseObjectDialog::OnObjetsListItemActivated(wxTreeEvent& event)
{
    item = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectDialog::OnGroupesListSelectionChanged(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
}
void ChooseObjectDialog::OnGroupesListItemRightClick(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
    PopupMenu(&Menu2);
}

void ChooseObjectDialog::OnGroupesListItemActivated(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectDialog::OnglobalObjectsListSelectionChanged(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
}

void ChooseObjectDialog::OnglobalObjectsListItemRightClick(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
    PopupMenu(&Menu1);
}

void ChooseObjectDialog::OnglobalObjectGroupsSelectionChanged(wxTreeEvent& event)
{
    itemGlobalGroups = event.GetItem();
}

void ChooseObjectDialog::OnglobalObjectsListItemActivated(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectDialog::OnglobalObjectGroupsItemActivated(wxTreeEvent& event)
{
    itemGlobalGroups = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectDialog::OnglobalObjectGroupsItemRightClick(wxTreeEvent& event)
{
    itemGlobalGroups = event.GetItem();
    PopupMenu(&Menu2);
}

void ChooseObjectDialog::OnsearchCtrlText(wxCommandEvent& event)
{
    Refresh();
}

}
