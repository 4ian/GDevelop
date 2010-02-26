#include "ChoixTemplateEvent.h"

//(*InternalHeaders(ChoixTemplateEvent)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include <wx/help.h>

#include <stdio.h>
#include <sys/types.h>
#include <dirent.h>

#include "tinyxml.h"
#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include "TemplateEvents.h"
#include "GDL/HelpFileAccess.h"

#define MSG(x) wxLogWarning(_(x));

//(*IdInit(ChoixTemplateEvent)
const long ChoixTemplateEvent::ID_TREECTRL1 = wxNewId();
const long ChoixTemplateEvent::ID_STATICBITMAP1 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT1 = wxNewId();
const long ChoixTemplateEvent::ID_PANEL1 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT2 = wxNewId();
const long ChoixTemplateEvent::ID_STATICLINE1 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT3 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT4 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL1 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT5 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL2 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT6 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL3 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT8 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL4 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT7 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL5 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT9 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL6 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT10 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL7 = wxNewId();
const long ChoixTemplateEvent::ID_STATICTEXT11 = wxNewId();
const long ChoixTemplateEvent::ID_TEXTCTRL8 = wxNewId();
const long ChoixTemplateEvent::ID_STATICLINE2 = wxNewId();
const long ChoixTemplateEvent::ID_BUTTON2 = wxNewId();
const long ChoixTemplateEvent::ID_BUTTON1 = wxNewId();
const long ChoixTemplateEvent::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE( ChoixTemplateEvent, wxDialog )
    //(*EventTable(ChoixTemplateEvent)
    //*)
END_EVENT_TABLE()

