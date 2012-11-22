#include "CreateTemplate.h"

//(*InternalHeaders(CreateTemplate)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include <wx/filedlg.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDL/tinyxml/tinyxml.h"
#include <string>
#include <vector>

#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/CommonTools.h"

using namespace std;

//(*IdInit(CreateTemplate)
const long CreateTemplate::ID_STATICBITMAP3 = wxNewId();
const long CreateTemplate::ID_STATICTEXT1 = wxNewId();
const long CreateTemplate::ID_PANEL1 = wxNewId();
const long CreateTemplate::ID_STATICLINE1 = wxNewId();
const long CreateTemplate::ID_STATICTEXT5 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL18 = wxNewId();
const long CreateTemplate::ID_STATICTEXT4 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL17 = wxNewId();
const long CreateTemplate::ID_BUTTON4 = wxNewId();
const long CreateTemplate::ID_PANEL2 = wxNewId();
const long CreateTemplate::ID_STATICTEXT2 = wxNewId();
const long CreateTemplate::ID_STATICTEXT3 = wxNewId();
const long CreateTemplate::ID_STATICTEXT6 = wxNewId();
const long CreateTemplate::ID_STATICTEXT7 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL1 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL16 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL15 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL14 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL13 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL12 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL11 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL10 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL9 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL8 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL7 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL6 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL5 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL4 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL3 = wxNewId();
const long CreateTemplate::ID_TEXTCTRL2 = wxNewId();
const long CreateTemplate::ID_PANEL3 = wxNewId();
const long CreateTemplate::ID_NOTEBOOK1 = wxNewId();
const long CreateTemplate::ID_STATICLINE2 = wxNewId();
const long CreateTemplate::ID_BUTTON2 = wxNewId();
const long CreateTemplate::ID_BUTTON1 = wxNewId();
const long CreateTemplate::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE( CreateTemplate, wxDialog )
    //(*EventTable(CreateTemplate)
    //*)
END_EVENT_TABLE()

