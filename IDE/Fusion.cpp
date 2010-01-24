#include "Fusion.h"

#ifdef DEBUG
#include "nommgr.h"
#endif

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

#ifdef DEBUG

#endif

#include "GDL/StdAlgo.h"
#include "GDL/Game.h"
#include "GDL/ChercherScene.h"
#include "GDL/OpenSaveGame.h"


using namespace std;

//(*IdInit(Fusion)
const long Fusion::ID_STATICBITMAP1 = wxNewId();
const long Fusion::ID_STATICTEXT1 = wxNewId();
const long Fusion::ID_PANEL1 = wxNewId();
const long Fusion::ID_STATICLINE1 = wxNewId();
const long Fusion::ID_CHECKBOX1 = wxNewId();
const long Fusion::ID_CHECKBOX2 = wxNewId();
const long Fusion::ID_STATICLINE2 = wxNewId();
const long Fusion::ID_STATICTEXT2 = wxNewId();
const long Fusion::ID_BUTTON1 = wxNewId();
const long Fusion::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Fusion,wxDialog)
	//(*EventTable(Fusion)
	//*)
END_EVENT_TABLE()

Fusion::Fusion(wxWindow* parent, Game * pJeu)
{
	//(*Initialize(Fusion)
	wxFlexGridSizer* FlexGridSizer3;
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
	StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/fusion.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer6->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("L\'importation permet de rajouter les éléments \nd\'un autre jeu à celui actuellement ouvert."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, this, _("Choisir les éléments à importer"));
	ImageCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	ImageCheck->SetValue(true);
	StaticBoxSizer1->Add(ImageCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	ScenesCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Scènes"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	ScenesCheck->SetValue(true);
	StaticBoxSizer1->Add(ScenesCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
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

	jeu = pJeu;
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
    wxFileDialog dialog( this, _( "Choisissez le jeu à ouvrir" ), "", "", "*.jgd" );
    dialog.ShowModal();

    if ( dialog.GetPath() == "" )
        return;

    Game secondGame;
    OpenSaveGame open(secondGame);
    open.OpenFromFile(static_cast<string>( dialog.GetPath() ));

    if ( ImageCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.images.size();i++)
        {
            if ( ChercherNomImage( jeu->images, secondGame.images.at(i).nom ) != -1)
            {
                wxString depart = _("Une image nommé \"");
                wxString fin = _("\" est déjà présente dans le jeu. Voulez vous la remplacer ?");
                if (wxMessageBox(depart+secondGame.images.at(i).nom+fin, "Une image de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    jeu->images.erase(jeu->images.begin() + ChercherNomImage( jeu->images, secondGame.images.at(i).nom ));
                    jeu->images.push_back(secondGame.images.at(i));
                }

            }
            else
                jeu->images.push_back(secondGame.images.at(i));
        }
    }
    if ( ScenesCheck->GetValue() )
    {
        for(unsigned int i = 0;i<secondGame.m_scenes.size();i++)
        {
            if ( ChercherScene( jeu->m_scenes, secondGame.m_scenes.at(i).name) != -1)
            {
                wxString depart = _("Une scène nommé \"");
                wxString fin = _("\" est déjà présente dans le jeu. Voulez vous la remplacer ?");
                if (wxMessageBox(depart+secondGame.m_scenes.at(i).name+fin, "Une scène de ce nom existe déjà",wxYES_NO ) == wxYES)
                {
                    //Remplacement
                    jeu->m_scenes.erase(jeu->m_scenes.begin() + ChercherScene( jeu->m_scenes, secondGame.m_scenes.at(i).name));
                    jeu->m_scenes.push_back(secondGame.m_scenes.at(i));
                }
            }
            else
                jeu->m_scenes.push_back(secondGame.m_scenes.at(i));
        }
    }

    wxLogMessage(_("Le jeu a été correctement fusionné."));
}
