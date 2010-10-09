#include "EditObjectGroup.h"

//(*InternalHeaders(EditObjectGroup)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/ObjectGroup.h"
#include "GDL/ChooseObject.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <string>
#include <vector>
#include <wx/help.h>


#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

using namespace std;

//(*IdInit(EditObjectGroup)
const long EditObjectGroup::ID_STATICBITMAP3 = wxNewId();
const long EditObjectGroup::ID_STATICTEXT3 = wxNewId();
const long EditObjectGroup::ID_PANEL1 = wxNewId();
const long EditObjectGroup::ID_STATICLINE2 = wxNewId();
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

EditObjectGroup::EditObjectGroup(wxWindow* parent, Game & game_, Scene & scene_, const ObjectGroup & group_) :
group(group_),
game(game_),
scene(scene_)
{
	//(*Initialize(EditObjectGroup)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;
	
	Create(parent, wxID_ANY, _("Editer le groupe d\'objets"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/groupeobjet48.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Les groupes d\'objets permettent d\'utiliser le nom\ndu groupe pour se référer à tous les objets qu\'il\ncontient."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxSize(-1,26), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer17->Add(Panel2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ObjetsList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(286,181), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer17->Add(ObjetsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&ContextMenu), idAddObjet, _("Ajouter un objet"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(MenuItem1);
	MenuItem2 = new wxMenuItem((&ContextMenu), idDelObjet, _("Supprimer l\'objet"), wxEmptyString, wxITEM_NORMAL);
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

    toolbar = new wxToolBar( Panel2, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idAddObjet, wxT( "Ajouter un objet" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter un objet") );
    toolbar->AddTool( idDelObjet, wxT( "Supprimer l'objet selectionné" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer l'objet selectionné") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_Help, wxT( "Aide de l'éditeur de groupes d'objets" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide de l'éditeur de groupes d'objets") );
    toolbar->Realize();

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif

    Refresh();
}

EditObjectGroup::~EditObjectGroup()
{
	//(*Destroy(EditObjectGroup)
	//*)
}

void EditObjectGroup::OnHelp(wxCommandEvent& event)
{
    wxHelpController * help = new wxHelpController;
    help->Initialize( "aide.chm" );
    help->DisplaySection( 181 );
}


void EditObjectGroup::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void EditObjectGroup::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditObjectGroup::Refresh()
{
    ObjetsList->DeleteAllItems();
    ObjetsList->AddRoot( _( "Tous les objets du groupe" ) );

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
    ChooseObject dialog(this, game, scene, false);
    if ( dialog.ShowModal() == 1 )
    {
        string name = dialog.objectChosen;
        if ( name == "" ) return;

        //On l'ajoute si il n'est pas déjà dans le groupe
        if ( !group.Find( name ) )
        {
            group.AddObject( name );
            ObjetsList->AppendItem( ObjetsList->GetRootItem(), name );
        } else { wxLogWarning(_("L'objet est déjà dans ce groupe."));}
    }
}

void EditObjectGroup::OnDelObjetSelected(wxCommandEvent& event)
{
    if ( ObjetsList->GetItemText( itemSelected ) != _( "Tous les objets du groupe" ) )
    {
        if ( group.Find( static_cast<string>(ObjetsList->GetItemText( itemSelected ))) )
        {
            group.RemoveObject(static_cast<string>(ObjetsList->GetItemText( itemSelected )));
            ObjetsList->Delete( itemSelected );
        }
        return;
    }
    else
    {
        wxLogWarning( _( "Aucun objet sélectionnée" ) );
    }
}