CreateTemplate::CreateTemplate( wxWindow* parent, vector < gd::BaseEventSPtr > & events_ ) :
events( events_ )
{
    //(*Initialize(CreateTemplate)
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer6;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer17;

    Create(parent, wxID_ANY, _("Create a template"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17->AddGrowableCol(0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/addtemplate.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
    FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("You can create a template from actual events of the scene\nA template allow to automatically and quickly create events,\njust filling in some parameters."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer6);
    FlexGridSizer6->Fit(Panel1);
    FlexGridSizer6->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
    Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer4->AddGrowableCol(1);
    FlexGridSizer4->AddGrowableRow(1);
    StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("Template name :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    nomEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL18, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL18"));
    FlexGridSizer4->Add(nomEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT4, _("Template description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_TOP, 5);
    descEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL17, wxEmptyString, wxDefaultPosition, wxSize(201,64), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL17"));
    FlexGridSizer4->Add(descEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(-1,-1,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Button1 = new wxButton(Panel2, ID_BUTTON4, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer4->Add(Button1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    Panel2->SetSizer(FlexGridSizer4);
    FlexGridSizer4->Fit(Panel2);
    FlexGridSizer4->SetSizeHints(Panel2);
    Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer2->AddGrowableCol(1);
    StaticText2 = new wxStaticText(Panel3, ID_STATICTEXT2, _("Search this\nin parameters of\nactions and conditions"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT2"));
    wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText2->SetFont(StaticText2Font);
    FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText3 = new wxStaticText(Panel3, ID_STATICTEXT3, _("Description that will be given"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText3->SetFont(StaticText3Font);
    FlexGridSizer2->Add(StaticText3, 1, wxALL|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Example : MyObject"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    wxFont StaticText6Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText6->SetFont(StaticText6Font);
    FlexGridSizer2->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText7 = new wxStaticText(Panel3, ID_STATICTEXT7, _("Example : Enter the name of the Hero object."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
    wxFont StaticText7Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText7->SetFont(StaticText7Font);
    FlexGridSizer2->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj1Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer2->Add(NomObj1Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc1Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL16, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL16"));
    FlexGridSizer2->Add(Desc1Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj2Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL15, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL15"));
    FlexGridSizer2->Add(NomObj2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc2Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL14, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL14"));
    FlexGridSizer2->Add(Desc2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj3Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL13, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL13"));
    FlexGridSizer2->Add(NomObj3Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc3Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL12, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL12"));
    FlexGridSizer2->Add(Desc3Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj4Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL11, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL11"));
    FlexGridSizer2->Add(NomObj4Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc4Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL10, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL10"));
    FlexGridSizer2->Add(Desc4Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj5Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL9, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
    FlexGridSizer2->Add(NomObj5Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc5Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
    FlexGridSizer2->Add(Desc5Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj6Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
    FlexGridSizer2->Add(NomObj6Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc6Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
    FlexGridSizer2->Add(Desc6Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj7Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
    FlexGridSizer2->Add(NomObj7Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc7Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
    FlexGridSizer2->Add(Desc7Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObj8Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(118,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    FlexGridSizer2->Add(NomObj8Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Desc8Edit = new wxTextCtrl(Panel3, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    FlexGridSizer2->Add(Desc8Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel3->SetSizer(FlexGridSizer2);
    FlexGridSizer2->Fit(Panel3);
    FlexGridSizer2->SetSizeHints(Panel3);
    Notebook1->AddPage(Panel2, _("Information on the template"), false);
    Notebook1->AddPage(Panel3, _("Parameters"), false);
    FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    CreateBt = new wxButton(this, ID_BUTTON2, _("Create"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer3->Add(CreateBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AnnulerBt = new wxButton(this, ID_BUTTON1, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer3->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON3, _("Help"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer3->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);

    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CreateTemplate::OnButton1Click);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CreateTemplate::OnCreateBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CreateTemplate::OnAnnulerBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&CreateTemplate::OnAideBtClick);
    //*)
}

CreateTemplate::~CreateTemplate()
{
    //(*Destroy(CreateTemplate)
    //*)
}

struct sizestring
{
    bool operator()( const std::pair<string, int> & left, const std::pair<string, int> & right )
    {
        return left.first.size() > right.first.size();
    }
};

void CreateTemplate::OnCreateBtClick( wxCommandEvent& event )
{
    vector < std::pair<string, int> > parameters;

    //On rajoute tous les paramètres et leur numéro
    if ( NomObj1Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj1Edit->GetValue() ), 1 ) );
    if ( NomObj2Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj2Edit->GetValue() ), 2 ) );
    if ( NomObj3Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj3Edit->GetValue() ), 3 ) );
    if ( NomObj4Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj4Edit->GetValue() ), 4 ) );
    if ( NomObj5Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj5Edit->GetValue() ), 5 ) );
    if ( NomObj6Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj6Edit->GetValue() ), 6 ) );
    if ( NomObj7Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj7Edit->GetValue() ), 7 ) );
    if ( NomObj8Edit->GetValue() != "" )
        parameters.push_back( std::pair<string, int>( static_cast<string>( NomObj8Edit->GetValue() ), 8 ) );

    //On classe de la plus petite chaine à la plus grande
    std::sort( parameters.begin(), parameters.end(), sizestring() );

    ProcessEvents(events, parameters);

    TiXmlDocument doc;
    TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "ISO-8859-1", "" );
    doc.LinkEndChild( decl );

    TiXmlElement * root = new TiXmlElement( "Template" );
    doc.LinkEndChild( root );

    root->SetAttribute( "nom", nomEdit->GetValue().c_str() );
    root->SetAttribute( "desc", descEdit->GetValue().c_str() );
    root->SetAttribute( "param1", Desc1Edit->GetValue().c_str() );
    root->SetAttribute( "param2", Desc2Edit->GetValue().c_str() );
    root->SetAttribute( "param3", Desc3Edit->GetValue().c_str() );
    root->SetAttribute( "param4", Desc4Edit->GetValue().c_str() );
    root->SetAttribute( "param5", Desc5Edit->GetValue().c_str() );
    root->SetAttribute( "param6", Desc6Edit->GetValue().c_str() );
    root->SetAttribute( "param7", Desc7Edit->GetValue().c_str() );
    root->SetAttribute( "param8", Desc8Edit->GetValue().c_str() );

    TiXmlElement * elemEvents = new TiXmlElement( "Events" );
    root->LinkEndChild( elemEvents );

    OpenSaveGame::SaveEvents(events, elemEvents);

    wxFileDialog dialog( this, _( "Choose where save the template" ), "Templates", "", "Template (*.mgd)|*.mgd", wxFD_SAVE );
    ;

    if ( dialog.ShowModal() != wxID_CANCEL )
    {
        string path = static_cast<string>( dialog.GetPath() );

        if ( !doc.SaveFile( path.c_str() ) )
        {
            wxLogError( _( "Unable to save file. Check that the drive has enough free space, is not write-protected and you have read/write permissions." ) );
            return;
        }

        wxLogMessage(_("The template was correctly created."));
    }
}

////////////////////////////////////////////////////////////
/// Remplace les paramètres par des _PARAMx_
////////////////////////////////////////////////////////////
void CreateTemplate::ProcessEvents(vector < gd::BaseEventSPtr > & eventsToProcess, vector < std::pair<string, int> > parameters)
{
    //On remplace dans chaque paramètre des actions et des conditions
    for ( unsigned int i = 0;i < eventsToProcess.size() ;i++ )
    {
        vector < vector<gd::Instruction>* > allConditionsVectors = eventsToProcess[i]->GetAllConditionsVectors();
        for (unsigned int c = 0;c<allConditionsVectors.size();++c)
        {
            for ( unsigned int nb = 0;nb < allConditionsVectors[c]->size() ;nb++ )
            {
                vector < gd::Expression > parametres = allConditionsVectors[c]->at( nb ).GetParameters();
                for ( unsigned int j = 0;j < parametres.size() ;j++ )
                {
                    //On respecte bien l'ordre, du plus grand au plus petit
                    for ( unsigned int k = 0; k < parameters.size() ;k++ )
                    {
                        string ReplaceBy = "_PARAM" +ToString( parameters.at( k ).second ) + "_";
                        parametres.at( j ) = gd::Expression( ConvertParam( parametres.at( j ).GetPlainString(), parameters.at( k ).first, ReplaceBy ) );
                    }
                }
                allConditionsVectors[c]->at( nb ).SetParameters(parametres);
            }
        }

        vector < vector<gd::Instruction>* > allActionsVectors = eventsToProcess[i]->GetAllActionsVectors();
        for (unsigned int a = 0;a<allActionsVectors.size();++a)
        {
            for ( unsigned int nb = 0;nb < allActionsVectors[a]->size() ;nb++ )
            {
                vector < gd::Expression > parametres = allActionsVectors[a]->at( nb ).GetParameters();
                for ( unsigned int j = 0;j < parametres.size() ;j++ )
                {
                    //On respecte bien l'ordre, du plus grand au plus petit
                    for ( unsigned int k = 0; k < parameters.size() ;k++ )
                    {
                        string ReplaceBy = "_PARAM" +ToString( parameters.at( k ).second ) + "_";
                        parametres.at( j ) = gd::Expression( ConvertParam( parametres.at( j ).GetPlainString(), parameters.at( k ).first, ReplaceBy ) );
                    }
                }
                allActionsVectors[a]->at( nb ).SetParameters(parametres);
            }
        }


        //Les sous évènements aussi
        if ( eventsToProcess[i]->CanHaveSubEvents() )
            ProcessEvents(eventsToProcess[i]->GetSubEvents(), parameters);
    }
}

void CreateTemplate::OnAnnulerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

string CreateTemplate::ConvertParam( string Parametre, string ToReplace, string ReplaceBy )
{
    if ( ToReplace == "" ) return Parametre;

    if ( Parametre.find( ToReplace ) != string::npos )
        Parametre.replace( Parametre.find( ToReplace ), ToReplace.length(), ReplaceBy );

    return Parametre;
}

void CreateTemplate::OnAideBtClick( wxCommandEvent& event )
{
    /*if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(151);
    else*/
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/create_template")); //TODO
}

void CreateTemplate::OnButton1Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(1);
}