ChoixTemplateEvent::ChoixTemplateEvent( wxWindow* parent )
{
    //(*Initialize(ChoixTemplateEvent)
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer6;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("Choisir un modèle d\'évènement"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer4->AddGrowableCol(1);
    FlexGridSizer4->AddGrowableRow(0);
    TemplateTree = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(220,230), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    FlexGridSizer4->Add(TemplateTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/template.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
    FlexGridSizer3->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Modèles d\'évènements"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont StaticText1Font(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText1->SetFont(StaticText1Font);
    FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer3);
    FlexGridSizer3->Fit(Panel1);
    FlexGridSizer3->SetSizeHints(Panel1);
    FlexGridSizer2->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Les modèles d\'évènements permettent d\'ajouter rapidement un \nou plusieurs évènements, et de les adapter à votre scène."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    DesTxt = new wxStaticText(this, ID_STATICTEXT3, _("Selectionnez un modèle dans la liste"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer2->Add(DesTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer6->AddGrowableCol(0);
    Txt1 = new wxStaticText(this, ID_STATICTEXT4, _("Description paramètre 1"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    Txt1->Hide();
    FlexGridSizer6->Add(Txt1, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Param1Edit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    Param1Edit->Hide();
    FlexGridSizer6->Add(Param1Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt2 = new wxStaticText(this, ID_STATICTEXT5, _("Description paramètre 2"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    Txt2->Hide();
    FlexGridSizer6->Add(Txt2, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param2Edit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    Param2Edit->Hide();
    FlexGridSizer6->Add(Param2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt3 = new wxStaticText(this, ID_STATICTEXT6, _("Description paramètre 3"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    Txt3->Hide();
    FlexGridSizer6->Add(Txt3, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param3Edit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    Param3Edit->Hide();
    FlexGridSizer6->Add(Param3Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt4 = new wxStaticText(this, ID_STATICTEXT8, _("Description paramètre 4"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
    Txt4->Hide();
    FlexGridSizer6->Add(Txt4, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param4Edit = new wxTextCtrl(this, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
    Param4Edit->Hide();
    FlexGridSizer6->Add(Param4Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt5 = new wxStaticText(this, ID_STATICTEXT7, _("Description paramètre 5"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
    Txt5->Hide();
    FlexGridSizer6->Add(Txt5, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param5Edit = new wxTextCtrl(this, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
    Param5Edit->Hide();
    FlexGridSizer6->Add(Param5Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt6 = new wxStaticText(this, ID_STATICTEXT9, _("Description paramètre 6"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
    Txt6->Hide();
    FlexGridSizer6->Add(Txt6, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param6Edit = new wxTextCtrl(this, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
    Param6Edit->Hide();
    FlexGridSizer6->Add(Param6Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt7 = new wxStaticText(this, ID_STATICTEXT10, _("Description paramètre 7"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
    Txt7->Hide();
    FlexGridSizer6->Add(Txt7, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param7Edit = new wxTextCtrl(this, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
    Param7Edit->Hide();
    FlexGridSizer6->Add(Param7Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt8 = new wxStaticText(this, ID_STATICTEXT11, _("Description paramètre 8"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
    Txt8->Hide();
    FlexGridSizer6->Add(Txt8, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param8Edit = new wxTextCtrl(this, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
    Param8Edit->Hide();
    FlexGridSizer6->Add(Param8Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    InsererBt = new wxButton(this, ID_BUTTON2, _("Insérer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer5->Add(InsererBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AnnulerBt = new wxButton(this, ID_BUTTON1, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer5->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer5->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ChoixTemplateEvent::OnTemplateTreeSelectionChanged);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixTemplateEvent::OnInsererBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixTemplateEvent::OnAnnulerBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoixTemplateEvent::OnAideBtClick);
    //*)

    Refresh();
    RefreshTree();
}

ChoixTemplateEvent::~ChoixTemplateEvent()
{
    //(*Destroy(ChoixTemplateEvent)
    //*)
}


void ChoixTemplateEvent::OnInsererBtClick( wxCommandEvent& event )
{
    if ( ListeTemplates.empty() )
        return;

    ProcessEvents(ListeTemplates.at( 0 ).events);

    TemplateFinal = ListeTemplates.at( 0 );
    EndModal( 1 );
    return;
}


////////////////////////////////////////////////////////////
/// Remplace les _PARAMx_ par les paramètres
////////////////////////////////////////////////////////////
void ChoixTemplateEvent::ProcessEvents(vector < Event > & events )
{
    //Pour chaque évènement
    for ( unsigned int j = 0;j < events.size() ; j++ )
    {
        //Pour chaque condition
        for ( unsigned int k = 0;k < events.at( j ).conditions.size() ;k++ )
        {
            //Pour chaque paramètre
            for ( unsigned int l = 0;l < events.at( j ).conditions.at( k ).GetParameters().size() ;l++ )
            {
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM1_", static_cast<string>( Param1Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM2_", static_cast<string>( Param2Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM3_", static_cast<string>( Param3Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM4_", static_cast<string>( Param4Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM5_", static_cast<string>( Param5Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM6_", static_cast<string>( Param6Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM7_", static_cast<string>( Param7Edit->GetValue() ) ) );
                events.at( j ).conditions.at( k ).SetParameter( l , ConvertParam( events.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM8_", static_cast<string>( Param8Edit->GetValue() ) ) );

            }
        }
        //Pour chaque condition
        for ( unsigned int k = 0;k < events.at( j ).actions.size() ;k++ )
        {
            //Pour chaque paramètre
            for ( unsigned int l = 0;l < events.at( j ).actions.at( k ).GetParameters().size() ;l++ )
            {
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM1_", static_cast<string>( Param1Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM2_", static_cast<string>( Param2Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM3_", static_cast<string>( Param3Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM4_", static_cast<string>( Param4Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM5_", static_cast<string>( Param5Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM6_", static_cast<string>( Param6Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM7_", static_cast<string>( Param7Edit->GetValue() ) ) );
                events.at( j ).actions.at( k ).SetParameter( l , ConvertParam( events.at( j ).actions.at( k ).GetParameter( l ).GetPlainString(), "_PARAM8_", static_cast<string>( Param8Edit->GetValue() ) ) );
            }
        }

        //Les sous évènements aussi
        if ( !events[j].events.empty() ) ProcessEvents(events[j].events);
    }
}

void ChoixTemplateEvent::OnAnnulerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

/**
 * Refresh parameters with current template
 */
void ChoixTemplateEvent::Refresh()
{
    if ( !item.IsOk()) return;
    if ( TemplateTree->GetItemText( item ) == _( "Tous les modèles" ) || TemplateTree->GetItemText( item ) == "")
        return;

    ListeTemplates.clear();

    //Ouverture du fichier selectionné
    wxString fichier = "Template/" + TemplateTree->GetItemText( item );
    TiXmlDocument doc( fichier.c_str() );
    if ( !doc.LoadFile() )
    {
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Erreur lors du chargement : " ) + ErrorDescription;
        wxLogWarning( Error );
    }

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem;

    elem = hdl.FirstChildElement( "Template" ).Element();

    //Passage en revue des templates
    while ( elem )
    {
        TemplateEvents TEtoAdd;

        if ( elem->Attribute( "nom" ) != NULL ) { TEtoAdd.nom = elem->Attribute( "nom" ); }
        else { wxLogWarning( "Les informations concernant le nom d'un template manquent." ); }
        if ( elem->Attribute( "desc" ) != NULL ) { TEtoAdd.desc = elem->Attribute( "desc" ); }
        else { wxLogWarning( "Les informations concernant la description d'un template manquent." ); }
        if ( elem->Attribute( "param1" ) != NULL ) { TEtoAdd.param1 = elem->Attribute( "param1" ); }
        else { wxLogWarning( "Les informations concernant le 1er paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param2" ) != NULL ) { TEtoAdd.param2 = elem->Attribute( "param2" ); }
        else { wxLogWarning( "Les informations concernant le 2eme paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param3" ) != NULL ) { TEtoAdd.param3 = elem->Attribute( "param3" ); }
        else { wxLogWarning( "Les informations concernant le 3eme paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param4" ) != NULL ) { TEtoAdd.param4 = elem->Attribute( "param4" ); }
        else { wxLogWarning( "Les informations concernant le 4eme paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param5" ) != NULL ) { TEtoAdd.param5 = elem->Attribute( "param5" ); }
        else { wxLogWarning( "Les informations concernant le 5eme paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param6" ) != NULL ) { TEtoAdd.param6 = elem->Attribute( "param6" ); }
        else { wxLogWarning( "Les informations concernant le 6eme paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param7" ) != NULL ) { TEtoAdd.param7 = elem->Attribute( "param7" ); }
        else { wxLogWarning( "Les informations concernant le 7eme paramètre d'un template manquent." ); }
        if ( elem->Attribute( "param8" ) != NULL ) { TEtoAdd.param8 = elem->Attribute( "param8" ); }
        else { wxLogWarning( "Les informations concernant le 8eme paramètre d'un template manquent." ); }

        if ( elem->FirstChildElement( "Events" ) != NULL )
            OpenSaveGame::OpenEvents(TEtoAdd.events, elem->FirstChildElement( "Events" ));
        else
            wxLogWarning( _( "Les évènements du modèle d'évènement manquent." ) );

        ListeTemplates.push_back( TEtoAdd );
        elem = elem->NextSiblingElement();

    }

}


void ChoixTemplateEvent::RefreshTree()
{
    TemplateTree->DeleteAllItems();
    TemplateTree->AddRoot( _( "Tous les modèles" ) );


    struct dirent *lecture;
    DIR *rep;
    rep = opendir( "template" );
    int l = 0;

    while (( lecture = readdir( rep ) ) )
    {
        string lec = lecture->d_name;
        if ( lec == "." || lec == ".." )
        {
        }
        else
        {
            TemplateTree->AppendItem( TemplateTree->GetRootItem(), lecture->d_name );
            l++;
        }
    }
    closedir( rep );
}

void ChoixTemplateEvent::OnTemplateTreeSelectionChanged( wxTreeEvent& event )
{
    item = event.GetItem();
    Refresh();

    int i = 0;
    if ( ListeTemplates.empty() )
        return;

    DesTxt->SetLabel( ListeTemplates.at( i ).desc );
    if ( ListeTemplates.at( i ).param1 != "" )
    {
        Txt1->Show( true );
        Param1Edit->Show( true );
        Txt1->SetLabel( ListeTemplates.at( i ).param1 );
    }
    else { Txt1->Show( false );Param1Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param2 != "" )
    {
        Txt2->Show( true );
        Param2Edit->Show( true );
        Txt2->SetLabel( ListeTemplates.at( i ).param2 );
    }
    else { Txt2->Show( false );Param2Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param3 != "" )
    {
        Txt3->Show( true );
        Param3Edit->Show( true );
        Txt3->SetLabel( ListeTemplates.at( i ).param3 );
    }
    else { Txt3->Show( false );Param3Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param4 != "" )
    {
        Txt4->Show( true );
        Param4Edit->Show( true );
        Txt4->SetLabel( ListeTemplates.at( i ).param4 );
    }
    else { Txt4->Show( false );Param4Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param5 != "" )
    {
        Txt5->Show( true );
        Param5Edit->Show( true );
        Txt5->SetLabel( ListeTemplates.at( i ).param5 );
    }
    else { Txt5->Show( false );Param5Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param6 != "" )
    {
        Txt6->Show( true );
        Param6Edit->Show( true );
        Txt6->SetLabel( ListeTemplates.at( i ).param6 );
    }
    else { Txt6->Show( false );Param6Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param7 != "" )
    {
        Txt7->Show( true );
        Param7Edit->Show( true );
        Txt7->SetLabel( ListeTemplates.at( i ).param7 );
    }
    else { Txt7->Show( false );Param7Edit->Show( false ); }

    if ( ListeTemplates.at( i ).param8 != "" )
    {
        Txt8->Show( true );
        Param8Edit->Show( true );
        Txt8->SetLabel( ListeTemplates.at( i ).param8 );
    }
    else { Txt8->Show( false );Param8Edit->Show( false ); }


    Layout();
    Fit();
}

string ChoixTemplateEvent::ConvertParam( string Parametre, string ToReplace, string ReplaceBy )
{
    if ( Parametre.find( ToReplace ) != string::npos )
        Parametre.replace( Parametre.find( ToReplace ), ToReplace.length(), ReplaceBy );

    return Parametre;
}

void ChoixTemplateEvent::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(151);
}
