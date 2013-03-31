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

#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"
#include "GDL/OpenSaveGame.h"
#include "TemplateEvents.h"
#include "GDCore/Tools/HelpFileAccess.h"

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
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("Choose a template"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
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
    StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/template.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
    FlexGridSizer3->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Templates"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont StaticText1Font(16,wxSWISS,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText1->SetFont(StaticText1Font);
    FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer3);
    FlexGridSizer3->Fit(Panel1);
    FlexGridSizer3->SetSizeHints(Panel1);
    FlexGridSizer2->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Template allow you to add quickly one or several events\nand to adapt them to your scene."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    DesTxt = new wxStaticText(this, ID_STATICTEXT3, _("Select a template in the list"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer2->Add(DesTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    controlsSizer = new wxFlexGridSizer(0, 1, 0, 0);
    controlsSizer->AddGrowableCol(0);
    Txt1 = new wxStaticText(this, ID_STATICTEXT4, _("Parameter 1 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    Txt1->Hide();
    controlsSizer->Add(Txt1, 1, wxTOP|wxLEFT|wxRIGHT|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Param1Edit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    Param1Edit->Hide();
    controlsSizer->Add(Param1Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt2 = new wxStaticText(this, ID_STATICTEXT5, _("Parameter 2 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    Txt2->Hide();
    controlsSizer->Add(Txt2, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param2Edit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    Param2Edit->Hide();
    controlsSizer->Add(Param2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt3 = new wxStaticText(this, ID_STATICTEXT6, _("Parameter 3 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    Txt3->Hide();
    controlsSizer->Add(Txt3, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param3Edit = new wxTextCtrl(this, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    Param3Edit->Hide();
    controlsSizer->Add(Param3Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt4 = new wxStaticText(this, ID_STATICTEXT8, _("Parameter 4 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
    Txt4->Hide();
    controlsSizer->Add(Txt4, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param4Edit = new wxTextCtrl(this, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
    Param4Edit->Hide();
    controlsSizer->Add(Param4Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt5 = new wxStaticText(this, ID_STATICTEXT7, _("Parameter 5 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
    Txt5->Hide();
    controlsSizer->Add(Txt5, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param5Edit = new wxTextCtrl(this, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
    Param5Edit->Hide();
    controlsSizer->Add(Param5Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt6 = new wxStaticText(this, ID_STATICTEXT9, _("Parameter 6 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
    Txt6->Hide();
    controlsSizer->Add(Txt6, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param6Edit = new wxTextCtrl(this, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
    Param6Edit->Hide();
    controlsSizer->Add(Param6Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt7 = new wxStaticText(this, ID_STATICTEXT10, _("Parameter 7 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
    Txt7->Hide();
    controlsSizer->Add(Txt7, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param7Edit = new wxTextCtrl(this, ID_TEXTCTRL7, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
    Param7Edit->Hide();
    controlsSizer->Add(Param7Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Txt8 = new wxStaticText(this, ID_STATICTEXT11, _("Parameter 8 description :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
    Txt8->Hide();
    controlsSizer->Add(Txt8, 1, wxTOP|wxLEFT|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Param8Edit = new wxTextCtrl(this, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
    Param8Edit->Hide();
    controlsSizer->Add(Param8Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2->Add(controlsSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    InsererBt = new wxButton(this, ID_BUTTON2, _("Insert"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer5->Add(InsererBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AnnulerBt = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer5->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON3, _("Help"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
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
    if ( templatesList.empty() )
        return;

    ProcessEvents(templatesList.at( 0 ).events);

    finalTemplate = templatesList.at( 0 );
    EndModal( 1 );
    return;
}


////////////////////////////////////////////////////////////
/// Remplace les _PARAMx_ par les paramètres
////////////////////////////////////////////////////////////
void ChoixTemplateEvent::ProcessEvents(vector < gd::BaseEventSPtr > & events )
{
    //Pour chaque évènement
    for ( unsigned int j = 0;j < events.size() ; j++ )
    {
        vector < vector<gd::Instruction>* > allConditionsVectors = events[j]->GetAllConditionsVectors();
        for ( unsigned int k = 0;k < allConditionsVectors.size() ;k++ )
        {
            for (unsigned int l = 0;l<allConditionsVectors[k]->size();++l)
            {
            	for (unsigned int m = 0;m<allConditionsVectors[k]->at(l).GetParameters().size();++m)
            	{
            	    unsigned int paramNb = 0;
                    while ( paramNb < parametersEdit.size() )
                    {
                        string str = allConditionsVectors[k]->at(l).GetParameter(m).GetPlainString();
                        allConditionsVectors[k]->at(l).SetParameter(m , ConvertParam( str, "_PARAM"+ToString(paramNb+1)+"_", static_cast<string>( parametersEdit[paramNb]->GetValue() ) ) );
                        paramNb++;
                    }
            	}
            }
        }

        vector < vector<gd::Instruction>* > allActionsVectors = events[j]->GetAllActionsVectors();
        for ( unsigned int k = 0;k < allActionsVectors.size() ;k++ )
        {
            for (unsigned int l = 0;l<allActionsVectors[k]->size();++l)
            {
            	for (unsigned int m = 0;m<allActionsVectors[k]->at(l).GetParameters().size();++m)
            	{
            	    unsigned int paramNb = 0;
                    while ( paramNb < parametersEdit.size() )
                    {
                        string str = allActionsVectors[k]->at(l).GetParameter(m).GetPlainString();
                        allActionsVectors[k]->at(l).SetParameter(m , ConvertParam( str, "_PARAM"+ToString(paramNb+1)+"_", static_cast<string>( parametersEdit[paramNb]->GetValue() ) ) );
                        paramNb++;
                    }
            	}
            }
        }

        //Les sous évènements aussi
        if ( events[j]->CanHaveSubEvents() ) ProcessEvents(events[j]->GetSubEvents());
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
    if ( TemplateTree->GetItemText( item ) == _( "All templates" ) || TemplateTree->GetItemText( item ) == "")
        return;

    templatesList.clear();

    //Ouverture du fichier selectionné
    wxString fichier = "Templates/" + TemplateTree->GetItemText( item );
    TiXmlDocument doc( fichier.c_str() );
    if ( !doc.LoadFile() )
    {
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Error while loading :" ) + ErrorDescription;
        wxLogWarning( Error );
    }

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem;

    elem = hdl.FirstChildElement( "Template" ).Element();

    //Passage en revue des templates
    while ( elem )
    {
        TemplateEvents newTemplate;

        //For backward compatibility with GD 1.3.8892 and inferior
        if ( elem->Attribute( "nom" ) != NULL ) { newTemplate.name = elem->Attribute( "nom" ); }

        if ( elem->Attribute( "name" ) != NULL ) { newTemplate.name = elem->Attribute( "name" ); }
        if ( elem->Attribute( "desc" ) != NULL ) { newTemplate.desc = elem->Attribute( "desc" ); }
        else { wxLogWarning( "Les informations concernant la description d'un template manquent." ); }

        unsigned int i = 1;
        while ( elem->Attribute(string("param"+ToString(i)).c_str()) != NULL )
        {
            newTemplate.parameters.push_back(elem->Attribute(string("param"+ToString(i)).c_str()));
            ++i;
        }

        if ( elem->FirstChildElement( "Events" ) != NULL )
            OpenSaveGame::OpenEvents(newTemplate.events, elem->FirstChildElement( "Events" ));
        else
            wxLogWarning( _( "The events of the template are missing." ) );

        templatesList.push_back( newTemplate );
        elem = elem->NextSiblingElement();

    }

}


void ChoixTemplateEvent::RefreshTree()
{
    TemplateTree->DeleteAllItems();
    TemplateTree->AddRoot( _( "All templates" ) );


    struct dirent *lecture;
    DIR *rep;
    rep = opendir( "Templates" );
    int l = 0;

    while (( lecture = readdir( rep ) ) )
    {
        wxString lec = lecture->d_name;
        if ( lec == "." || lec == ".." || !lec.EndsWith(".mgd") )
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

    int j = 0;
    if ( templatesList.empty() )
        return;

    DesTxt->SetLabel( templatesList[j].desc );

    //Add control if necessary
    while ( descriptionsTxt.size() < templatesList[j].parameters.size() )
    {
        descriptionsTxt.push_back(new wxStaticText(this, wxID_ANY, _("Description"), wxDefaultPosition, wxDefaultSize, 0, ToString(descriptionsTxt.size())));
        controlsSizer->Add(descriptionsTxt.back(), 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
        parametersEdit.push_back(new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, ToString(parametersEdit.size())));
        controlsSizer->Add(parametersEdit.back(), 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    }

    //Hide all controls
    for (unsigned int i = 0;i<descriptionsTxt.size();++i)
    {
    	descriptionsTxt[i]->Show(false);
    	parametersEdit[i]->Show(false);
    }

    //Update control for each parameter
    for (unsigned int i = 0;i<templatesList[j].parameters.size();++i)
    {
        if ( templatesList[j].parameters[i] != "" )
        {
            descriptionsTxt[i]->Show(true);
            parametersEdit[i]->Show(true);
            descriptionsTxt[i]->SetLabel(templatesList[j].parameters[i]);
        }
    }

    Layout();
    Fit();
}

string ChoixTemplateEvent::ConvertParam( string parameter, const string & toReplace, const string & replaceBy )
{
    if ( parameter.find( toReplace ) != string::npos )
        parameter.replace( parameter.find( toReplace ), toReplace.length(), replaceBy );

    return parameter;
}

void ChoixTemplateEvent::OnAideBtClick(wxCommandEvent& event)
{
    /*if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplaySection(151);
    else*/
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/events_editor/template")); //TODO
}

