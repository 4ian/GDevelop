#if defined(GD_IDE_ONLY)
#include "GDL/ChoixDossier.h"

//(*InternalHeaders(ChoixDossier)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDL/Dossier.h"
#include <wx/log.h>

#include <wx/textdlg.h>
#include <string>
#include <vector>

using namespace std;

//(*IdInit(ChoixDossier)
const long ChoixDossier::ID_STATICBITMAP3 = wxNewId();
const long ChoixDossier::ID_STATICTEXT1 = wxNewId();
const long ChoixDossier::ID_PANEL1 = wxNewId();
const long ChoixDossier::ID_STATICLINE1 = wxNewId();
const long ChoixDossier::ID_TREECTRL1 = wxNewId();
const long ChoixDossier::ID_STATICLINE2 = wxNewId();
const long ChoixDossier::ID_BUTTON2 = wxNewId();
const long ChoixDossier::ID_BUTTON1 = wxNewId();
const long ChoixDossier::idMenuAdd = wxNewId();
const long ChoixDossier::idMenuDel = wxNewId();
//*)

BEGIN_EVENT_TABLE( ChoixDossier, wxDialog )
    //(*EventTable(ChoixDossier)
    //*)
END_EVENT_TABLE()

ChoixDossier::ChoixDossier( wxWindow* parent, vector < Dossier > * pDossiers )
{
    //(*Initialize(ChoixDossier)
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem1;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer6;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer17;

    Create(parent, wxID_ANY, _T("Choisissez un dossier à afficher"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17->AddGrowableCol(0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/dossier48.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
    FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _T("Les dossiers permettent de regrouper\nles images suivant vos critères."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer6);
    FlexGridSizer6->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    TreeCtrl1 = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(157,175), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    TreeCtrl1->SetToolTip(_T("Choisissez un dossier, ou ajoutez en un avec le clic droit."));
    FlexGridSizer1->Add(TreeCtrl1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    ToutesImagesBt = new wxButton(this, ID_BUTTON2, _T("Toutes les images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer2->Add(ToutesImagesBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ChoisirBt = new wxButton(this, ID_BUTTON1, _T("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuItem1 = new wxMenuItem((&ContextMenu), idMenuAdd, _T("Ajouter un dossier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    ContextMenu.Append(MenuItem1);
    MenuItem2 = new wxMenuItem((&ContextMenu), idMenuDel, _T("Supprimer le dossier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/remove.png"))));
    ContextMenu.Append(MenuItem2);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);

    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ChoixDossier::OnTreeCtrl1ItemRightClick);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixDossier::OnTreeCtrl1SelectionChanged);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixDossier::OnToutesImagesBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixDossier::OnChoisirBtClick);
    Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChoixDossier::OnAddDossierBtClick);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ChoixDossier::OnDelDossierSelected);
    //*)

    dossiers = pDossiers;
    Refresh();
}

ChoixDossier::~ChoixDossier()
{
    //(*Destroy(ChoixDossier)
    //*)
}

void ChoixDossier::Refresh()
{
    TreeCtrl1->DeleteAllItems();
    TreeCtrl1->AddRoot( _T( "Tous les dossiers" ) );

    for ( unsigned int i = 0;i < dossiers->size() ;i++ )
    {
        TreeCtrl1->AppendItem( TreeCtrl1->GetRootItem(), dossiers->at( i ).nom );
    }

    TreeCtrl1->ExpandAll();
}

void ChoixDossier::OnChoisirBtClick( wxCommandEvent& event )
{
    if ( dossierNom == _T("Tous les dossiers") )
    {
        wxLogWarning(_T("Vous n'avez pas selectionné de dossier.\nPour afficher toutes les images, cliquez sur le bouton \"Toutes les images\"."));
        return;
    }
    EndModal( 1 );
}

void ChoixDossier::OnTreeCtrl1SelectionChanged( wxTreeEvent& event )
{
    itemSelected = event.GetItem();

    if ( TreeCtrl1->GetChildrenCount( itemSelected ) == 0 )
    {
        dossierNom = TreeCtrl1->GetItemText( itemSelected );
    }
}

void ChoixDossier::OnToutesImagesBtClick( wxCommandEvent& event )
{
    EndModal( 2 );
}

void ChoixDossier::OnAddDossierBtClick( wxCommandEvent& event )
{
    string nom = static_cast<string>( wxGetTextFromUser( _T( "Nom du nouveau dossier" ), _T( "Ajout de dossier" ) ) );

    for (unsigned int i = 0;i<dossiers->size() ;i++ )
    {
    	if ( dossiers->at(i).nom == nom )
    	{
            wxLogWarning(_T("Un dossier porte déjà ce nom !"));
            return;
    	}
    }

    Dossier dossier;
    dossier.nom = nom;

    dossiers->push_back(dossier);
    Refresh();
}

void ChoixDossier::OnDelDossierSelected(wxCommandEvent& event)
{
    string nom = static_cast<string>( TreeCtrl1->GetItemText( itemSelected ));

    for (unsigned int i = 0;i<dossiers->size() ;i++ )
    {
    	if ( dossiers->at(i).nom == nom )
    	{
    	    dossiers->erase(dossiers->begin() + i);
            Refresh();
            return;
    	}
    }
    wxLogWarning(_T("Impossible de trouver le dossier à supprimer."));
}

void ChoixDossier::OnTreeCtrl1ItemRightClick(wxTreeEvent& event)
{
    itemSelected = event.GetItem();

    if ( TreeCtrl1->GetChildrenCount( itemSelected ) == 0 )
    {
        dossierNom = TreeCtrl1->GetItemText( itemSelected );
    }

    PopupMenu(&ContextMenu);
}
#endif
