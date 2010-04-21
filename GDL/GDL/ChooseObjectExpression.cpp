#if defined(GDE)
#include "GDL/ChooseObjectExpression.h"

//(*InternalHeaders(ChooseObjectExpression)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/ObjectGroup.h"
#include <string>
#include <vector>

using namespace std;

//(*IdInit(ChooseObjectExpression)
const long ChooseObjectExpression::ID_STATICBITMAP3 = wxNewId();
const long ChooseObjectExpression::ID_STATICTEXT1 = wxNewId();
const long ChooseObjectExpression::ID_PANEL1 = wxNewId();
const long ChooseObjectExpression::ID_STATICLINE2 = wxNewId();
const long ChooseObjectExpression::ID_RADIOBUTTON1 = wxNewId();
const long ChooseObjectExpression::ID_RADIOBUTTON2 = wxNewId();
const long ChooseObjectExpression::ID_RADIOBUTTON3 = wxNewId();
const long ChooseObjectExpression::ID_TREECTRL1 = wxNewId();
const long ChooseObjectExpression::ID_TREECTRL2 = wxNewId();
const long ChooseObjectExpression::ID_TREECTRL3 = wxNewId();
const long ChooseObjectExpression::ID_NOTEBOOK1 = wxNewId();
const long ChooseObjectExpression::ID_STATICLINE1 = wxNewId();
const long ChooseObjectExpression::ID_BUTTON1 = wxNewId();
const long ChooseObjectExpression::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseObjectExpression,wxDialog)
	//(*EventTable(ChooseObjectExpression)
	//*)
END_EVENT_TABLE()

