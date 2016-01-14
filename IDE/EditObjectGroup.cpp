/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "EditObjectGroup.h"

//(*InternalHeaders(EditObjectGroup)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/settings.h>
#include "GDCore/Tools/Log.h"
#include <wx/help.h>
#include <wx/msgdlg.h>
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/CommonTools.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <string>
#include <vector>

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

using namespace std;
using namespace gd;

//(*IdInit(EditObjectGroup)
const long EditObjectGroup::ID_AUITOOLBAR1 = wxNewId();
const long EditObjectGroup::ID_PANEL2 = wxNewId();
const long EditObjectGroup::ID_TREECTRL1 = wxNewId();
const long EditObjectGroup::ID_STATICLINE1 = wxNewId();
const long EditObjectGroup::ID_STATICBITMAP2 = wxNewId();
const long EditObjectGroup::ID_HYPERLINKCTRL1 = wxNewId();
const long EditObjectGroup::ID_BUTTON1 = wxNewId();
const long EditObjectGroup::ID_BUTTON2 = wxNewId();
const long EditObjectGroup::idAddObjet = wxNewId();
const long EditObjectGroup::idDelObjet = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditObjectGroup,wxDialog)
	//(*EventTable(EditObjectGroup)
	//*)
END_EVENT_TABLE()

EditObjectGroup::EditObjectGroup(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, const gd::ObjectGroup & group_) :
group(group_),
project(project_),
layout(layout_),
modificationCount(0)
{
	//(*Initialize(EditObjectGroup)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Edit the objects group"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	FlexGridSizer17->AddGrowableRow(1);
	Panel2 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxSize(-1,26), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	AuiManager1 = new wxAuiManager(Panel2, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(Panel2, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer17->Add(Panel2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	ObjetsList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(286,181), wxTR_MULTIPLE|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer17->Add(ObjetsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer3->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer3->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&ContextMenu), idAddObjet, _("Add an object"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	ContextMenu.Append(MenuItem1);
	MenuItem2 = new wxMenuItem((&ContextMenu), idDelObjet, _("Delete the object"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(gd::SkinHelper::GetIcon("delete", 16));
	ContextMenu.Append(MenuItem2);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListItemActivated);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditObjectGroup::OnhelpBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditObjectGroup::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditObjectGroup::OnAnnulerBtClick);
	Connect(idAddObjet,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditObjectGroup::OnAddObjetSelected);
	Connect(idDelObjet,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditObjectGroup::OnDelObjetSelected);
	//*)

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idAddObjet, _( "Add an object" ), gd::SkinHelper::GetIcon("add", 16), _("Add an object") );
    toolbar->AddTool( idDelObjet, _( "Delete the selected object" ), gd::SkinHelper::GetIcon("delete", 16), _("Delete the selected object") );
    toolbar->Realize();
    gd::SkinHelper::ApplyCurrentSkin(*toolbar);

    //Offer nice background color to toolbar area.
    AuiManager1->GetArtProvider()->SetColour(wxAUI_DOCKART_BACKGROUND_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));

    Refresh();
}

EditObjectGroup::~EditObjectGroup()
{
	//(*Destroy(EditObjectGroup)
	//*)
	AuiManager1->UnInit();
}

void EditObjectGroup::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void EditObjectGroup::OnAnnulerBtClick(wxCommandEvent& event)
{
    if ( modificationCount > 7 )
    {
        wxMessageDialog msgDlg(this, _("You made ")+gd::String::From(modificationCount)+_(" changes. Are you sure you want to cancel all changes\?"), _("Lot's of changes made."), wxYES_NO | wxICON_QUESTION);
        if ( msgDlg.ShowModal() == wxID_NO )
            return;
    }

    EndModal(0);
}

void EditObjectGroup::Refresh()
{
    ObjetsList->DeleteAllItems();
    ObjetsList->AddRoot( _( "All objects of the group" ) );

    std::vector< gd::String > allObjects = group.GetAllObjectsNames();
    for ( std::size_t i = 0;i < allObjects.size();i++ )
        ObjetsList->AppendItem( ObjetsList->GetRootItem(), allObjects.at(i) );

    ObjetsList->ExpandAll();
}

void EditObjectGroup::OnObjetsListBeginLabelEdit(wxTreeEvent& event)
{
}

void EditObjectGroup::OnObjetsListEndLabelEdit(wxTreeEvent& event)
{
}

void EditObjectGroup::OnObjetsListItemActivated(wxTreeEvent& event)
{
    itemSelected = event.GetItem();
}

void EditObjectGroup::OnObjetsListItemRightClick(wxTreeEvent& event)
{
    itemSelected = event.GetItem();
    PopupMenu( &ContextMenu );
}

void EditObjectGroup::OnAddObjetSelected(wxCommandEvent& event)
{
    gd::ChooseObjectDialog dialog(this, project, layout, false /*No groups*/, "" /*All objects types*/, true /*Allow multiple selection*/ );
    if ( dialog.ShowModal() == 1 )
    {
        for (std::size_t i = 0;i<dialog.GetChosenObjects().size();++i)
        {
            //On l'ajoute si il n'est pas d�j� dans le groupe
            if ( !group.Find( dialog.GetChosenObjects()[i] ) )
            {
                group.AddObject( dialog.GetChosenObjects()[i] );
                ObjetsList->AppendItem( ObjetsList->GetRootItem(), dialog.GetChosenObjects()[i] );
            } else { gd::LogWarning(_("Object ")+dialog.GetChosenObjects()[i]+_(" is already in this group."));}
        }

        modificationCount += dialog.GetChosenObjects().size();
    }
}

void EditObjectGroup::OnDelObjetSelected(wxCommandEvent& event)
{
    //Get selection and construct list of objects to remove.
    wxArrayTreeItemIds selection;
    std::size_t count = ObjetsList->GetSelections(selection);
    std::vector <gd::String> objectsToRemove;

    for (std::size_t i = 0;i<count;++i)
        objectsToRemove.push_back(ObjetsList->GetItemText( selection.Item(i) ));

    for (std::size_t i = 0;i<objectsToRemove.size();++i)
    {
        if ( group.Find( objectsToRemove[i] ) )
            group.RemoveObject(objectsToRemove[i]);
    }

    modificationCount += objectsToRemove.size();

    Refresh();
}


void EditObjectGroup::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/edit_group");
}
