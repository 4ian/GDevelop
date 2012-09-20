/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "EditObjectGroup.h"

//(*InternalHeaders(EditObjectGroup)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/settings.h>
#include <wx/log.h>
#include <wx/help.h>
#include <wx/msgdlg.h>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDL/CommonTools.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <string>
#include <vector>

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

using namespace std;

//(*IdInit(EditObjectGroup)
const long EditObjectGroup::ID_STATICBITMAP3 = wxNewId();
const long EditObjectGroup::ID_STATICTEXT3 = wxNewId();
const long EditObjectGroup::ID_PANEL1 = wxNewId();
const long EditObjectGroup::ID_STATICLINE2 = wxNewId();
const long EditObjectGroup::ID_AUITOOLBAR1 = wxNewId();
const long EditObjectGroup::ID_PANEL2 = wxNewId();
const long EditObjectGroup::ID_TREECTRL1 = wxNewId();
const long EditObjectGroup::ID_STATICLINE1 = wxNewId();
const long EditObjectGroup::ID_BUTTON1 = wxNewId();
const long EditObjectGroup::ID_BUTTON2 = wxNewId();
const long EditObjectGroup::idAddObjet = wxNewId();
const long EditObjectGroup::idDelObjet = wxNewId();
//*)
const long EditObjectGroup::ID_Help = wxNewId();

BEGIN_EVENT_TABLE(EditObjectGroup,wxDialog)
	//(*EventTable(EditObjectGroup)
	//*)
END_EVENT_TABLE()

EditObjectGroup::EditObjectGroup(wxWindow* parent, Game & game_, Scene & scene_, const gd::ObjectGroup & group_) :
group(group_),
game(game_),
scene(scene_),
modificationCount(0)
{
	//(*Initialize(EditObjectGroup)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Edit the objects group"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	FlexGridSizer17->AddGrowableRow(3);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/groupeobjet48.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Objects group allow to use the name of the group\nto refer to all objects it contains."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxSize(-1,26), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	AuiManager1 = new wxAuiManager(Panel2, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(Panel2, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer17->Add(Panel2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ObjetsList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(286,181), wxTR_MULTIPLE|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer17->Add(ObjetsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&ContextMenu), idAddObjet, _("Add an object"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(MenuItem1);
	MenuItem2 = new wxMenuItem((&ContextMenu), idDelObjet, _("Delete the object"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	ContextMenu.Append(MenuItem2);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Panel2->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditObjectGroup::OnPanel2Resize,0,this);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditObjectGroup::OnObjetsListItemActivated);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditObjectGroup::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditObjectGroup::OnAnnulerBtClick);
	Connect(idAddObjet,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditObjectGroup::OnAddObjetSelected);
	Connect(idDelObjet,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditObjectGroup::OnDelObjetSelected);
	//*)
	Connect(ID_Help,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditObjectGroup::OnHelp);

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idAddObjet, _( "Add an object" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Add an object") );
    toolbar->AddTool( idDelObjet, _( "Delete the selected object" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Delete the selected object") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, _( "Objects group editor help" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Objects group editor help") );
    toolbar->Realize();

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

void EditObjectGroup::OnHelp(wxCommandEvent& event)
{
    if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(181);
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_group"));
}


void EditObjectGroup::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void EditObjectGroup::OnAnnulerBtClick(wxCommandEvent& event)
{
    if ( modificationCount > 7 )
    {
        wxMessageDialog msgDlg(this, _("You made ")+ToString(modificationCount)+_(" changes. Are you sure you want to cancel all changes\?"), _("Lot's of changes made."), wxYES_NO | wxICON_QUESTION);
        if ( msgDlg.ShowModal() == wxID_NO )
            return;
    }

    EndModal(0);
}

void EditObjectGroup::Refresh()
{
    ObjetsList->DeleteAllItems();
    ObjetsList->AddRoot( _( "All objects of the group" ) );

    vector < string > allObjects = group.GetAllObjectsNames();
    for ( unsigned int i = 0;i < allObjects.size();i++ )
        ObjetsList->AppendItem( ObjetsList->GetRootItem(), allObjects.at(i) );

    ObjetsList->ExpandAll();
}

////////////////////////////////////////////////////////////
/// Mise à jour de la toolbar
////////////////////////////////////////////////////////////
void EditObjectGroup::OnPanel2Resize(wxSizeEvent& event)
{
    toolbar->SetSize(Panel2->GetSize().x, -1);
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
    gd::ChooseObjectDialog dialog(this, game, scene, false /*No groups*/, "" /*All objects types*/, true /*Allow multiple selection*/ );
    if ( dialog.ShowModal() == 1 )
    {
        for (unsigned int i = 0;i<dialog.GetChosenObjects().size();++i)
        {
            //On l'ajoute si il n'est pas déjà dans le groupe
            if ( !group.Find( dialog.GetChosenObjects()[i] ) )
            {
                group.AddObject( dialog.GetChosenObjects()[i] );
                ObjetsList->AppendItem( ObjetsList->GetRootItem(), dialog.GetChosenObjects()[i] );
            } else { wxLogWarning(_("Object ")+dialog.GetChosenObjects()[i]+_(" is already in this group."));}
        }

        modificationCount += dialog.GetChosenObjects().size();
    }
}

void EditObjectGroup::OnDelObjetSelected(wxCommandEvent& event)
{
    //Get selection and construct list of objects to remove.
    wxArrayTreeItemIds selection;
    unsigned int count = ObjetsList->GetSelections(selection);
    std::vector <std::string> objectsToRemove;

    for (unsigned int i = 0;i<count;++i)
        objectsToRemove.push_back(ToString(ObjetsList->GetItemText( selection.Item(i) )));

    for (unsigned int i = 0;i<objectsToRemove.size();++i)
    {
        if ( group.Find( objectsToRemove[i] ) )
            group.RemoveObject(objectsToRemove[i]);
    }

    modificationCount += objectsToRemove.size();

    Refresh();
}