ChooseObjectExpression::ChooseObjectExpression(wxWindow* parent, wxString title, Game & game_, Scene & scene_, bool canSelectGroup_, const vector < string > & mainObjectsName_) :
game(game_),
scene(scene_),
canSelectGroup(canSelectGroup_),
mainObjectsName(mainObjectsName_)
{
	//(*Initialize(ChooseObjectExpression)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("sd"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/objeticon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/objeticon64.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Vous souhaitez accéder à une propriété\nd\'un objet. Choisissez l\'objet auquel accéder."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Obj1Check = new wxRadioButton(this, ID_RADIOBUTTON1, _("L\'objet principal ("), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	Obj1Check->SetValue(true);
	FlexGridSizer17->Add(Obj1Check, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Obj2Check = new wxRadioButton(this, ID_RADIOBUTTON2, _("L\'objet secondaire ("), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	FlexGridSizer17->Add(Obj2Check, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	AutreCheck = new wxRadioButton(this, ID_RADIOBUTTON3, _("Un autre objet de la scène :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
	FlexGridSizer17->Add(AutreCheck, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(263,216), 0, _T("ID_NOTEBOOK1"));
	ObjetsList = new wxTreeCtrl(Notebook1, ID_TREECTRL1, wxPoint(-71,-11), wxSize(179,170), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	ObjetsList->SetToolTip(_("Choisissez un objet dans la liste"));
	GroupesList = new wxTreeCtrl(Notebook1, ID_TREECTRL2, wxPoint(-71,-11), wxSize(179,170), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL2"));
	GroupesList->SetToolTip(_("Choisissez un objet dans la liste"));
	globalObjectsList = new wxTreeCtrl(Notebook1, ID_TREECTRL3, wxPoint(-71,-11), wxSize(179,170), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL3"));
	globalObjectsList->SetToolTip(_("Choisissez un objet dans la liste"));
	Notebook1->AddPage(ObjetsList, _("Objets"), false);
	Notebook1->AddPage(GroupesList, _("Groupes d\'objets"), false);
	Notebook1->AddPage(globalObjectsList, _("Objets globaux"), false);
	FlexGridSizer17->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	ChoisirBt = new wxButton(this, ID_BUTTON1, _("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer17->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectExpression::OnObjetsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectExpression::OnObjetsListSelectionChanged);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectExpression::OnGroupesListItemActivated);
	Connect(ID_TREECTRL2,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectExpression::OnGroupesListSelectionChanged);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ChooseObjectExpression::OnglobalObjectsListItemActivated);
	Connect(ID_TREECTRL3,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChooseObjectExpression::OnglobalObjectsListSelectionChanged);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectExpression::OnChoisirBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseObjectExpression::OnAnnulerBtClick);
	//*)

	string nomObjet1 = !mainObjectsName.empty() ? mainObjectsName[0] : "";
	string nomObjet2 = mainObjectsName.size() > 1 ? mainObjectsName[1] : "";

	Obj1Check->SetLabel(_("L'objet principal (") + nomObjet1 + _(")"));
	Obj2Check->SetLabel(_("L'objet secondaire (") + nomObjet2 + _(")"));
    if ( mainObjectsName.size() < 2 )
        Obj2Check->Enable(false);
    if ( mainObjectsName.empty() )
        Obj1Check->Enable(false);

    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/objeticon.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/groupeobjeticon.png", wxBITMAP_TYPE_ANY ) ) );
    Notebook1->AssignImageList(imageList);

    Notebook1->SetPageImage(0,0);
    Notebook1->SetPageImage(1,1);

    SetTitle(title);

    Refresh();
}

ChooseObjectExpression::~ChooseObjectExpression()
{
	//(*Destroy(ChooseObjectExpression)
	//*)
}

/**
 * Populate tree with objects
 */
void ChooseObjectExpression::Refresh()
{
    ObjetsList->DeleteAllItems();
    ObjetsList->AddRoot( _( "Tous les objets de la scène" ) );

    for ( unsigned int i = 0;i < scene.initialObjects.size();i++ )
        ObjetsList->AppendItem( ObjetsList->GetRootItem(), scene.initialObjects[i]->GetName());

    ObjetsList->ExpandAll();


    GroupesList->DeleteAllItems();
    GroupesList->AddRoot( _( "Tous les groupes de la scène" ) );

    for ( unsigned int i = 0;i < scene.objectGroups.size();i++ )
        GroupesList->AppendItem( GroupesList->GetRootItem(), scene.objectGroups.at( i ).GetName() );

    GroupesList->ExpandAll();

    globalObjectsList->DeleteAllItems();
    globalObjectsList->AddRoot( _( "Tous les groupes de la scène" ) );

    for ( unsigned int i = 0;i < game.globalObjects.size();i++ )
        globalObjectsList->AppendItem( globalObjectsList->GetRootItem(), game.globalObjects[i]->GetName() );

    globalObjectsList->ExpandAll();
}

void ChooseObjectExpression::OnChoisirBtClick(wxCommandEvent& event)
{
	string nomObjet1 = !mainObjectsName.empty() ? mainObjectsName[0] : "";
	string nomObjet2 = mainObjectsName.size() > 1 ? mainObjectsName[1] : "";

    if ( Obj1Check->GetValue() )
        objet = nomObjet1;

    if ( Obj2Check->GetValue() )
        objet = nomObjet2;

    if ( AutreCheck->GetValue() )
    {
        if ( Notebook1->GetSelection() == 0 && ObjetsList->GetItemText( item ) != _( "Tous les objets de la scène" ) )
        {
            objet = static_cast<string>(ObjetsList->GetItemText( item ));
            EndModal(1);
        }
        else if ( GroupesList->IsEnabled() && Notebook1->GetSelection() == 1 && GroupesList->GetItemText( itemGroups ) != _( "Tous les groupes de la scène" ) )
        {
            objet = static_cast<string>(GroupesList->GetItemText( itemGroups ));
            EndModal(1);
        }
        else if ( Notebook1->GetSelection() == 2 && itemGlobal != globalObjectsList->GetRootItem() )
        {
            objet = static_cast<string>(globalObjectsList->GetItemText( itemGlobal ));
            EndModal(1);
        }
    }

    EndModal(1);
}

void ChooseObjectExpression::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChooseObjectExpression::OnObjetsListSelectionChanged(wxTreeEvent& event)
{
    item = event.GetItem();
    AutreCheck->SetValue(true);
}
void ChooseObjectExpression::OnGroupesListSelectionChanged(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
    AutreCheck->SetValue(true);
}

void ChooseObjectExpression::OnglobalObjectsListSelectionChanged(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
    AutreCheck->SetValue(true);
}

void ChooseObjectExpression::OnObjetsListItemActivated(wxTreeEvent& event)
{
    item = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectExpression::OnGroupesListItemActivated(wxTreeEvent& event)
{
    itemGroups = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

void ChooseObjectExpression::OnglobalObjectsListItemActivated(wxTreeEvent& event)
{
    itemGlobal = event.GetItem();
    wxCommandEvent uselessEvent;
    OnChoisirBtClick(uselessEvent);
}

#endif