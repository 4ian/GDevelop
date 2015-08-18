/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
//(*InternalHeaders(ChooseObjectDialog)
#include "GDCore/Tools/Localization.h"
#include <wx/string.h>
//*)
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/bitmap.h>
#include <wx/imaglist.h>
#include <wx/config.h>
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ObjectListDialogsHelper.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"

namespace gd
{

//(*IdInit(ChooseObjectDialog)
const long ChooseObjectDialog::ID_TREECTRL1 = wxNewId();
const long ChooseObjectDialog::ID_TEXTCTRL1 = wxNewId();
const long ChooseObjectDialog::ID_STATICLINE1 = wxNewId();
const long ChooseObjectDialog::ID_BUTTON1 = wxNewId();
const long ChooseObjectDialog::ID_BUTTON2 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM2 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM1 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM3 = wxNewId();
const long ChooseObjectDialog::ID_MENUITEM4 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseObjectDialog,wxDialog)
	//(*EventTable(ChooseObjectDialog)
	//*)
END_EVENT_TABLE()

ChooseObjectDialog::ChooseObjectDialog(wxWindow* parent, Project & project_, gd::Layout & layout_, bool canSelectGroup_, gd::String onlyObjectOfType_, bool allowMultipleSelection_) :
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
	FrameIcon.CopyFromBitmap(gd::SkinHelper::GetIcon("object", 16));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	objectsList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(objectsList, 0, wxEXPAND|wxALIGN_LEFT|wxALIGN_TOP, 0);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	searchCtrl->SetFocus();
	FlexGridSizer1->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	ChoisirBt = new wxButton(this, ID_BUTTON1, _("Choose"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
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
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChooseObjectDialog::OnsearchCtrlText);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectDialog::OnChoisirBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectDialog::OnAnnulerBtClick);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseObjectDialog::OnChoisirBtClick);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChooseObjectDialog::OnChoisirBtClick);
	//*)

    //Disable multiple selection if needed
	if (!allowMultipleSelection)
    {
        objectsList->SetWindowStyleFlag(objectsList->GetWindowStyleFlag() & ~wxTR_MULTIPLE);
    }

	ChoisirBt->SetMinSize(wxSize(-1, 25)); //Ensure the choose button is not hidden.
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
    objectListsHelper.SetSearchText(searchCtrl->GetValue());
    objectListsHelper.SetAllowedObjectType(onlyObjectOfType);
    objectListsHelper.SetGroupsAllowed(canSelectGroup);
    objectListsHelper.RefreshList(objectsList);
}

void ChooseObjectDialog::OnChoisirBtClick(wxCommandEvent& event)
{
    wxArrayTreeItemIds selectionIds;
    unsigned int count = objectsList->GetSelections(selectionIds);
    for (unsigned int i = 0;i<count;++i)
        objectsChosen.push_back(objectsList->GetItemText( selectionIds.Item(i) ));

    objectChosen = !objectsChosen.empty() ? objectsChosen[0] : "";
    EndModal(1);
}

void ChooseObjectDialog::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChooseObjectDialog::OnObjetsListSelectionChanged(wxTreeEvent& event)
{
    item = event.GetItem();
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(item));
    if(!data)
    	ChoisirBt->Disable();
    else
    	ChoisirBt->Enable();
}

void ChooseObjectDialog::OnObjetsListItemRightClick(wxTreeEvent& event)
{
    item = event.GetItem();
    PopupMenu(&Menu1);
}

void ChooseObjectDialog::OnObjetsListItemActivated(wxTreeEvent& event)
{
    item = event.GetItem();

    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(item));
    if(!data)
    	return;

    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectDialog::OnsearchCtrlText(wxCommandEvent& event)
{
    Refresh();
}

}
#endif
