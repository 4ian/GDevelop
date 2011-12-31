/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

 #include "Fusion.h"

//(*InternalHeaders(Fusion)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/filedlg.h>
#include <string>
#include <vector>
#include <wx/log.h>
#include <wx/msgdlg.h>

#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/ExternalEvents.h"


using namespace std;

//(*IdInit(Fusion)
const long Fusion::ID_STATICBITMAP1 = wxNewId();
const long Fusion::ID_STATICTEXT1 = wxNewId();
const long Fusion::ID_PANEL1 = wxNewId();
const long Fusion::ID_STATICLINE1 = wxNewId();
const long Fusion::ID_CHECKBOX1 = wxNewId();
const long Fusion::ID_CHECKBOX2 = wxNewId();
const long Fusion::ID_CHECKBOX3 = wxNewId();
const long Fusion::ID_CHECKBOX4 = wxNewId();
const long Fusion::ID_CHECKBOX5 = wxNewId();
const long Fusion::ID_STATICLINE2 = wxNewId();
const long Fusion::ID_STATICTEXT2 = wxNewId();
const long Fusion::ID_BUTTON1 = wxNewId();
const long Fusion::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Fusion,wxDialog)
	//(*EventTable(Fusion)
	//*)
END_EVENT_TABLE()

Fusion::Fusion(wxWindow* parent, Game & game_) :
game(game_)
{
	//(*Initialize(Fusion)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Importer les éléments d\'un jeu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/fusionicon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/fusion.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer6->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("L\'importation permet de rajouter les éléments \nd\'un autre jeu à celui actuellement ouvert."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, this, _("Choisir les éléments à importer"));
	ImageCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	ImageCheck->SetValue(true);
	StaticBoxSizer1->Add(ImageCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	ScenesCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Scènes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	ScenesCheck->SetValue(true);
	StaticBoxSizer1->Add(ScenesCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	objectsCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Objets globaux"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	objectsCheck->SetValue(true);
	StaticBoxSizer1->Add(objectsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	groupsCheck = new wxCheckBox(this, ID_CHECKBOX4, _("Groupes d\'objets globaux"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
	groupsCheck->SetValue(true);
	StaticBoxSizer1->Add(groupsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	externalEventsCheck = new wxCheckBox(this, ID_CHECKBOX5, _("Evenements externes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX5"));
	externalEventsCheck->SetValue(true);
	StaticBoxSizer1->Add(externalEventsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Le jeu choisi ne sera pas modifié"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FusionBt = new wxButton(this, ID_BUTTON1, _("Choisir un jeu et l\'importer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(FusionBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON2, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(FermerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Fusion::OnFusionBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Fusion::OnFermerBtClick);
	//*)
}

Fusion::~Fusion()
{
	//(*Destroy(Fusion)
	//*)
}


void Fusion::OnFermerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void Fusion::OnFusionBtClick(wxCommandEvent& event)
{
    wxFileDialog dialog( this, _( "Choisissez le jeu à ouvrir" ), "", "", "*.gdg;*.jgd" );
    dialog.ShowModal();

    if ( dialog.GetPath() == "" )
        return;

    Game secondGame;
    OpenSaveGame open(secondGame);
    open.OpenFromFile(static_cast<string>( dialog.GetPath() ));

    if ( ImageCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.resourceManager.resources.size();i++)
        {
            if ( secondGame.resourceManager.resources[i] == boost::shared_ptr<Resource>() )
                continue;

            if ( game.resourceManager.HasResource(secondGame.resourceManager.resources[i]->name) )
            {
                wxString depart = _("Une ressource nommé \"");
                wxString fin = _("\" est déjà présente dans le jeu. Voulez vous la remplacer ?");
                if (wxMessageBox(depart+secondGame.resourceManager.resources[i]->name+fin, "Une ressource de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    game.resourceManager.RemoveResource(secondGame.resourceManager.resources[i]->name);
                    game.resourceManager.resources.push_back(secondGame.resourceManager.resources[i]->Clone());
                }

            }
            else
                game.resourceManager.resources.push_back(secondGame.resourceManager.resources[i]->Clone());
        }
    }
    if ( ScenesCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.scenes.size();i++)
        {
            vector< boost::shared_ptr<Scene> >::iterator scene =
                find_if(game.scenes.begin(), game.scenes.end(), bind2nd(SceneHasName(), secondGame.scenes[i]->GetName()));

            if ( scene != game.scenes.end())
            {
                wxString depart = _("Une scène nommé \"");
                wxString fin = _("\" est déjà présente dans le jeu. Voulez vous la remplacer ?");
                if (wxMessageBox(depart+secondGame.scenes[i]->GetName()+fin, "Une scène de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    *scene = boost::shared_ptr<Scene>(new Scene(*secondGame.scenes[i]));
                }
            }
            else
                game.scenes.push_back(boost::shared_ptr<Scene>(new Scene(*secondGame.scenes[i])));
        }
    }
    if ( objectsCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.globalObjects.size();i++)
        {
            vector< boost::shared_ptr<Object> >::iterator object =
                find_if(game.globalObjects.begin(), game.globalObjects.end(), bind2nd(ObjectHasName(), secondGame.globalObjects[i]->GetName()));

            if ( object != game.globalObjects.end())
            {
                wxString depart = _("Un objet global nommé \"");
                wxString fin = _("\" est déjà présent dans le jeu. Voulez vous le remplacer ?");
                if (wxMessageBox(depart+secondGame.globalObjects[i]->GetName()+fin, "Un objet global de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    *object = secondGame.globalObjects[i]->Clone();
                }
            }
            else
                game.globalObjects.push_back(secondGame.globalObjects[i]->Clone());
        }
    }
    if ( groupsCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.objectGroups.size();i++)
        {
            vector< ObjectGroup >::iterator group =
                find_if(game.objectGroups.begin(), game.objectGroups.end(), bind2nd(HasTheSameName(), secondGame.objectGroups[i].GetName()));

            if ( group != game.objectGroups.end())
            {
                wxString depart = _("Un groupe global nommé \"");
                wxString fin = _("\" est déjà présent dans le jeu. Voulez vous le remplacer ?");
                if (wxMessageBox(depart+secondGame.objectGroups[i].GetName()+fin, "Un groupe global de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    *group = secondGame.objectGroups[i];
                }
            }
            else
                game.objectGroups.push_back(secondGame.objectGroups[i]);
        }
    }
    if ( externalEventsCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.externalEvents.size();i++)
        {
            vector< boost::shared_ptr<ExternalEvents> >::iterator externalEvents =
                find_if(game.externalEvents.begin(), game.externalEvents.end(), bind2nd(ExternalEventsHasName(), secondGame.externalEvents[i]->GetName()));

            if ( externalEvents != game.externalEvents.end())
            {
                wxString depart = _("Des évènements externes nommés \"");
                wxString fin = _("\" sont déjà présent dans le jeu. Voulez vous les remplacer ?");
                if (wxMessageBox(depart+secondGame.externalEvents[i]->GetName()+fin, "Evenements externes déjà existants",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    *(*externalEvents) = *secondGame.externalEvents[i];
                }
            }
            else
                game.externalEvents.push_back( boost::shared_ptr<ExternalEvents>(new ExternalEvents(*secondGame.externalEvents[i])) );
        }
    }

    wxLogMessage(_("Le jeu a été correctement fusionné."));
}
