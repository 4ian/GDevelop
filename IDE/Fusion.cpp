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
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/Scene.h"
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

	Create(parent, wxID_ANY, _("Import items from a game"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
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
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Importing allows you to add elements from\nanother game to the one currently open."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, this, _("Select items to import"));
	ImageCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	ImageCheck->SetValue(true);
	StaticBoxSizer1->Add(ImageCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	ScenesCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Scenes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	ScenesCheck->SetValue(true);
	StaticBoxSizer1->Add(ScenesCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	objectsCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Global objects"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	objectsCheck->SetValue(true);
	StaticBoxSizer1->Add(objectsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	groupsCheck = new wxCheckBox(this, ID_CHECKBOX4, _("Global object groups"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
	groupsCheck->SetValue(true);
	StaticBoxSizer1->Add(groupsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	externalEventsCheck = new wxCheckBox(this, ID_CHECKBOX5, _("External events"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX5"));
	externalEventsCheck->SetValue(true);
	StaticBoxSizer1->Add(externalEventsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("The chosen game will not change"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FusionBt = new wxButton(this, ID_BUTTON1, _("Choose a game and import it"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(FusionBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON2, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
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
    wxFileDialog dialog( this, _( "Choose the game to open" ), "", "", "*.gdg;*.jgd" );
    dialog.ShowModal();

    if ( dialog.GetPath() == "" )
        return;

    Game secondGame;
    secondGame.LoadFromFile(static_cast<string>( dialog.GetPath() ));

    if ( ImageCheck->GetValue() )
    {
        std::vector<std::string> resources = secondGame.GetResourcesManager().GetAllResourcesList();
        for(unsigned int i = 0;i<resources.size();i++)
        {
            if ( game.GetResourcesManager().HasResource(resources[i]) )
            {
                wxString depart = _("A resource named \"");
                wxString fin = _("\" already exists in the game. Do you want to replace it \?");
                if (wxMessageBox(depart+resources[i]+fin, _("A resource with this name already exists"),wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    game.GetResourcesManager().RemoveResource(resources[i]);
                    game.GetResourcesManager().AddResource(secondGame.GetResourcesManager().GetResource(resources[i]));
                }

            }
            else
                game.GetResourcesManager().AddResource(secondGame.GetResourcesManager().GetResource(resources[i]));
        }
    }
    if ( ScenesCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.GetLayoutCount();i++)
        {
            if ( game.HasLayoutNamed(secondGame.GetLayout(i).GetName() ))
            {
                wxString depart = _("A scene named \"");
                wxString fin = _("\" already exists in the game. Do you want to replace it \?");
                if (wxMessageBox(depart+secondGame.GetLayout(i).GetName()+fin, "Une scène de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Replace layout by the new one
                    unsigned int layoutPosition = game.GetLayoutPosition(secondGame.GetLayout(i).GetName());
                    game.RemoveLayout(secondGame.GetLayout(i).GetName());
                    game.InsertLayout(secondGame.GetLayout(i), layoutPosition);
                }
            }
            else
                game.InsertLayout(secondGame.GetLayout(i), game.GetLayoutCount());
        }
    }
    if ( objectsCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.GetGlobalObjects().size();i++)
        {
            vector< boost::shared_ptr<Object> >::iterator object =
                find_if(game.GetGlobalObjects().begin(), game.GetGlobalObjects().end(), bind2nd(ObjectHasName(), secondGame.GetGlobalObjects()[i]->GetName()));

            if ( object != game.GetGlobalObjects().end())
            {
                wxString depart = _("A global object named \"");
                wxString fin = _("\" already exists in the game. Do you want to replace it \?");
                if (wxMessageBox(depart+secondGame.GetGlobalObjects()[i]->GetName()+fin, "Un objet global de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    *object = boost::shared_ptr<Object>(secondGame.GetGlobalObjects()[i]->Clone());
                }
            }
            else
                game.GetGlobalObjects().push_back(boost::shared_ptr<Object>(secondGame.GetGlobalObjects()[i]->Clone()));
        }
    }
    if ( groupsCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.GetObjectGroups().size();i++)
        {
            vector< gd::ObjectGroup >::iterator group =
                find_if(game.GetObjectGroups().begin(), game.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), secondGame.GetObjectGroups()[i].GetName()));

            if ( group != game.GetObjectGroups().end())
            {
                wxString depart = _("A global group named \"");
                wxString fin = _("\" already exists in the game. Do you want to replace it \?");
                if (wxMessageBox(depart+secondGame.GetObjectGroups()[i].GetName()+fin, "Un groupe global de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    *group = secondGame.GetObjectGroups()[i];
                }
            }
            else
                game.GetObjectGroups().push_back(secondGame.GetObjectGroups()[i]);
        }
    }
    if ( externalEventsCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.GetExternalEventsCount();i++)
        {
            if ( game.HasExternalEventsNamed(secondGame.GetExternalEvents(i).GetName()) )
            {
                //Ask for confirmation if we're about to replace already existing external events
                wxString depart = _("Externals events called \"");
                wxString fin = _("\" already exists in the game. Do you want to replace it \?");
                if (wxMessageBox(depart+secondGame.GetExternalEvents(i).GetName()+fin, "Evenements externes déjà existants",wxYES_NO ) == wxYES)
                {
                    //Replace external events by the new ones
                    unsigned int eventsPosition = game.GetExternalEventsPosition(secondGame.GetExternalEvents(i).GetName());
                    game.RemoveLayout(secondGame.GetExternalEvents(i).GetName());
                    game.InsertExternalEvents(secondGame.GetExternalEvents(i), eventsPosition);
                }
            }
            else
                game.InsertExternalEvents(secondGame.GetExternalEvents(i), game.GetExternalEventsCount());
        }
    }

    wxLogMessage(_("The game has been properly merged."));
}

